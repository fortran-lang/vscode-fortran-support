// src/extension.ts
import * as which from 'which'
import * as vscode from 'vscode'

import FortranLintingProvider from './features/linter-provider'
import FortranHoverProvider from './features/hover-provider'
import { FortranCompletionProvider } from './features/completion-provider'
import { FortranDocumentSymbolProvider } from './features/document-symbol-provider'

import { FortranLangServer } from './lang-server'
import { FORTRAN_DOCUMENT_SELECTOR, EXTENSION_ID, promptForMissingTool } from './lib/helper'
import { LoggingService } from './services/logging-service'
import * as pkg from '../package.json'
import { LANG_SERVER_TOOL_ID } from './lib/tools'
import { FortranFormattingProvider } from './features/formatting-provider'

export function activate(context: vscode.ExtensionContext) {
  const loggingService = new LoggingService()
  const extensionConfig = vscode.workspace.getConfiguration(EXTENSION_ID)

  loggingService.logInfo(`Extension Name: ${pkg.displayName}`)
  loggingService.logInfo(`Extension Version: ${pkg.version}`)

  if (extensionConfig.get('linterEnabled', true)) {
    let linter = new FortranLintingProvider(loggingService)
    linter.activate(context.subscriptions)
    vscode.languages.registerCodeActionsProvider(FORTRAN_DOCUMENT_SELECTOR, linter)
  } else {
    loggingService.logInfo('Linter is not enabled')
  }

  if (extensionConfig.get('formatter') !== 'Disabled') {
    let disposable: vscode.Disposable =
      vscode.languages.registerDocumentFormattingEditProvider(
        FORTRAN_DOCUMENT_SELECTOR,
        new FortranFormattingProvider(loggingService)
      );
    context.subscriptions.push(disposable);
  }
  else {
    loggingService.logInfo('Formatting is disabled')
  }

  if (extensionConfig.get('provideCompletion', true)) {
    let completionProvider = new FortranCompletionProvider(loggingService)
    vscode.languages.registerCompletionItemProvider(
      FORTRAN_DOCUMENT_SELECTOR,
      completionProvider
    )
  } else {
    loggingService.logInfo('Completion Provider is not enabled')
  }

  if (extensionConfig.get('provideHover', true)) {
    let hoverProvider = new FortranHoverProvider(loggingService)
    vscode.languages.registerHoverProvider(FORTRAN_DOCUMENT_SELECTOR, hoverProvider)
  } else {
    loggingService.logInfo('Hover Provider is not enabled')
  }

  if (extensionConfig.get('provideSymbols', true)) {
    let symbolProvider = new FortranDocumentSymbolProvider()
    vscode.languages.registerDocumentSymbolProvider(
      FORTRAN_DOCUMENT_SELECTOR,
      symbolProvider
    )
  } else {
    loggingService.logInfo('Symbol Provider is not enabled')
  }

  // Check if the language server is installed and if not prompt to install it
  if (!which.sync('fortls', { nothrow: true })) {
    let msg = `It is highly recommended to use the fortran-language-server to 
              enable hover, peeking, gotos and many more.
              For a full list of features the language server adds see:
              https://github.com/hansec/fortran-language-server`;
    promptForMissingTool(LANG_SERVER_TOOL_ID, msg, 'Python', loggingService);
  }

  // Check that Fortran Intellisense is installed and if not prompt to install
  if (!vscode.extensions.getExtension('hansec.fortran-ls')) {
    let msg = `It is highly recommended to install the Fortran IntelliSense 
              extension. The extension is used to interface with the 
              fortran-language-server.
              For a full list of features provided by the extension see:
              https://github.com/hansec/vscode-fortran-ls`;
    promptForMissingTool('hansec.fortran-ls', msg, 'VSExt', loggingService);
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
