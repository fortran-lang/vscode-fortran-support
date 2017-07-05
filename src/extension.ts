// src/extension.ts
import * as vscode from 'vscode';

import FortranLintingProvider from './features/linter-provider';
import FortranHoverProvider from './features/hover-provider';
import { FortranCompletionProvider } from './features/completion-provider';
import { FortranDocumentSymbolProvider } from './features/document-symbol-provider';

export function activate(context: vscode.ExtensionContext) {

    let hoverProvider = new FortranHoverProvider();
    let completionProvider = new FortranCompletionProvider();
    let symbolProvider = new FortranDocumentSymbolProvider();

    if (vscode.workspace.getConfiguration('fortran').get('linterEnabled', true)) {

        let linter = new FortranLintingProvider();
        linter.activate(context.subscriptions);
        vscode.languages.registerCodeActionsProvider('fortran90', linter);
    }

    vscode.languages.registerCompletionItemProvider('fortran90', completionProvider);
    vscode.languages.registerHoverProvider('fortran90', hoverProvider);
    vscode.languages.registerDocumentSymbolProvider('fortran90', symbolProvider);
}