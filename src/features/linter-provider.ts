'use strict';

import * as path from 'path';
import * as cp from 'child_process';

import * as vscode from 'vscode';
import { LoggingService } from '../services/logging-service';
import { FortranDocumentSelector, resolveVariables } from '../lib/tools';
import * as fg from 'fast-glob';
import { glob } from 'glob';

export default class FortranLintingProvider {
  constructor(private loggingService: LoggingService) {}

  private diagnosticCollection: vscode.DiagnosticCollection;

  private doModernFortranLint(textDocument: vscode.TextDocument) {
    const errorRegex =
      /^([a-zA-Z]:\\)*([^:]*):([0-9]+):([0-9]+):\s+(.*)\s+.*?\s+(Error|Warning|Fatal Error):\s(.*)$/gm;

    // Only lint Fortran (free, fixed) format files
    if (
      !FortranDocumentSelector().some(e => e.scheme === textDocument.uri.scheme) ||
      !FortranDocumentSelector().some(e => e.language === textDocument.languageId)
    ) {
      return;
    }

    let decoded = '';
    const diagnostics: vscode.Diagnostic[] = [];
    const command = this.getGfortranPath();
    const argList = this.constructArgumentList(textDocument);

    const filePath = path.parse(textDocument.fileName).dir;

    /*
     * reset localization settings to traditional C English behavior in case
     * gfortran is set up to use the system provided localization information,
     * so errorRegex can nevertheless be used to filter out errors and warnings
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
        decoded += data;
      });
      childProcess.stderr.on('data', data => {
        decoded += data;
      });
      childProcess.stderr.on('end', () => {
        let matchesArray: string[];
        while ((matchesArray = errorRegex.exec(decoded)) !== null) {
          const elements: string[] = matchesArray.slice(1); // get captured expressions
          const startLine = parseInt(elements[2]);
          const startColumn = parseInt(elements[3]);
          const type = elements[5]; // error or warning
          const severity =
            type.toLowerCase() === 'warning'
              ? vscode.DiagnosticSeverity.Warning
              : vscode.DiagnosticSeverity.Error;
          const message = elements[6];
          const range = new vscode.Range(
            new vscode.Position(startLine - 1, startColumn),
            new vscode.Position(startLine - 1, startColumn)
          );
          const diagnostic = new vscode.Diagnostic(range, message, severity);
          diagnostics.push(diagnostic);
        }

        this.diagnosticCollection.set(textDocument.uri, diagnostics);
      });
      childProcess.stdout.on('close', code => {
        console.log(`child process exited with code ${code}`);
      });
    } else {
      childProcess.on('error', (err: any) => {
        if (err.code === 'ENOENT') {
          vscode.window.showErrorMessage(
            "gfortran can't found on path, update your settings with a proper path or disable the linter."
          );
        }
      });
    }
  }

  private constructArgumentList(textDocument: vscode.TextDocument): string[] {
    const args = [
      '-fsyntax-only',
      '-cpp',
      '-fdiagnostics-show-option',
      ...this.getLinterExtraArgs(),
      this.getModOutputDir(),
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

  private static commandId = 'fortran.lint.runCodeAction';

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.Command[] {
    return;
    // let diagnostic: vscode.Diagnostic = context.diagnostics[0];
    // return [{
    // 	title: "Accept gfortran suggestion",
    // 	command: FortranLintingProvider.commandId,
    // 	arguments: [document, diagnostic.range, diagnostic.message]
    // }];
  }

  private command: vscode.Disposable;

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
    this.command.dispose();
  }

  private getModOutputDir(): string {
    const config = vscode.workspace.getConfiguration('fortran');
    let modout: string = config.get('linterModOutput', '');
    if (modout) {
      modout = '-J' + resolveVariables(modout);
      this.loggingService.logInfo(`Linter.moduleOutput`);
    }
    return modout;
  }

  private getIncludePaths(): string[] {
    const config = vscode.workspace.getConfiguration('fortran');
    const includePaths: string[] = config.get('includePaths', []);
    // Output the original include paths
    this.loggingService.logInfo(`Linter.include:\n${includePaths.join('\r\n')}`);
    // Resolve internal variables and expand glob patterns
    const resIncludePaths = includePaths.map(e => resolveVariables(e));
    // This needs to be after the resolvevariables since {} are used in globs
    try {
      const globIncPaths: string[] = fg.sync(resIncludePaths, {
        onlyDirectories: true,
        suppressErrors: false,
      });
      return globIncPaths;
      // Try to recover from fast-glob failing due to EACCES using slower more
      // robust glob.
    } catch (eacces) {
      this.loggingService.logWarning(`You lack read permissions for an include directory
          or more likely a glob match from the input 'includePaths' list. This can happen when
          using overly broad root level glob patters e.g. /usr/lib/** .
          No reason to worry. I will attempt to recover. 
          You should consider adjusting your 'includePaths' if linting performance is slow.`);
      this.loggingService.logWarning(`${eacces.message}`);
      try {
        const globIncPaths: string[] = [];
        for (const i of resIncludePaths) {
          // use '/' to match only directories and not files
          globIncPaths.push(...glob.sync(i + '/', { strict: false }));
        }
        return globIncPaths;
        // if we failed again then our includes are somehow wrong. Abort
      } catch (error) {
        this.loggingService.logError(`Failed to recover: ${error}`);
      }
    }
  }

  private getGfortranPath(): string {
    const config = vscode.workspace.getConfiguration('fortran');
    const gfortranPath = config.get('gfortranExecutable', 'gfortran');
    this.loggingService.logInfo(`using gfortran executable: ${gfortranPath}`);
    return gfortranPath;
  }

  private getLinterExtraArgs(): string[] {
    const config = vscode.workspace.getConfiguration('fortran');
    const args = config.get('linterExtraArgs', ['-Wall']).map(e => resolveVariables(e));
    this.loggingService.logInfo(`Linter.arguments:\n${args.join('\r\n')}`);
    return args.map(e => resolveVariables(e));
  }

  private getIncludeParams = (paths: string[]) => {
    return paths.map(path => `-I${path}`);
  };
}
