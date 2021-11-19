// src/extension.ts
import * as which from 'which';
import * as vscode from 'vscode';

import { FortranLintingProvider } from './features/linter-provider';
import FortranHoverProvider from './features/hover-provider';
import { FortranCompletionProvider } from './features/completion-provider';
import { FortranDocumentSymbolProvider } from './features/document-symbol-provider';

import { LoggingService } from './services/logging-service';
import * as pkg from '../package.json';
import { LANG_SERVER_TOOL_ID } from './lib/tools';
import { FortranFormattingProvider } from './features/formatting-provider';
import { FortranLanguageServer } from './fortls-interface';
import { EXTENSION_ID, FortranDocumentSelector, promptForMissingTool } from './lib/tools';

// Make it global to catch errors when activation fails
const loggingService = new LoggingService();

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration(EXTENSION_ID);
  const linterType = config.get<string>('linter.compiler');
  const formatterType = config.get<string>('formatting.formatter');
  const autocompleteType = config.get<string>('provide.autocomplete');
  const hoverType = config.get<string>('provide.hover');
  const symbolsType = config.get<string>('provide.symbols');
  detectDeprecatedOptions();

  loggingService.logInfo(`Extension Name: ${pkg.displayName}`);
  loggingService.logInfo(`Extension Version: ${pkg.version}`);
  loggingService.logInfo(`Linter set to: ${linterType}`);
  loggingService.logInfo(`Formatter set to: ${formatterType}`);
  loggingService.logInfo(`Autocomplete set to: ${autocompleteType}`);
  loggingService.logInfo(`Hover set to: ${hoverType}`);
  loggingService.logInfo(`Symbols set to: ${symbolsType}`);

  if (linterType !== 'Disabled') {
    const linter = new FortranLintingProvider(loggingService);
    linter.activate(context.subscriptions);
    vscode.languages.registerCodeActionsProvider(FortranDocumentSelector(), linter);
  }

  if (formatterType !== 'Disabled') {
    const disposable: vscode.Disposable = vscode.languages.registerDocumentFormattingEditProvider(
      FortranDocumentSelector(),
      new FortranFormattingProvider(loggingService)
    );
    context.subscriptions.push(disposable);
  }

  if (autocompleteType === 'Built-in') {
    const completionProvider = new FortranCompletionProvider(loggingService);
    vscode.languages.registerCompletionItemProvider(FortranDocumentSelector(), completionProvider);
  }

  if (hoverType === 'Built-in') {
    const hoverProvider = new FortranHoverProvider(loggingService);
    vscode.languages.registerHoverProvider(FortranDocumentSelector(), hoverProvider);
  }

  if (symbolsType === 'Built-in') {
    const symbolProvider = new FortranDocumentSymbolProvider();
    vscode.languages.registerDocumentSymbolProvider(FortranDocumentSelector(), symbolProvider);
  }

  // Check if the language server is installed and if not prompt to install it
  if (!which.sync('fortls', { nothrow: true })) {
    const msg = `It is highly recommended to use the fortran-language-server to 
              enable hover, peeking, gotos and many more.
              For a full list of features the language server adds see:
              https://github.com/hansec/fortran-language-server`;
    promptForMissingTool(LANG_SERVER_TOOL_ID, msg, 'Python', loggingService);
  }

  // Spawn the fortran-language-server
  const fortls = new FortranLanguageServer(loggingService);
  fortls.activate(context.subscriptions);
}

function detectDeprecatedOptions() {
  const config = vscode.workspace.getConfiguration(EXTENSION_ID);
  const oldArgs: string[] = [];
  if (config.get('includePaths')) oldArgs.push('fortran.includePaths');
  if (config.get('gfortranExecutable')) oldArgs.push('fortran.gfortranExecutable');
  if (config.get('linterEnabled')) oldArgs.push('fortran.linterEnabled');
  if (config.get('linterExtraArgs')) oldArgs.push('fortran.linterExtraArgs');
  if (config.get('linterModOutput')) oldArgs.push('fortran.linterModOutput');
  if (config.get('symbols')) oldArgs.push('fortran.symbols');
  if (config.get('provideSymbols')) oldArgs.push('fortran.provideSymbols');
  if (config.get('provideHover')) oldArgs.push('fortran.provideHover');
  if (config.get('provideCompletion')) oldArgs.push('fortran.provideCompletion');

  if (oldArgs.length !== 0) {
    const err = vscode.window.showErrorMessage(
      `Deprecated settings have been detected in your settings.
       Please update your settings to make use of the new names. The old names will not work.`,
      'Open Settings'
    );
    err.then(() => vscode.commands.executeCommand('workbench.action.openGlobalSettings'));
    loggingService.logError(`The following deprecated options have been detected:\n${oldArgs}`);
  }
}
