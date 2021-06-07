'use strict'

import * as path from 'path'
import * as cp from 'child_process'
import { getIncludeParams, LANGUAGE_ID } from '../lib/helper'

import * as vscode from 'vscode'
import { LoggingService } from '../services/logging-service'
import { Config } from '../services/config'
import { EnvironmentVariables } from '../services/utils'

const ERROR_REGEX: RegExp =
  /^([a-zA-Z]:\\)*([^:]*):([0-9]+):([0-9]+):\s+(.*)\s+.*?\s+(Error|Warning|Fatal Error):\s(.*)$/gm

const knownModNames = ['mpi']

export default class FortranLintingProvider {
  constructor(
    private loggingService: LoggingService,
    private _config: Config
  ) {}

  private diagnosticCollection: vscode.DiagnosticCollection

  private async doModernFortranLint(textDocument: vscode.TextDocument) {
    if (
      textDocument.languageId !== LANGUAGE_ID ||
      textDocument.uri.scheme !== 'file'
    ) {
      return
    }

    let decoded = ''

    let command = await this.getGfortranPath()
    let argList = await this.constructArgumentList(textDocument)

    let filePath = path.parse(textDocument.fileName).dir

    /*
     * reset localization settings to traditional C English behavior in case
     * gfortran is set up to use the system provided localization information,
     * so errorRegex can nevertheless be used to filter out errors and warnings
     *
     * see also: https://gcc.gnu.org/onlinedocs/gcc/Environment-Variables.html
     */
    const env: EnvironmentVariables = { ...process.env, LC_ALL: 'C' }
    if (process.platform === 'win32') {
      // Windows needs to know the path of other tools
      if (!env.Path.includes(path.dirname(command))) {
        env.Path = `${path.dirname(command)}${path.delimiter}${env.Path}`
      }
    }
    this.loggingService.logInfo(
      `executing linter command ${command} ${argList.join(' ')}`
    )
    let gfortran = cp.spawn(command, argList, { cwd: filePath, env })

    if (gfortran && gfortran.pid) {
      gfortran!.stdout!.on('data', (data: Buffer) => {
        decoded += data
      })
      gfortran!.stderr!.on('data', (data) => {
        decoded += data
      })
      gfortran!.stderr.on('end', () => {
        this.reportErrors(decoded, textDocument)
      })
      gfortran.stdout.on('close', (code) => {
        console.log(`child process exited with code ${code}`)
      })
    } else {
      gfortran.on('error', (err: any) => {
        if (err.code === 'ENOENT') {
          vscode.window.showErrorMessage(
            "gfortran executable can't be found at the provided path, update your settings with a proper path or disable the linter."
          )
        }
      })
    }
  }

  reportErrors(errors: string, textDocument: vscode.TextDocument) {
    let diagnostics: vscode.Diagnostic[] = []
    let matchesArray: string[]
    while ((matchesArray = ERROR_REGEX.exec(errors)) !== null) {
      let elements: string[] = matchesArray.slice(1) // get captured expressions
      let startLine = parseInt(elements[2])
      let startColumn = parseInt(elements[3])
      let type = elements[5] // error or warning
      let severity =
        type.toLowerCase() === 'warning'
          ? vscode.DiagnosticSeverity.Warning
          : vscode.DiagnosticSeverity.Error
      let message = elements[6]
      const [isModError, modName] = isModuleMissingErrorMessage(message)
      // skip error from known mod names
      if (isModError && knownModNames.includes(modName)) {
        continue
      }
      let range = new vscode.Range(
        new vscode.Position(startLine - 1, startColumn),
        new vscode.Position(startLine - 1, startColumn)
      )

      let diagnostic = new vscode.Diagnostic(range, message, severity)
      diagnostics.push(diagnostic)
    }

    this.diagnosticCollection.set(textDocument.uri, diagnostics)
  }

  private async constructArgumentList(
    textDocument: vscode.TextDocument
  ): Promise<string[]> {
    let args = [
      '-fsyntax-only',
      '-cpp',
      '-fdiagnostics-show-option',
      ...(await this.getLinterExtraArgs()),
    ]
    let includePaths = await this.getIncludePaths()

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
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection()

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

  private async getIncludePaths(): Promise<string[]> {
    let includePaths: string[] = await this._config.get('includePaths', [])
    this.loggingService.logInfo(`using include paths "${includePaths}"`)
    return includePaths
  }

  private async getGfortranPath(): Promise<string> {
    const gfortranPath = await this._config.get(
      'gfortranExecutable',
      'gfortran'
    )
    this.loggingService.logInfo(`using gfortran executable: "${gfortranPath}"`)
    return gfortranPath
  }

  private getLinterExtraArgs(): Promise<string[]> {
    return this._config.get('linterExtraArgs', ['-Wall'])
  }
}

function isModuleMissingErrorMessage(
  message: string
): [boolean, string | null] {
  const result = /^Cannot open module file '(\w+).mod' for reading/.exec(
    message
  )
  if (result) {
    return [true, result[1]]
  }
  return [false, null]
}
