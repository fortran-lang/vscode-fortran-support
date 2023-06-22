'use strict';

import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { glob } from 'glob';
import * as semver from 'semver';
import * as vscode from 'vscode';
import which from 'which';

import * as pkg from '../../package.json';
import {
  BuildDebug,
  BuildRun,
  InitLint,
  CleanLintFiles,
  RescanLint,
  CleanLintDiagnostics,
} from '../commands/commands';
import { Logger } from '../services/logging';
import { GlobPaths } from '../util/glob-paths';
import { arraysEqual } from '../util/helper';
import {
  EXTENSION_ID,
  resolveVariables,
  promptForMissingTool,
  isFreeForm,
  spawnAsPromise,
  isFortran,
  shellTask,
} from '../util/tools';

import { GNULinter, GNUModernLinter, IntelLinter, LFortranLinter, NAGLinter } from './compilers';

const GNU = new GNULinter();
const GNU_NEW = new GNUModernLinter();
const INTEL = new IntelLinter();
const NAG = new NAGLinter();
const LFORTRAN = new LFortranLinter();

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
  public get initialize() {
    return this.config.get<boolean>('linter.initialize');
  }
  public get keepInitDiagnostics() {
    return this.config.get<boolean>('experimental.keepInitDiagnostics');
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
    // The words between the parenthesis can have all sorts of special characters
    // account for all of them just to be safe
    const regex = /^GNU Fortran \([\S ]+\) (?<msg>(?<version>\d+\.\d+\.\d+).*)$/gm;
    const output = child.stdout.toString();
    const match = regex.exec(output);
    const version = match ? match.groups.version : undefined;
    if (semver.valid(version)) {
      this.version = version;
      this.logger.info(`[lint] Found GNU Fortran version ${version}`);
      this.logger.debug(`[lint] Using Modern GNU Fortran diagnostics: ${this.modernGNU}`);
      return version;
    }
    this.logger.warn(`[lint] Unable to extract semver version ${match.groups.msg} from ${output}`);
    this.logger.warn(`[lint] Using GFortran with fallback options`);
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

  // Functions for combining options

  public get compilerExe(): string {
    return which.sync(this.compilerPath ? this.compilerPath : this.compiler);
  }
}

export class FortranLintingProvider {
  constructor(private logger: Logger = new Logger(), private storageUI: string = undefined) {
    // Register the Linter provider
    this.fortranDiagnostics = vscode.languages.createDiagnosticCollection('Fortran');
    this.settings = new LinterSettings(this.logger);
  }

  private fortranDiagnostics: vscode.DiagnosticCollection;
  private pathCache = new Map<string, GlobPaths>();
  private settings: LinterSettings;
  private linter: GNULinter | GNUModernLinter | IntelLinter | NAGLinter;
  private subscriptions: vscode.Disposable[] = [];

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.Command[] {
    return;
  }

  public async activate(): Promise<vscode.Disposable[]> {
    // Register Linter commands
    this.subscriptions.push(vscode.commands.registerCommand(RescanLint, this.rescanLinter, this));
    this.subscriptions.push(vscode.commands.registerCommand(InitLint, this.initialize, this));
    this.subscriptions.push(vscode.commands.registerCommand(CleanLintFiles, this.clean, this));
    this.subscriptions.push(
      vscode.commands.registerCommand(
        CleanLintDiagnostics,
        () => {
          this.fortranDiagnostics.clear();
        },
        this
      )
    );
    this.subscriptions.push(
      vscode.commands.registerTextEditorCommand(
        BuildRun,
        async (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args: any[]) => {
          await this.buildAndRun(textEditor);
        },
        this
      )
    );
    this.subscriptions.push(
      vscode.commands.registerTextEditorCommand(
        BuildDebug,
        async (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args: any[]) => {
          await this.buildAndDebug(textEditor);
        },
        this
      )
    );

    vscode.workspace.onDidOpenTextDocument(this.doLint, this, this.subscriptions);
    vscode.workspace.onDidCloseTextDocument(
      doc => {
        this.fortranDiagnostics.delete(doc.uri);
      },
      this,
      this.subscriptions
    );

    vscode.workspace.onDidSaveTextDocument(this.doLint, this, this.subscriptions);
    // Run the linter for all open documents i.e. docs loaded in memory
    vscode.workspace.textDocuments.forEach(this.doLint, this);

    // Update settings on Configuration change
    vscode.workspace.onDidChangeConfiguration(e => {
      this.settings.update(e);
    }, this.subscriptions);

    if (this.settings.initialize) this.initialize();

    return this.subscriptions;
  }

