'use strict'

import * as path from 'path'
import * as cp from 'child_process'
import { FORTRAN_DOCUMENT_SELECTOR, getIncludeParams } from '../lib/helper'

import * as vscode from 'vscode'
import { LoggingService } from '../services/logging-service'
import { resolveVariables } from '../lib/tools'
import * as fg from 'fast-glob'

export default class FortranLintingProvider {
  constructor(private loggingService: LoggingService) { }

  private diagnosticCollection: vscode.DiagnosticCollection

  private doModernFortranLint(textDocument: vscode.TextDocument) {
    const errorRegex: RegExp =
      /^([a-zA-Z]:\\)*([^:]*):([0-9]+):([0-9]+):\s+(.*)\s+.*?\s+(Error|Warning|Fatal Error):\s(.*)$/gm

    // Only lint Fortran (free, fixed) format files
    if (
      !FORTRAN_DOCUMENT_SELECTOR.some(e => e.scheme === textDocument.uri.scheme) ||
      !FORTRAN_DOCUMENT_SELECTOR.some(e => e.language === textDocument.languageId)
    ) {
      return
    }

    let decoded = ''
    let diagnostics: vscode.Diagnostic[] = []
    let command = this.getGfortranPath()
    let argList = this.constructArgumentList(textDocument)

    let filePath = path.parse(textDocument.fileName).dir

    /*
     * reset localization settings to traditional C English behavior in case
     * gfortran is set up to use the system provided localization information,
     * so errorRegex can nevertheless be used to filter out errors and warnings
     *
     * see also: https://gcc.gnu.org/onlinedocs/gcc/Environment-Variables.html
     */
    const env = process.env
    env.LC_ALL = 'C'
    if (process.platform === 'win32') {
      // Windows needs to know the path of other tools
      if (!env.Path.includes(path.dirname(command))) {
        env.Path = `${path.dirname(command)}${path.delimiter}${env.Path}`
      }
    }
    let childProcess = cp.spawn(command, argList, { cwd: filePath, env: env })

    if (childProcess.pid) {
      childProcess.stdout.on('data', (data: Buffer) => {
        decoded += data
      })
      childProcess.stderr.on('data', (data) => {
        decoded += data
      })
      childProcess.stderr.on('end', () => {
        let matchesArray: string[]
        while ((matchesArray = errorRegex.exec(decoded)) !== null) {
          let elements: string[] = matchesArray.slice(1) // get captured expressions
          let startLine = parseInt(elements[2])
          let startColumn = parseInt(elements[3])
          let type = elements[5] // error or warning
          let severity =
            type.toLowerCase() === 'warning'
              ? vscode.DiagnosticSeverity.Warning
              : vscode.DiagnosticSeverity.Error
          let message = elements[6]
          let range = new vscode.Range(
            new vscode.Position(startLine - 1, startColumn),
            new vscode.Position(startLine - 1, startColumn)
          )
          let diagnostic = new vscode.Diagnostic(range, message, severity)
          diagnostics.push(diagnostic)
        }

        this.diagnosticCollection.set(textDocument.uri, diagnostics)
      })
      childProcess.stdout.on('close', (code) => {
        console.log(`child process exited with code ${code}`)
      })
    } else {
      childProcess.on('error', (err: any) => {
        if (err.code === 'ENOENT') {
          vscode.window.showErrorMessage(
            "gfortran can't found on path, update your settings with a proper path or disable the linter."
          )
        }
      })
    }
  }

  private constructArgumentList(textDocument: vscode.TextDocument): string[] {

    let args = [
      '-fsyntax-only',
      '-cpp',
      '-fdiagnostics-show-option',
      ...this.getLinterExtraArgs(),
      this.getModOutputDir(),
    ]
    let includePaths = this.getIncludePaths()

    let extensionIndex = textDocument.fileName.lastIndexOf('.')
    let fileNameWithoutExtension = textDocument.fileName.substring(
      0,
      extensionIndex
    )
    let argList = [
      ...args,
      ...getIncludeParams(includePaths), // include paths
      textDocument.fileName,
      `-o ${fileNameWithoutExtension}.mod`,
    ]

    return argList.map((arg) => arg.trim()).filter((arg) => arg !== '')
  }

  private static commandId: string = 'fortran.lint.runCodeAction'

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.Command[] {
    return
    // let diagnostic: vscode.Diagnostic = context.diagnostics[0];
    // return [{
    // 	title: "Accept gfortran suggestion",
    // 	command: FortranLintingProvider.commandId,
    // 	arguments: [document, diagnostic.range, diagnostic.message]
    // }];
  }

  private command: vscode.Disposable

  public activate(subscriptions: vscode.Disposable[]) {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('Fortran')

    vscode.workspace.onDidOpenTextDocument(
      this.doModernFortranLint,
      this,
      subscriptions
    )
    vscode.workspace.onDidCloseTextDocument(
      (textDocument) => {
        this.diagnosticCollection.delete(textDocument.uri)
      },
      null,
      subscriptions
    )

    vscode.workspace.onDidSaveTextDocument(this.doModernFortranLint, this)

    // Run gfortran in all open fortran files
    vscode.workspace.textDocuments.forEach(this.doModernFortranLint, this)
  }

  public dispose(): void {
    this.diagnosticCollection.clear()
    this.diagnosticCollection.dispose()
    this.command.dispose()
  }

  private getModOutputDir(): string {
    const config = vscode.workspace.getConfiguration('fortran');
    let modout: string = config.get('linterModOutput', '');
    if (modout) {
      modout = '-J' + resolveVariables(modout);
      this.loggingService.logInfo(`Linter.moduleOutput`)
    }
    return modout
  }

  private getIncludePaths(): string[] {
    let config = vscode.workspace.getConfiguration('fortran')
    const includePaths: string[] = config.get('includePaths', [])
    // Resolve internal variables and expand glob patterns
    const resIncludePaths = includePaths.map((e) => resolveVariables(e));
    // This needs to be after the resolvevariables since {} are used in globs
    const globIncPaths: string[] = fg.sync(resIncludePaths, { onlyDirectories: true });
    // Output the original include paths
    this.loggingService.logInfo(`Linter.include:\n${includePaths.join('\r\n')}`)
    return globIncPaths
  }

  private getGfortranPath(): string {
    let config = vscode.workspace.getConfiguration('fortran')
    const gfortranPath = config.get('gfortranExecutable', 'gfortran')
    this.loggingService.logInfo(`using gfortran executable: ${gfortranPath}`)
    return gfortranPath
  }

  private getLinterExtraArgs(): string[] {
    let config = vscode.workspace.getConfiguration('fortran')
    const args = config.get('linterExtraArgs', ['-Wall']).map((e) => resolveVariables(e));
    this.loggingService.logInfo(`Linter.arguments:\n${args.join('\r\n')}`);
    return args.map((e) => resolveVariables(e));
  }
}
