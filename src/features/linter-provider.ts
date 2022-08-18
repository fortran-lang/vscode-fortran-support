'use strict';

import * as path from 'path';
import * as cp from 'child_process';
import which from 'which';
import * as semver from 'semver';
import * as vscode from 'vscode';

import { Logger } from '../services/logging';
import {
  EXTENSION_ID,
  FortranDocumentSelector,
  resolveVariables,
  promptForMissingTool,
  isFreeForm,
  spawnAsPromise,
} from '../lib/tools';
import { arraysEqual } from '../lib/helper';
import { RescanLint } from './commands';
import { GlobPaths } from '../lib/glob-paths';

export class LinterSettings {
  private _modernGNU: boolean;
  private _version: string;
  private config: vscode.WorkspaceConfiguration;

  constructor(private logger: Logger = new Logger()) {
    this.config = vscode.workspace.getConfiguration(EXTENSION_ID);
    this.GNUVersion(this.compiler); // populates version & modernGNU
  }
  public update(event: vscode.ConfigurationChangeEvent) {
    console.log('update settings');
    if (event.affectsConfiguration(`${EXTENSION_ID}.linter`)) {
      this.config = vscode.workspace.getConfiguration(EXTENSION_ID);
    }
  }

  public get enabled(): boolean {
    return this.config.get<string>('linter.compiler') !== 'Disabled';
  }
  public get compiler(): string {
    const compiler = this.config.get<string>('linter.compiler');
    return compiler;
  }
  public get compilerPath(): string {
    return this.config.get<string>('linter.compilerPath');
  }
  public get include(): string[] {
    return this.config.get<string[]>('linter.includePaths');
  }
  public get args(): string[] {
    return this.config.get<string[]>('linter.extraArgs');
  }
  public get modOutput(): string {
    return this.config.get<string>('linter.modOutput');
  }

  // END OF API SETTINGS

  /**
   * Returns the version of the compiler and populates the internal variables
   * `modernGNU` and `version`.
   * @note Only supports `gfortran`
   */
  private GNUVersion(compiler: string): string | undefined {
    // Only needed for gfortran's diagnostics flag
    this.modernGNU = false;
    if (compiler !== 'gfortran') return;
    const child = cp.spawnSync(compiler, ['--version']);
    if (child.error || child.status !== 0) {
      this.logger.error(`[lint] Could not spawn ${compiler} to check version.`);
      return;
    }
    // State the variables explicitly bc the TypeScript compiler on the CI
    // seemed to optimise away the stdout and regex would return null
    const regex = /^GNU Fortran \([\w.-]+\) (?<version>.*)$/gm;
    const output = child.stdout.toString();
    const match = regex.exec(output);
    const version = match ? match.groups.version : undefined;
    if (semver.valid(version)) {
      this.version = version;
      this.logger.info(`[lint] Found GNU Fortran version ${version}`);
      this.logger.debug(`[lint] Using Modern GNU Fortran diagnostics: ${this.modernGNU}`);
      return version;
    } else {
      this.logger.error(`[lint] invalid compiler version: ${version}`);
    }
  }

  public get version(): string {
    return this._version;
  }
  private set version(version: string) {
    this._version = version;
    this.modernGNU = semver.gte(version, '11.0.0');
  }
  public get modernGNU(): boolean {
    return this._modernGNU;
  }
  private set modernGNU(modernGNU: boolean) {
    this._modernGNU = modernGNU;
  }

  // FYPP options

