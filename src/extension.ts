// src/extension.ts
import * as vscode from 'vscode'

import FortranLintingProvider from './features/linter-provider'
import FortranHoverProvider from './features/hover-provider'
import { FortranCompletionProvider } from './features/completion-provider'
import { FortranDocumentSymbolProvider } from './features/document-symbol-provider'
import { FORTRAN_FREE_FORM_ID } from './lib/helper'
import { FortranLangServer } from './lang-server'
import { ConfigurationFeature } from 'vscode-languageclient/lib/configuration'


export function activate(context: vscode.ExtensionContext) {
  let hoverProvider = new FortranHoverProvider()
  let completionProvider = new FortranCompletionProvider()
  let symbolProvider = new FortranDocumentSymbolProvider()

  const extensionConfig = vscode.workspace.getConfiguration('LANGUAGE_ID')

  if (extensionConfig.get('linterEnabled', true)) {
    let linter = new FortranLintingProvider()
    linter.activate(context.subscriptions)
    vscode.languages.registerCodeActionsProvider(FORTRAN_FREE_FORM_ID, linter)
  }

  vscode.languages.registerCompletionItemProvider(
    FORTRAN_FREE_FORM_ID,
    completionProvider
  )
  vscode.languages.registerHoverProvider(FORTRAN_FREE_FORM_ID, hoverProvider)

  vscode.languages.registerDocumentSymbolProvider(
    FORTRAN_FREE_FORM_ID,
    symbolProvider
  )
  if (extensionConfig.get('useLanguageServer')) {
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
