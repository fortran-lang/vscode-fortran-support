// src/extension.ts
import * as vscode from 'vscode';
import which from 'which';
import * as pkg from '../package.json';
import { registerCommands } from './features/commands';
import { FortranCompletionProvider } from './features/completion-provider';
import { FortranDocumentSymbolProvider } from './features/document-symbol-provider';
import { FortranFormattingProvider } from './features/formatting-provider';
import { FortranLanguageServer } from './features/fortls-interface';
import { FortranHoverProvider } from './features/hover-provider';
import { FortranLintingProvider } from './features/linter-provider';
import {
  EXTENSION_ID,
  FortranDocumentSelector,
  LANG_SERVER_TOOL_ID,
  promptForMissingTool,
} from './lib/tools';
import { LoggingService } from './services/logging-service';

type ActivateLoggingService = () => Promise<void>;

// TODO Unsure what the type of config is, can update later
type HandleFortlsError = (config: any, error: Error) => void;

// TODO Unsure what the type of config is, can update later
type HandleFortlsPackage = (config: any) => void;

// Make it global to catch errors when activation fails
const loggingService = new LoggingService();

const activateLoggingService: ActivateLoggingService = async () => {
  await new FortranLanguageServer(loggingService).activate();
};

const handleFortlsError: HandleFortlsError = async (config, error) => {
  const msg = `It is highly recommended to use the fortls to
            enable IDE features like hover, peeking, gotos and many more.
            For a full list of features the language server adds see:
            https://github.com/gnikit/fortls`;
  await promptForMissingTool(
    LANG_SERVER_TOOL_ID,
    msg,
    'Python',
    ['Install', "Don't Show Again"],
    loggingService,
    () => {
      config.update('ignoreWarning.fortls', true);
    }
  );
};

// Check if the language server is installed and if not prompt to install it
// Not the most elegant solution but we need pip install to have finished
// before the activate function is called so we do a little code duplication
const handleFortlsPackage: HandleFortlsPackage = async config => {
  if (!config.get('fortls.disabled')) {
    return;
  }
  which(config.get('fortls.path'), async (error: Error) => {
    try {
      if (config.get('ignoreWarning.fortls')) {
        // Ignore fortls Warnings are SET. Activate the LS
        await activateLoggingService();
      }
      // Ignore fortls Warnings NOT set. Activate the LS
      await activateLoggingService();
    } catch (error) {
      await handleFortlsError(config, error);
      // fortls not installed AND Warnings are enabled
      await activateLoggingService();
    }
  });
};

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

  registerCommands(context.subscriptions);

  await handleFortlsPackage(config);
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
}
