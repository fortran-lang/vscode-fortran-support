// src/extension.ts
import * as vscode from 'vscode'; 

import FortranLintingProvider from './features/linter-provider';

export function activate(context: vscode.ExtensionContext) {
	let linter = new FortranLintingProvider();	
	linter.activate(context.subscriptions);
	vscode.languages.registerCodeActionsProvider('fortran90', linter);
}