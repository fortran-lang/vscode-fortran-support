// src/extension.ts
import * as vscode from 'vscode';
import * as pkg from '../package.json';
import { FortranCompletionProvider } from './features/completion-provider';
import { FortranDocumentSymbolProvider } from './features/document-symbol-provider';
import { FortranFormattingProvider } from './features/formatting-provider';
import { FortlsClient } from './lsp/client';
import { FortranHoverProvider } from './features/hover-provider';
import { FortranLintingProvider } from './features/linter-provider';
import { EXTENSION_ID, FortranDocumentSelector } from './lib/tools';
import { LoggingService } from './services/logging-service';

// Make it global to catch errors when activation fails
const loggingService = new LoggingService();

export async function activate(context: vscode.ExtensionContext) {
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

  // Linter is always activated but will only lint if compiler !== Disabled
  const linter = new FortranLintingProvider(loggingService);
  linter.activate(context.subscriptions);
  vscode.languages.registerCodeActionsProvider(FortranDocumentSelector(), linter);

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

  if (hoverType === 'Built-in' || hoverType === 'Both') {
    const hoverProvider = new FortranHoverProvider(loggingService);
    vscode.languages.registerHoverProvider(FortranDocumentSelector(), hoverProvider);
  }

  if (symbolsType === 'Both') {
    const symbolProvider = new FortranDocumentSymbolProvider();
    vscode.languages.registerDocumentSymbolProvider(FortranDocumentSelector(), symbolProvider);
  }

  if (!config.get<boolean>('fortls.disabled')) {
    new FortlsClient(loggingService, context).activate();
  }
  // override VS Code's default implementation of the debug hover
  // here we match Fortran derived types and scope them appropriately
  // e.g. "val%a%b" with hovering over "a" will match "val%a"
  context.subscriptions.push(
    vscode.languages.registerEvaluatableExpressionProvider(FortranDocumentSelector(), {
      provideEvaluatableExpression(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
      ): vscode.ProviderResult<vscode.EvaluatableExpression> {
        // Match the % characters in defined types
        const DERIVED_TYPE_REGEX = /[a-z][\w%]*/i;
        // Get the word at the current position and the string matching
        // the derived type REGEX. Use the start of the regex and end of word as range
        const wordRange = document.getWordRangeAtPosition(position);
        const derivedTypeRange = document.getWordRangeAtPosition(position, DERIVED_TYPE_REGEX);
        if (wordRange) {
          if (derivedTypeRange) {
            return new vscode.EvaluatableExpression(wordRange.with(derivedTypeRange.start));
          }
          return new vscode.EvaluatableExpression(wordRange);
        }
        return undefined;
      },
    })
  );
  return context;
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

  // only captures config options set to true but the package.json deprecation
  // descriptions should take care of the rest
  if (oldArgs.length !== 0) {
    vscode.window
      .showErrorMessage(
        `Deprecated settings have been detected in your settings.
       Please update your settings to make use of the new names. The old names will not work.`,
        'Open Settings'
      )
      .then(selected => {
        if (selected === 'Open Settings') {
          vscode.commands.executeCommand('workbench.action.openGlobalSettings');
        }
        loggingService.logError(`The following deprecated options have been detected:\n${oldArgs}`);
      });
  }

  // NOTE: the API for this will probably change in the near future to return true
  // even if the extension is not activated
  // see: https://github.com/microsoft/vscode/issues/133734
  if (vscode.extensions.getExtension('hansec.fortran-ls')) {
    vscode.window.showWarningMessage(
      `Modern Fortran is not compatible with FORTRAN Intellisense. 
      Language Server integration is handled in Modern Fortran now.
      Please Disable/Uninstall: FORTRAN Intellisense.`
    );
  }
  if (vscode.extensions.getExtension('ekibun.fortranbreaker')) {
    vscode.window
      .showWarningMessage(`Modern Fortran is not compatible with Fortran Breakpoint Support.
      Breakpoint support is handled natively in Modern Fortran.
      Please Disable/Uninstall: Fortran Breakpoint Support.`);
  }
  if (vscode.extensions.getExtension('Gimly81.fortran')) {
    vscode.window.showWarningMessage(`Modern Fortran is not compatible with extension: fortran.
      Both extensions provide syntax highlighting for Fortran and should not be used simultaneously.
      Please Disable/Uninstall extension: fortran.`);
  }
}
