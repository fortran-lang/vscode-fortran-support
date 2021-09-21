// src/extension.ts
import * as which from 'which'
import * as vscode from 'vscode'

import FortranLintingProvider from './features/linter-provider'
import FortranHoverProvider from './features/hover-provider'
import { FortranCompletionProvider } from './features/completion-provider'
import { FortranDocumentSymbolProvider } from './features/document-symbol-provider'

import { FORTRAN_FREE_FORM_ID, EXTENSION_ID } from './lib/helper'
import { FortranLangServer, checkForLangServer } from './lang-server'
import { LoggingService } from './services/logging-service'
import * as pkg from '../package.json'

export function activate(context: vscode.ExtensionContext) {
  const loggingService = new LoggingService()
  const extensionConfig = vscode.workspace.getConfiguration(EXTENSION_ID)

  loggingService.logInfo(`Extension Name: ${pkg.displayName}`)
  loggingService.logInfo(`Extension Version: ${pkg.version}`)

  if (extensionConfig.get('linterEnabled', true)) {
    let linter = new FortranLintingProvider(loggingService)
    linter.activate(context.subscriptions)
    vscode.languages.registerCodeActionsProvider(FORTRAN_FREE_FORM_ID, linter)
  } else {
    loggingService.logInfo('Linter is not enabled')
  }

  if (extensionConfig.get('provideCompletion', true)) {
    let completionProvider = new FortranCompletionProvider(loggingService)
    vscode.languages.registerCompletionItemProvider(
      FORTRAN_FREE_FORM_ID,
      completionProvider
    )
  } else {
    loggingService.logInfo('Completion Provider is not enabled')
  }

  if (extensionConfig.get('provideHover', true)) {
    let hoverProvider = new FortranHoverProvider(loggingService)
    vscode.languages.registerHoverProvider(FORTRAN_FREE_FORM_ID, hoverProvider)
  } else {
    loggingService.logInfo('Hover Provider is not enabled')
  }

  if (extensionConfig.get('provideSymbols', true)) {
    let symbolProvider = new FortranDocumentSymbolProvider()
    vscode.languages.registerDocumentSymbolProvider(
      FORTRAN_FREE_FORM_ID,
      symbolProvider
    )
  } else {
    loggingService.logInfo('Symbol Provider is not enabled')
  }

  // Our interface with `fortls` has been disabled in favour of the @hansec's
  // VS Code extension Fortran IntelliSense
  const useInternalFLInterface = false;
  if (useInternalFLInterface) {
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