  public get fyppEnabled(): boolean {
    // FIXME: fypp currently works only with gfortran
    if (this.compiler !== 'gfortran') {
      this.logger.warn(`[lint] fypp currently only supports gfortran.`);
      return false;
    }
    return this.config.get<boolean>('linter.fypp.enabled');
  }
  public get fyppPath(): string {
    return this.config.get<string>('linter.fypp.path');
  }
  public get fyppDefinitions(): { [name: string]: string } {
    return this.config.get<{ [name: string]: string }>('linter.fypp.definitions');
  }
  public get fyppIncludes(): string[] {
    return this.config.get<string[]>('linter.fypp.includes');
  }
  public get fyppLineNumberingMode(): string {
    return this.config.get<string>('linter.fypp.lineNumberingMode');
  }
  public get fyppLineMarkerFormat(): string {
    return this.config.get<string>('linter.fypp.lineMarkerFormat');
  }
  public get fyppExtraArgs(): string[] {
    return this.config.get<string[]>('linter.fypp.extraArgs');
  }
}

export class FortranLintingProvider {
  constructor(private logger: Logger = new Logger()) {
    // Register the Linter provider
    this.fortranDiagnostics = vscode.languages.createDiagnosticCollection('Fortran');
    this.settings = new LinterSettings(this.logger);
  }

  private fortranDiagnostics: vscode.DiagnosticCollection;
  private compiler: string;
  private compilerPath: string;
  private pathCache = new Map<string, GlobPaths>();
  private settings: LinterSettings;

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.Command[] {
    return;
  }

  public async activate(subscriptions: vscode.Disposable[]) {
    // Register Linter commands
    subscriptions.push(vscode.commands.registerCommand(RescanLint, this.rescanLinter, this));

    vscode.workspace.onDidOpenTextDocument(this.doLint, this, subscriptions);
    vscode.workspace.onDidCloseTextDocument(
      textDocument => {
        this.fortranDiagnostics.delete(textDocument.uri);
      },
      null,
      subscriptions
    );

    vscode.workspace.onDidSaveTextDocument(this.doLint, this);

    // Run gfortran in all open fortran files
    vscode.workspace.textDocuments.forEach(this.doLint, this);

    // Update settings on Configuration change
    vscode.workspace.onDidChangeConfiguration(e => {
      this.settings.update(e);
    });
  }

  public dispose(): void {
    this.fortranDiagnostics.clear();
    this.fortranDiagnostics.dispose();
  }

  private async doLint(textDocument: vscode.TextDocument) {
    // Only lint if a compiler is specified
    if (!this.settings.enabled) return;
    // Only lint Fortran (free, fixed) format files
    if (
      !FortranDocumentSelector().some(e => e.scheme === textDocument.uri.scheme) ||
      !FortranDocumentSelector().some(e => e.language === textDocument.languageId)
    ) {
      return;
    }

    const command = this.getLinterExecutable();
    const argList = this.constructArgumentList(textDocument);
    const filePath = path.parse(textDocument.fileName).dir;

    /*
     * reset localization settings to traditional C English behavior in case
     * gfortran is set up to use the system provided localization information,
     * so linterREGEX can nevertheless be used to filter out errors and warnings
     *
     * see also: https://gcc.gnu.org/onlinedocs/gcc/Environment-Variables.html
     */
    const env = process.env;
    env.LC_ALL = 'C';
    if (process.platform === 'win32') {
      // Windows needs to know the path of other tools
      if (!env.Path.includes(path.dirname(command))) {
        env.Path = `${path.dirname(command)}${path.delimiter}${env.Path}`;
      }
    }
    this.logger.info(`[lint] Compiler query command line: ${command} ${argList.join(' ')}`);

    try {
      const fypp = await this.getFyppProcess(textDocument);

      try {
        // The linter output is in the stderr channel
        const [stdout, stderr] = await spawnAsPromise(
          command,
          argList,
          { cwd: filePath, env: env },
          fypp?.[0], // pass the stdout from fypp to the linter as stdin
          true
        );
        const output: string = stdout + stderr;
        this.logger.debug(`[lint] Compiler output:\n${output}`);
        let diagnostics: vscode.Diagnostic[] = this.parseLinterOutput(output);
        // Remove duplicates from the diagnostics array
        diagnostics = [...new Map(diagnostics.map(v => [JSON.stringify(v), v])).values()];
        this.fortranDiagnostics.set(textDocument.uri, diagnostics);
        return diagnostics;
      } catch (err) {
        this.logger.error(`[lint] Compiler error:`, err);
        console.error(`ERROR: ${err}`);
      }
    } catch (fyppErr) {
      this.logger.error(`[lint] fypp error:`, fyppErr);
      console.error(`ERROR: fypp ${fyppErr}`);
    }
  }