  public dispose(): void {
    this.fortranDiagnostics.clear();
    // this.fortranDiagnostics.dispose();
    this.subscriptions.forEach(d => d.dispose());
    // Empty the array after each subscription has been disposed
    this.subscriptions = [];
  }

  /**
   * Scan the workspace for Fortran files and lint them
   */
  private async initialize() {
    const files = await this.getFiles();
    const opts = {
      location: vscode.ProgressLocation.Window,
      title: 'Initialization',
      cancellable: true,
    };
    await vscode.window.withProgress(opts, async (progress, token) => {
      token.onCancellationRequested(() => {
        console.log('Canceled initialization');
        return;
      });
      let i = 0;
      for (const file of files) {
        i++;
        progress.report({
          message: `file ${i}/${files.length}`,
        });
        try {
          const doc = await vscode.workspace.openTextDocument(file);
          this.doLint(doc);
        } catch (error) {
          continue;
        }
      }
    });
    // Clear the diagnostics from the Problems console. FYI The textdocuments
    // are still open in memory
    if (!this.settings.keepInitDiagnostics) this.fortranDiagnostics.clear();
  }

  private async getFiles() {
    const ignore = '**/*.{mod,smod,a,o,so}';
    // const regex = '**/*';
    const regex = `**/*{${
      // Free Form
      pkg.contributes.languages[0].extensions.join(',') +
      ',' +
      // Fixed Form
      pkg.contributes.languages[1].extensions.join(',')
    }}`;
    const files = await vscode.workspace.findFiles(regex, ignore);
    const deps: vscode.Uri[] = [];
    for (const file of files) {
      if (file.scheme !== 'file') continue;
      try {
        await fs.promises.access(file.fsPath, fs.constants.R_OK);
        deps.push(file);
      } catch (error) {
        continue;
      }
    }
    return deps;
  }

  /**
   * Clean any build artifacts produced by the linter e.g. .mod, .smod files
   */
  private async clean() {
    if (!this.storageUI) return;
    const cacheDir = this.storageUI;
    const files = glob.sync(cacheDir + '/**/*.{mod,smod,o}');
    files.forEach(file => {
      fs.promises.rm(file);
    });
  }

  /**
   * Lint a document using the specified linter options
   * @param document TextDocument to lint
   * @returns An array of vscode.Diagnostic[]
   */
  private async doLint(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> | undefined {
    // Only lint if a compiler is specified
    if (!this.settings.enabled) return;
    // Only lint Fortran (free, fixed) format files
    if (!isFortran(document)) return;

    const output = await this.doBuild(document);
    if (!output) {
      // If the linter output is now empty, then there are no errors.
      // Discard the previous diagnostic state for this document
      if (this.fortranDiagnostics.has(document.uri)) this.fortranDiagnostics.delete(document.uri);
      this.logger.debug('[lint] No linting diagnostics to show');
      return;
    }
    let diagnostics: vscode.Diagnostic[] = this.linter.parse(output);
    this.logger.debug('[lint] Parsing output to vscode.Diagnostics', diagnostics);
    // Remove duplicates from the diagnostics array
    diagnostics = [...new Map(diagnostics.map(v => [JSON.stringify(v), v])).values()];
    this.logger.debug('[lint] Removing duplicates. vscode.Diagnostics are now:', diagnostics);
    this.fortranDiagnostics.set(document.uri, diagnostics);
    return diagnostics;
  }

  private async doBuild(document: vscode.TextDocument): Promise<string> | undefined {
    this.linter = this.getLinter(this.settings.compiler);
    const command = this.settings.compilerExe;
    const argList = this.constructArgumentList(document);
    const filePath = path.parse(document.fileName).dir;

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
    this.logger.debug(
      `[build.single] compiler: "${this.settings.compiler}" located in: "${command}"`
    );
    this.logger.info(`[build.single] Compiler query command line: ${command} ${argList.join(' ')}`);

    try {
      const fypp = await this.getFyppProcess(document);

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
        this.logger.debug(`[build.single] Compiler output:\n${output}`);
        return output;
      } catch (err) {
        this.logger.error(`[build.single] Compiler error:`, err);
        console.error(`ERROR: ${err}`);
      }
    } catch (fyppErr) {
      this.logger.error(`[build.single] fypp error:`, fyppErr);
      console.error(`ERROR: fypp ${fyppErr}`);
    }
  }

  private async buildAndRun(textEditor: vscode.TextEditor) {
    return this.buildAndDebug(textEditor, false);
  }

