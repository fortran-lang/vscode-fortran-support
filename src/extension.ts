// src/extension.ts
import * as which from 'which';
import * as vscode from 'vscode';

import FortranLintingProvider from './features/linter-provider';
import FortranHoverProvider from './features/hover-provider';
import { FortranCompletionProvider } from './features/completion-provider';
import { FortranDocumentSymbolProvider } from './features/document-symbol-provider';

import { LoggingService } from './services/logging-service';
import * as pkg from '../package.json';
import { LANG_SERVER_TOOL_ID } from './lib/tools';
import { FortranFormattingProvider } from './features/formatting-provider';
import FortranLanguageServer from './fortls-interface';
import { EXTENSION_ID, FortranDocumentSelector, promptForMissingTool } from './lib/tools';

// Make it global to catch errors when activation fails
const loggingService = new LoggingService();

export function activate(context: vscode.ExtensionContext) {
  const extensionConfig = vscode.workspace.getConfiguration(EXTENSION_ID);

  loggingService.logInfo(`Extension Name: ${pkg.displayName}`);
  loggingService.logInfo(`Extension Version: ${pkg.version}`);

  if (extensionConfig.get('linterEnabled', true)) {
    const linter = new FortranLintingProvider(loggingService);
    linter.activate(context.subscriptions);
    vscode.languages.registerCodeActionsProvider(FortranDocumentSelector(), linter);
    loggingService.logInfo('Linter is enabled');
  } else {
    loggingService.logInfo('Linter is not enabled');
  }

  if (extensionConfig.get('formatter') !== 'Disabled') {
    const disposable: vscode.Disposable = vscode.languages.registerDocumentFormattingEditProvider(
      FortranDocumentSelector(),
      new FortranFormattingProvider(loggingService)
    );
    context.subscriptions.push(disposable);
    loggingService.logInfo('Formatting is enabled');
  } else {
    loggingService.logInfo('Formatting is disabled');
  }

  if (extensionConfig.get('provideCompletion', true)) {
    const completionProvider = new FortranCompletionProvider(loggingService);
    vscode.languages.registerCompletionItemProvider(FortranDocumentSelector(), completionProvider);
  } else {
    loggingService.logInfo('Completion Provider is not enabled');
  }

  if (extensionConfig.get('provideHover', true)) {
    const hoverProvider = new FortranHoverProvider(loggingService);
    vscode.languages.registerHoverProvider(FortranDocumentSelector(), hoverProvider);
    loggingService.logInfo('Hover Provider is enabled');
  } else {
    loggingService.logInfo('Hover Provider is not enabled');
  }

  if (extensionConfig.get('provideSymbols', true)) {
    const symbolProvider = new FortranDocumentSymbolProvider();
    vscode.languages.registerDocumentSymbolProvider(FortranDocumentSelector(), symbolProvider);
    loggingService.logInfo('Symbol Provider is enabled');
  } else {
    loggingService.logInfo('Symbol Provider is not enabled');
  }

  // Check if the language server is installed and if not prompt to install it
  if (!which.sync('fortls', { nothrow: true })) {
    const msg = `It is highly recommended to use the fortran-language-server to 
              enable hover, peeking, gotos and many more.
              For a full list of features the language server adds see:
              https://github.com/hansec/fortran-language-server`;
    promptForMissingTool(LANG_SERVER_TOOL_ID, msg, 'Python', loggingService);
  }
}