  private constructArgumentList(textDocument: vscode.TextDocument): string[] {
    const args = [
      ...this.getMandatoryLinterArgs(this.compiler),
      ...this.getLinterExtraArgs(this.compiler),
      ...this.getModOutputDir(this.compiler),
    ];
    const opt = 'linter.includePaths';
    const includePaths = this.getGlobPathsFromSettings(opt);
    this.logger.debug(`[lint] glob paths:`, this.pathCache.get(opt).globs);
    this.logger.debug(`[lint] resolved paths:`, this.pathCache.get(opt).paths);

    const extensionIndex = textDocument.fileName.lastIndexOf('.');
    const fileNameWithoutExtension = textDocument.fileName.substring(0, extensionIndex);
    const fortranSource: string[] = this.settings.fyppEnabled
      ? ['-xf95', isFreeForm(textDocument) ? '-ffree-form' : '-ffixed-form', '-']
      : [textDocument.fileName];

    const argList = [
      ...args,
      ...this.getIncludeParams(includePaths), // include paths
      '-o',
      `${fileNameWithoutExtension}.mod`,
      ...fortranSource,
    ];

    return argList.map(arg => arg.trim()).filter(arg => arg !== '');
  }

  private getModOutputDir(compiler: string): string[] {
    let modout: string = this.settings.modOutput;
    let modFlag = '';
    // Return if no mod output directory is specified
    if (modout === '') return [];
    switch (compiler) {
      case 'flang':
      case 'gfortran':
        modFlag = '-J';
        break;

      case 'ifx':
      case 'ifort':
        modFlag = '-module';
        break;

      case 'nagfor':
        modFlag = '-mdir';
        break;

      default:
        modFlag = '';
        break;
    }

    modout = resolveVariables(modout);
    this.logger.debug(`[lint] moduleOutput: ${modFlag} ${modout}`);
    return [modFlag, modout];
  }

  /**
   * Resolves, interpolates and expands internal variables and glob patterns
   * for the `linter.includePaths` option. The results are stored in a cache
   * to improve performance
   *
   * @param opt String representing a VS Code setting e.g. `linter.includePaths`
   *
   * @returns String Array of directories
   */
  private getGlobPathsFromSettings(opt: string): string[] {
    const config = vscode.workspace.getConfiguration(EXTENSION_ID);
    const globPaths: string[] = config.get(opt);
    // Initialise cache key and value if vscode option is not present
    if (!this.pathCache.has(opt)) {
      this.logger.debug(`[lint] Initialising cache for ${opt}`);
      try {
        this.pathCache.set(opt, new GlobPaths(globPaths));
      } catch (error) {
        const msg = `[lint] Error initialising cache for ${opt}`;
        this.logger.error(msg, error);
        vscode.window.showErrorMessage(`${msg}: ${error}`);
      }
    }
    // Check if cache is valid, and if so return cached value
    if (arraysEqual(globPaths, this.pathCache.get(opt).globs)) {
      return this.pathCache.get(opt).paths;
    }
    // Update cache and return new values
    try {
      this.pathCache.get(opt).update(globPaths);
    } catch (error) {
      const msg = `[lint] Error initialising cache for ${opt}`;
      this.logger.error(msg, error);
      vscode.window.showErrorMessage(`${msg}: ${error}`);
    }
    this.logger.debug(`[lint] ${opt} changed, updating cache`);
    return this.pathCache.get(opt).paths;
  }

