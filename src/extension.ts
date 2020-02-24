// src/extension.ts
import * as vscode from 'vscode'

import FortranLintingProvider from './features/linter-provider'
import FortranHoverProvider from './features/hover-provider'
import { FortranCompletionProvider } from './features/completion-provider'
import { FortranDocumentSymbolProvider } from './features/document-symbol-provider'

import { FORTRAN_FREE_FORM_ID, EXTENSION_ID } from './lib/helper'
import { FortranLangServer, checkForLangServer } from './lang-server'


export function activate(context: vscode.ExtensionContext) {

  const extensionConfig = vscode.workspace.getConfiguration(EXTENSION_ID)

  if (extensionConfig.get('linterEnabled', true)) {
    let linter = new FortranLintingProvider()
    linter.activate(context.subscriptions)
    vscode.languages.registerCodeActionsProvider(FORTRAN_FREE_FORM_ID, linter)
  }

  if (extensionConfig.get('provideCompletion', true)) {
    let completionProvider = new FortranCompletionProvider()
    vscode.languages.registerCompletionItemProvider(
      FORTRAN_FREE_FORM_ID,
      completionProvider
    )
  }

  if (extensionConfig.get('provideHover', true)) {
    let hoverProvider = new FortranHoverProvider()
    vscode.languages.registerHoverProvider(
      FORTRAN_FREE_FORM_ID,
      hoverProvider
    )
  }

  if (extensionConfig.get('provideSymbols', true)) {
    let symbolProvider = new FortranDocumentSymbolProvider()
    vscode.languages.registerDocumentSymbolProvider(
      FORTRAN_FREE_FORM_ID,
      symbolProvider
    )
  }

  if (checkForLangServer(extensionConfig)) {

    const langServer = new FortranLangServer(context, extensionConfig)
    langServer.start()
    langServer.onReady().then(() => {
      const capabilities = langServer.getCapabilities()
      if (!capabilities) {
        return vscode.window.showErrorMessage(
          'The language server is not able to serve any features at the moment.'
        )
      }
    })
  }
}