  /**
   * Compile and run the current file using the provided linter options.
   * It has the ability to launch a Debug session or just run the executable.
   * @param textEditor a text editor instance
   * @param debug performing a debug build or not
   */
  private async buildAndDebug(textEditor: vscode.TextEditor, debug = true): Promise<void> {
    const textDocument = textEditor.document;
    this.linter = this.getLinter(this.settings.compiler);
    const command = this.settings.compilerExe;
    let argList = [...this.constructArgumentList(textDocument)];
    // Remove mandatory linter args, used for mock compilation
    argList = argList.filter(arg => !this.linter.args.includes(arg));
    if (debug) argList.push('-g'); // add debug symbols flag, same for all compilers
    try {
      await shellTask(command, argList, 'Build Fortran file');
      const folder: vscode.WorkspaceFolder = vscode.workspace.getWorkspaceFolder(
        textEditor.document.uri
      );
      const selectedConfig: vscode.DebugConfiguration = {
        name: `${debug ? 'Debug' : 'Run'} Fortran file`,
        // This relies on the C/C++ debug adapters
        type: process.platform === 'win32' ? 'cppvsdbg' : 'cppdbg',
        request: 'launch',
        program: `${textDocument.fileName}.o`,
        cwd: folder.uri.fsPath,
      };
      await vscode.debug.startDebugging(folder, selectedConfig, { noDebug: !debug });
      return;
    } catch (err) {
      this.logger.error(`[build] Compiling ${textDocument.fileName} failed:`, err);
      this.logger.show(true); // Keep focus on editor
      console.error(`ERROR: ${err}`);
    }
  }

  private getLinter(compiler: string): GNULinter | GNUModernLinter | IntelLinter | NAGLinter {
    switch (compiler) {
      case 'gfortran':
        if (this.settings.modernGNU) return GNU_NEW;
        return GNU;
      case 'ifx':
      case 'ifort':
        return INTEL;
      case 'nagfor':
        return NAG;
      case 'lfortran':
        return LFORTRAN;
      default:
        return GNU;
    }
  }

  private constructArgumentList(textDocument: vscode.TextDocument): string[] {
    const args = [...this.linter.args, ...this.linterExtraArgs, ...this.modOutputDir];
    const opt = 'linter.includePaths';
    const includePaths = this.getGlobPathsFromSettings(opt);
    this.logger.debug(`[lint] glob paths:`, this.pathCache.get(opt).globs);
    this.logger.debug(`[lint] resolved paths:`, this.pathCache.get(opt).paths);

    // const extensionIndex = textDocument.fileName.lastIndexOf('.');
    // const fileNameWithoutExtension = textDocument.fileName.substring(0, extensionIndex);
    const fortranSource: string[] = this.settings.fyppEnabled
      ? ['-xf95', '-']
      : [textDocument.fileName];

    const argList = [
      ...args,
      ...this.getIncludeParams(includePaths), // include paths
      // Explicitly set the type for Fortran in case the user has associated
      // fixed-form extensions to free-form, or vice versa
      isFreeForm(textDocument) ? this.linter.freeFlag : this.linter.fixedFlag,
      '-o',
      `${textDocument.fileName}.o`,
      ...fortranSource,
    ];

    return argList.map(arg => arg.trim()).filter(arg => arg !== '');
  }

  private get modOutputDir(): string[] {
    let modout: string = this.settings.modOutput;
    const modFlag = this.linter.modFlag;
    // Return the workspaces cache directory if the user has not set a custom path
    if (modout === '') modout = this.storageUI;
    if (!modout) return [];

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
   * Gets the additional linter arguments or sets the default ones if none are
   * specified.
   * Attempts to match and resolve any internal variables, but no glob support.
   *
   * @returns
   */
  private get linterExtraArgs(): string[] {
    const config = vscode.workspace.getConfiguration(EXTENSION_ID);
    // Get the linter arguments from the settings via a deep copy
    let args: string[] = [...this.linter.argsDefault];
    const user_args: string[] = this.settings.args;
    // If we have specified linter.extraArgs then replace default arguments
    if (user_args.length > 0) args = user_args.slice();
    // gfortran and flang have compiler flags for restricting the width of
    // the code.
    // You can always override by passing in the correct args as extraArgs
    if (this.linter.name === 'gfortran') {
      const ln: number = config.get('fortls.maxLineLength');
      const lnStr: string = ln === -1 ? 'none' : ln.toString();
      // Prepend via `unshift` to make sure user defined flags overwrite
      // the default ones we provide here.
      args.unshift(`-ffree-line-length-${lnStr}`, `-ffixed-line-length-${lnStr}`);
    }
    if (args.length > 0) this.logger.debug(`[lint] arguments:`, args);

    // Resolve internal variables but do not apply glob pattern matching
    return args.map(e => resolveVariables(e));
  }

  private getIncludeParams = (paths: string[]) => {
    return paths.map(path => `-I${path}`);
  };

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
      await promptForMissingTool('fypp', msg, 'Python', ['Install']);
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