  /**
   * Returns the linter executable i.e. this.compilerPath
   * @returns String with linter
   */
  private getLinterExecutable(): string {
    this.compiler = this.settings.compiler;
    this.compilerPath = this.settings.compilerPath;
    if (this.compilerPath === '') this.compilerPath = which.sync(this.compiler);
    this.logger.debug(`[lint] binary: "${this.compiler}" located in: "${this.compilerPath}"`);
    return this.compilerPath;
  }

  /**
   * Gets the additional linter arguments or sets the default ones if none are
   * specified.
   * Attempts to match and resolve any internal variables, but no glob support.
   *
   * @param compiler compiler name `gfortran`, `ifort`, `ifx`
   * @returns
   */
  private getLinterExtraArgs(compiler: string): string[] {
    const config = vscode.workspace.getConfiguration(EXTENSION_ID);

    // The default 'trigger all warnings' flag is different depending on the compiler
    let args: string[];
    switch (compiler) {
      // fall-through
      case 'flang':
      case 'gfortran':
        args = ['-Wall'];
        break;

      case 'ifx':
      case 'ifort':
        args = ['-warn', 'all'];
        break;

      default:
        args = [];
        break;
    }
    const user_args: string[] = this.settings.args;
    // If we have specified linter.extraArgs then replace default arguments
    if (user_args.length > 0) args = user_args.slice();
    // gfortran and flang have compiler flags for restricting the width of
    // the code.
    // You can always override by passing in the correct args as extraArgs
    if (compiler === 'gfortran') {
      const ln: number = config.get('fortls.maxLineLength');
      const lnStr: string = ln === -1 ? 'none' : ln.toString();
      args.push(`-ffree-line-length-${lnStr}`, `-ffixed-line-length-${lnStr}`);
    }
    if (args.length > 0) this.logger.debug(`[lint] arguments:`, args);

    // Resolve internal variables but do not apply glob pattern matching
    return args.map(e => resolveVariables(e));
  }

  private getIncludeParams = (paths: string[]) => {
    return paths.map(path => `-I${path}`);
  };

  /**
   * Extract using the appropriate compiler REGEX from the input `msg` the
   * information required for vscode to report diagnostics.
   *
   * @param msg The message string produced by the mock compilation
   * @returns Array of diagnostics for errors, warnings and infos
   */
  private parseLinterOutput(msg: string): vscode.Diagnostic[] {
    // Ideally these regexes should be defined inside the linterParser functions
    // however we would have to rewrite out linting unit tests
    const regex = this.getCompilerREGEX(this.compiler);
    const matches = [...msg.matchAll(regex)];
    switch (this.compiler) {
      case 'gfortran':
        if (this.settings.modernGNU) return this.linterParserGCCPlainText(matches);
        return this.linterParserGCC(matches);

      case 'ifx':
      case 'ifort':
        return this.linterParserIntel(matches);

      case 'nagfor':
        return this.linterParserNagfor(matches);

      default:
        vscode.window.showErrorMessage(`${this.compiler} compiler is not supported yet.`);
        break;
    }
  }

