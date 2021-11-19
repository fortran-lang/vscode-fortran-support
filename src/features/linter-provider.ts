'use strict';

import * as path from 'path';
import * as cp from 'child_process';

import * as vscode from 'vscode';
import { LoggingService } from '../services/logging-service';
import { FortranDocumentSelector, resolveVariables } from '../lib/tools';
import * as fg from 'fast-glob';
import { glob } from 'glob';
import { arraysEqual } from '../lib/helper';

export class FortranLintingProvider {
  constructor(private logger: LoggingService = new LoggingService()) {}

  private diagnosticCollection: vscode.DiagnosticCollection;
  private compiler: string;
  private compilerPath: string;
  private cache = { includePaths: [''], globIncPaths: [''] };

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.Command[] {
    return;
  }

  public activate(subscriptions: vscode.Disposable[]) {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('Fortran');

    vscode.workspace.onDidOpenTextDocument(this.doModernFortranLint, this, subscriptions);
    vscode.workspace.onDidCloseTextDocument(
      textDocument => {
        this.diagnosticCollection.delete(textDocument.uri);
      },
      null,
      subscriptions
    );

    vscode.workspace.onDidSaveTextDocument(this.doModernFortranLint, this);

    // Run gfortran in all open fortran files
    vscode.workspace.textDocuments.forEach(this.doModernFortranLint, this);
  }

  public dispose(): void {
    this.diagnosticCollection.clear();
    this.diagnosticCollection.dispose();
    // this.command.dispose();
  }

  private doModernFortranLint(textDocument: vscode.TextDocument) {
    // Only lint Fortran (free, fixed) format files
    if (
      !FortranDocumentSelector().some(e => e.scheme === textDocument.uri.scheme) ||
      !FortranDocumentSelector().some(e => e.language === textDocument.languageId)
    ) {
      return;
    }

    let compilerOutput = '';
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
    const childProcess = cp.spawn(command, argList, {
      cwd: filePath,
      env: env,
    });

    if (childProcess.pid) {
      childProcess.stdout.on('data', (data: Buffer) => {
        compilerOutput += data;
      });
      childProcess.stderr.on('data', data => {
        compilerOutput += data;
      });
      childProcess.stderr.on('end', () => {
        const diagnostics = this.getLinterResults(compilerOutput);
        this.diagnosticCollection.set(textDocument.uri, diagnostics);
      });
      childProcess.on('error', err => {
        console.log(`ERROR: ${err}`);
      });
    } else {
      childProcess.on('error', (err: any) => {
        if (err.code === 'ENOENT') {
          vscode.window.showErrorMessage(
            "Linter can't be found in $PATH. Update your settings with a proper path or disable the linter."
          );
        }
      });
    }
  }

  private constructArgumentList(textDocument: vscode.TextDocument): string[] {
    const args = [
      ...this.getMandatoryLinterArgs(this.compiler),
      ...this.getLinterExtraArgs(this.compiler),
      this.getModOutputDir(this.compiler),
    ];
    const includePaths = this.getIncludePaths();

    const extensionIndex = textDocument.fileName.lastIndexOf('.');
    const fileNameWithoutExtension = textDocument.fileName.substring(0, extensionIndex);
    const argList = [
      ...args,
      ...this.getIncludeParams(includePaths), // include paths
      textDocument.fileName,
      `-o ${fileNameWithoutExtension}.mod`,
    ];

    return argList.map(arg => arg.trim()).filter(arg => arg !== '');
  }

  private getModOutputDir(compiler: string): string {
    const config = vscode.workspace.getConfiguration('fortran');
    let modout: string = config.get('linter.modOutput', '');
    let modFlag = '-J';
    switch (compiler) {
      case 'ifort':
        modFlag = '-module ';
        break;

      default:
        modFlag = '-J';
        break;
    }
    if (modout) {
      modout = modFlag + resolveVariables(modout);
      this.logger.logInfo(`Linter.moduleOutput`);
    }
    return modout;
  }

