// src/extension.ts
import * as vscode from 'vscode'

import FortranLintingProvider from './features/linter-provider'
import FortranHoverProvider from './features/hover-provider'
import { FortranCompletionProvider } from './features/completion-provider'
import { FortranDocumentSymbolProvider } from './features/document-symbol-provider'
import { LANGUAGE_ID } from './lib/helper'

const FORTRAN_FREE_FORM_ID = { language: LANGUAGE_ID, scheme: 'file' }

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
}
