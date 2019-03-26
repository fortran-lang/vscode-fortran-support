import {
  LanguageClient,
  LanguageClientOptions,
  Executable,
} from 'vscode-languageclient'
import * as vscode from 'vscode'
import {
  getBinPath,
  FORTRAN_FREE_FORM_ID,
  promptForMissingTool,
} from './lib/helper'
import { LANG_SERVER_TOOL_ID } from './lib/tools'

export class FortranLangServer {

  c: LanguageClient
  constructor(context, config) {
    let langServerFlags: string[] = config.get('languageServerFlags', [])

    const serverOptions: Executable = {
      command: getBinPath(LANG_SERVER_TOOL_ID),
      args: [...langServerFlags],
      options: {},
    }

    const clientOptions: LanguageClientOptions = {
      documentSelector: [FORTRAN_FREE_FORM_ID],
    }

    this.c = new LanguageClient(
      'fortran-langserver',
      serverOptions,
      clientOptions
    )
  }

  start() {
    this.c.start()
  }

  onReady() {
    return this.c.onReady()
  }

  getCapabilities() {
    const capabilities =
      this.c.initializeResult && this.c.initializeResult.capabilities
    return capabilities
  }
}

export function checkForLangServer(config) {
  const useLangServer = false //config.get('useLanguageServer')
  if (!useLangServer) return false
  if (process.platform === 'win32') {
    vscode.window.showInformationMessage(
      'The Fortran language server is not supported on Windows yet.'
    )
    return false
  }
  let langServerAvailable = getBinPath('fortran-langserver')
  if (!langServerAvailable) {
    promptForMissingTool(LANG_SERVER_TOOL_ID)
    vscode.window.showInformationMessage(
      'Reload VS Code window after installing the Fortran language server'
    )
  }
  return true
}