  /**
   * Resolves, interpolates and expands internal variables and glob patterns
   * for the `linter.includePaths` option. The results are stored in a cache
   * to improve performance
   *
   * @returns String Array of directories
   */
  private getIncludePaths(): string[] {
    const config = vscode.workspace.getConfiguration('fortran');
    let includePaths: string[] = config.get('linter.includePaths', []);

    // Check if we can use the cached results for the include directories no
    // need to evaluate the glob patterns everytime we call the linter
    if (arraysEqual(includePaths, this.cache['includePaths'])) {
      return this.cache['globIncPaths'];
    }

    // Update our cache input
    this.cache['includePaths'] = includePaths;
    // Output the original include paths
    this.logger.logInfo(`Linter.include:\n${includePaths.join('\r\n')}`);
    // Resolve internal variables and expand glob patterns
    const resIncludePaths = includePaths.map(e => resolveVariables(e));
    // fast-glob cannot work with Windows paths
    includePaths = includePaths.map(e => e.replace('/\\/g', '/'));
    // This needs to be after the resolvevariables since {} are used in globs
    try {
      const globIncPaths: string[] = fg.sync(resIncludePaths, {
        onlyDirectories: true,
        suppressErrors: false,
      });
      // Update values in cache
      this.cache['globIncPaths'] = globIncPaths;
      return globIncPaths;
      // Try to recover from fast-glob failing due to EACCES using slower more
      // robust glob.
    } catch (eacces) {
      this.logger.logWarning(`You lack read permissions for an include directory
          or more likely a glob match from the input 'includePaths' list. This can happen when
          using overly broad root level glob patters e.g. /usr/lib/** .
          No reason to worry. I will attempt to recover. 
          You should consider adjusting your 'includePaths' if linting performance is slow.`);
      this.logger.logWarning(`${eacces.message}`);
      try {
        const globIncPaths: string[] = [];
        for (const i of resIncludePaths) {
          // use '/' to match only directories and not files
          globIncPaths.push(...glob.sync(i + '/', { strict: false }));
        }
        this.cache['globIncPaths'] = globIncPaths;
        return globIncPaths;
        // if we failed again then our includes are somehow wrong. Abort
      } catch (error) {
        this.logger.logError(`Failed to recover: ${error}`);
      }
    }
  }

  /**
   * Returns the linter executable
   * @returns String with linter
   */
  private getLinterExecutable(): string {
    const config = vscode.workspace.getConfiguration('fortran.linter');

    this.compiler = config.get<string>('compiler', 'gfortran');
    this.compilerPath = config.get<string>('compilerPath', '');
    const linter = path.join(this.compilerPath, this.compiler);

    this.logger.logInfo(`using linter: ${this.compiler} located in: ${linter}`);

    return linter;
  }

  /**
   * Gets the additional linter arguments or sets the default ones if none are
   * specified.
   * Attempts to match and resolve any internal variables, but no glob support.
   *
   * @param compiler compiler name `gfortran`, `flang`, `ifort`
   * @returns
   */
  private getLinterExtraArgs(compiler: string): string[] {
    const config = vscode.workspace.getConfiguration('fortran');

    // The default 'trigger all warnings' flag is different depending on the compiler
    let args: string[];
    switch (compiler) {
      // fall-through
      case 'flang':
      case 'gfortran':
        args = ['-Wall'];
        break;

      case 'ifort':
        args = ['-warn', 'all'];
        break;

      default:
        args = [];
        break;
    }
    const user_args: string[] = config.get('linter.extraArgs');
    // If we have specified linter.extraArgs then replace default arguments
    if (user_args.length) args = config.get<string[]>('linter.extraArgs');
    this.logger.logInfo(`Linter.arguments:\n${args.join('\r\n')}`);

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
  private getLinterResults(msg: string): vscode.Diagnostic[] {
    const regex = this.getCompilerREGEX(this.compiler);
    const matches = [...msg.matchAll(regex)];
    // const matches = msg.matchAll(regex);
    const diagnostics: vscode.Diagnostic[] = [];

    switch (this.compiler) {
      case 'gfortran':
        for (const m of matches) {
          const g = m.groups;
          // NOTE: m[0] is the entire match and then the captured groups follow
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

      case 'flang':
        break;

      case 'ifort':
        for (const m of matches) {
          const g = m.groups;
          // NOTE: m[0] is the entire match and then the captured groups follow
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

      default:
        break;
    }
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
      case 'ifort':
        // see https://regex101.com/r/GZ0Lzz/2
        return /^(?<fname>(?:\w:\\)?.*)\((?<ln>\d+)\):\s*(?:#(?:(?<sev2>\w*):\s*(?<msg2>.*$))|(?<sev1>\w*)\s*(?<msg1>.*$)(?:\s*.*\s*)(?<cn>-*\^))/gm;

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
        return ['-fsyntax-only', '-cpp', '-fdiagnostics-show-option'];

      // ifort theoretically supports fsyntax-only too but I had trouble
      // getting it to work on my machine
      case 'ifort':
        return ['-syntax-only'];

      default:
        break;
    }
  }
}