  private linterParserGCC(matches: RegExpMatchArray[]): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    for (const m of matches) {
      const g = m.groups;
      // m[0] is the entire match and then the captured groups follow
      const fname: string = g['fname'] !== undefined ? g['fname'] : g['bin'];
      const lineNo: number = g['ln'] !== undefined ? parseInt(g['ln']) : 1;
      const colNo: number = g['cn'] !== undefined ? parseInt(g['cn']) : 1;
      const msg_type: string = g['sev1'] !== undefined ? g['sev1'] : g['sev2'];
      const msg: string = g['msg1'] !== undefined ? g['msg1'] : g['msg2'];

      const range = new vscode.Range(
        new vscode.Position(lineNo - 1, colNo),
        new vscode.Position(lineNo - 1, colNo)
      );

      let severity: vscode.DiagnosticSeverity;
      switch (msg_type.toLowerCase()) {
        case 'error':
        case 'fatal error':
          severity = vscode.DiagnosticSeverity.Error;
          break;
        case 'warning':
          severity = vscode.DiagnosticSeverity.Warning;
          break;
        case 'info': // gfortran does not produce info AFAIK
          severity = vscode.DiagnosticSeverity.Information;
          break;
        default:
          severity = vscode.DiagnosticSeverity.Error;
          break;
      }

      const d = new vscode.Diagnostic(range, msg, severity);
      diagnostics.push(d);
    }
    return diagnostics;
  }

  private linterParserGCCPlainText(matches: RegExpMatchArray[]): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    for (const m of matches) {
      const g = m.groups;
      // m[0] is the entire match and then the captured groups follow
      const lineNo: number = parseInt(g['ln']);
      const colNo: number = parseInt(g['cn']);
      const msgSev: string = g['sev'];
      const msg: string = g['msg'];

      const range = new vscode.Range(
        new vscode.Position(lineNo - 1, colNo),
        new vscode.Position(lineNo - 1, colNo)
      );

      let severity: vscode.DiagnosticSeverity;
      switch (msgSev.toLowerCase()) {
        case 'error':
        case 'fatal error':
          severity = vscode.DiagnosticSeverity.Error;
          break;
        case 'warning':
          severity = vscode.DiagnosticSeverity.Warning;
          break;
        case 'info': // gfortran does not produce info AFAIK
          severity = vscode.DiagnosticSeverity.Information;
          break;
        default:
          severity = vscode.DiagnosticSeverity.Error;
          break;
      }
      diagnostics.push(new vscode.Diagnostic(range, msg, severity));
    }
    return diagnostics;
  }

  private linterParserIntel(matches: RegExpMatchArray[]): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    for (const m of matches) {
      const g = m.groups;
      // m[0] is the entire match and then the captured groups follow
      const fname: string = g['fname'];
      const lineNo: number = parseInt(g['ln']);
      const msg_type: string = g['sev1'] !== undefined ? g['sev1'] : g['sev2'];
      const msg: string = g['msg1'] !== undefined ? g['msg1'] : g['msg2'];
      const colNo: number = g['cn'] !== undefined ? g['cn'].length : 1;

      const range = new vscode.Range(
        new vscode.Position(lineNo - 1, colNo),
        new vscode.Position(lineNo - 1, colNo)
      );

      let severity: vscode.DiagnosticSeverity;
      switch (msg_type.toLowerCase()) {
        case 'error':
        case 'fatal error':
          severity = vscode.DiagnosticSeverity.Error;
          break;
        case 'warning':
        case 'remark': // ifort's version of warning is remark
          severity = vscode.DiagnosticSeverity.Warning;
          break;
        case 'info': // ifort does not produce info during compile-time AFAIK
          severity = vscode.DiagnosticSeverity.Information;
          break;
        default:
          severity = vscode.DiagnosticSeverity.Error;
          break;
      }

      const d = new vscode.Diagnostic(range, msg, severity);
      diagnostics.push(d);
    }
    return diagnostics;
  }

  private linterParserNagfor(matches: RegExpMatchArray[]) {
    const diagnostics: vscode.Diagnostic[] = [];
    for (const m of matches) {
      const g = m.groups;
      const fname: string = g['fname'];
      const lineNo: number = parseInt(g['ln']);
      const msg_type: string = g['sev1'];
      const msg: string = g['msg1'];
      // NAGFOR does not have a column number, so get the entire line
      const range = vscode.window.activeTextEditor.document.lineAt(lineNo - 1).range;

      let severity: vscode.DiagnosticSeverity;
      switch (msg_type.toLowerCase()) {
        case 'panic':
        case 'fatal':
        case 'error':
          severity = vscode.DiagnosticSeverity.Error;
          break;

        case 'extension':
        case 'questionable':
        case 'deleted feature used':
        case 'warning':
          severity = vscode.DiagnosticSeverity.Warning;
          break;

        case 'remark':
        case 'note':
        case 'info':
          severity = vscode.DiagnosticSeverity.Information;
          break;

        // fatal error, sequence error, etc.
        default:
          severity = vscode.DiagnosticSeverity.Error;
          console.log('Using default Error Severity for: ' + msg_type);
          break;
      }

      const d = new vscode.Diagnostic(range, msg, severity);
      diagnostics.push(d);
    }
    return diagnostics;
  }

  /**
   * Different compilers, display errors in different ways, hence we need
   * different regular expressions to interpret their output.
   * This function returns the appropriate regular expression.
   *
   * @param compiler Compiler name: gfortran, flang, ifort
   * @returns `RegExp` for linter
   */
  private getCompilerREGEX(compiler: string): RegExp {
    // `severity` can be: Warning, Error, Fatal Error
    switch (compiler) {
      /* 
       -------------------------------------------------------------------------
       COMPILER MESSAGE ANATOMY:
       filename:line:column:
      
         line |  failing line of code
              |
       severity: message
       -------------------------------------------------------------------------
       ALTERNATIVE COMPILER MESSAGE ANATOMY: (for includes, failed args and C++)
       compiler-bin: severity: message
       -------------------------------------------------------------------------
       */
      case 'gfortran':
        /**
         -----------------------------------------------------------------------
         COMPILER: MESSAGE ANATOMY:
         file:line:column: Severity: msg
         -----------------------------------------------------------------------
         see https://regex101.com/r/73TZQn/1
         */
        if (this.settings.modernGNU) {
          return /(?<fname>(?:\w:\\)?.*):(?<ln>\d+):(?<cn>\d+): (?<sev>Error|Warning|Fatal Error): (?<msg>.*)/g;
        }
        // see https://regex101.com/r/hZtk3f/1
        return /(?:^(?<fname>(?:\w:\\)?.*):(?<ln>\d+):(?<cn>\d+):(?:\s+.*\s+.*?\s+)(?<sev1>Error|Warning|Fatal Error):\s(?<msg1>.*)$)|(?:^(?<bin>\w+):\s*(?<sev2>\w+\s*\w*):\s*(?<msg2>.*)$)/gm;

      // TODO: write the regex
      case 'flang':
        return /^([a-zA-Z]:\\)*([^:]*):([0-9]+):([0-9]+):\s+(.*)\s+.*?\s+(Error|Warning|Fatal Error):\s(.*)$/gm;

      /*
       COMPILER MESSAGE ANATOMY:
       filename(linenum): severity #error number: message
                          failing line of code
       ----------------------^
       */
      case 'ifx':
      case 'ifort':
        // see https://regex101.com/r/GZ0Lzz/2
        return /^(?<fname>(?:\w:\\)?.*)\((?<ln>\d+)\):\s*(?:#(?:(?<sev2>\w*):\s*(?<msg2>.*$))|(?<sev1>\w*)\s*(?<msg1>.*$)(?:\s*.*\s*)(?<cn>-*\^))/gm;

      /*
       See Section 7 of the NAGFOR manual, although it is not accurate with regards
       to all the possible messages.
       severity: filename, line No.: message 
       */
      case 'nagfor':
        return /^(?<sev1>Remark|Info|Note|Warning|Questionable|Extension|Obsolescent|Deleted feature used|(?:[\w]+ )?Error|Fatal|Panic)(\(\w+\))?: (?<fname>[\S ]+), line (?<ln>\d+): (?<msg1>.+)$/gm;

      default:
        vscode.window.showErrorMessage('Unsupported linter, change your linter.compiler option');
    }
  }

  /**
   * Every compiler has different flags to generate diagnostics, this functions
   * ensures that the default arguments passed are valid.
   *
   * @note Check with the appropriate compiler documentation before altering
   * any of these
   *
   * @param compiler Compiler name: gfortran, flang, ifort
   * @returns Array of valid compiler arguments
   */
  private getMandatoryLinterArgs(compiler: string): string[] {
    switch (compiler) {
      case 'flang':
      case 'gfortran':
        if (this.settings.modernGNU) {
          return ['-fsyntax-only', '-cpp', '-fdiagnostics-plain-output'];
        }
        return ['-fsyntax-only', '-cpp', '-fdiagnostics-show-option'];

      // ifort theoretically supports fsyntax-only too but I had trouble
      // getting it to work on my machine
      case 'ifx':
      case 'ifort':
        return ['-syntax-only', '-fpp'];

      case 'nagfor':
        return ['-M', '-quiet'];

      default:
        break;
    }
  }

  /**
   * Regenerate the cache for the include files paths of the linter
   */
  private rescanLinter() {
    const opt = 'linter.includePaths';
    this.logger.debug(`[lint] Resetting linter include paths cache`);
    this.logger.debug(`[lint] Current linter include paths cache:`, this.pathCache.get(opt).globs);
    this.pathCache.set(opt, new GlobPaths());
    this.getGlobPathsFromSettings(opt);
    this.logger.debug(`[lint] glob paths:`, this.pathCache.get(opt).globs);
    this.logger.debug(`[lint] resolved paths:`, this.pathCache.get(opt).paths);
  }

  /**
   * Parse a source file through the `fypp` preprocessor and return and active
   * process to parse as input to the main linter.
   *
   * This procedure does implements all the settings interfaces with `fypp`
   * and checks the system for `fypp` prompting to install it if missing.
   * @param document File name to pass to `fypp`
   * @returns Async spawned Promise containing `fypp` Tuple [`stdout` `stderr`] or `undefined` if `fypp` is disabled
   */
  private async getFyppProcess(document: vscode.TextDocument): Promise<[string, string]> {
    if (!this.settings.fyppEnabled) return undefined;
    let fypp: string = this.settings.fyppPath;
    fypp = process.platform !== 'win32' ? fypp : `${fypp}.exe`;

    // Check if the fypp is installed
    if (!which.sync(fypp, { nothrow: true })) {
      this.logger.warn(`[lint] fypp not detected in your system. Attempting to install now.`);
      const msg = `Installing fypp through pip with --user option`;
      promptForMissingTool('fypp', msg, 'Python', ['Install']);
    }
    const args: string[] = ['--line-numbering'];

    // Include paths to fypp, different from main linters include paths
    // fypp includes typically pointing to folders in a projects source tree.
    // While the -I options, you pass to a compiler in order to look up mod-files,
    // are typically pointing to folders in the projects build tree.
    const includePaths = this.settings.fyppIncludes;
    if (includePaths.length > 0) {
      args.push(...this.getIncludeParams(this.getGlobPathsFromSettings(`linter.fypp.includes`)));
    }

    // Set the output to Fixed Format if the source is Fixed
    if (!isFreeForm(document)) args.push('--fixed-format');

    const fypp_defs: { [name: string]: string } = this.settings.fyppDefinitions;
    if (Object.keys(fypp_defs).length > 0) {
      // Preprocessor definitions, merge with pp_defs from fortls?
      Object.entries(fypp_defs).forEach(([key, val]) => {
        if (val) args.push(`-D${key}=${val}`);
        else args.push(`-D${key}`);
      });
    }
    args.push(`--line-numbering-mode=${this.settings.fyppLineNumberingMode}`);
    args.push(`--line-marker-format=${this.settings.fyppLineMarkerFormat}`);
    args.push(...`${this.settings.fyppExtraArgs}`);

    // The file to be preprocessed
    args.push(document.fileName);

    const filePath = path.parse(document.fileName).dir;
    return await spawnAsPromise(fypp, args, { cwd: filePath }, undefined);
  }
}
