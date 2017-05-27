// src/extension.ts
import * as vscode from 'vscode'; 

import FortranLintingProvider from './features/linterProvider';

export function activate(context: vscode.ExtensionContext) {
	console.log("called")
	let linter = new FortranLintingProvider();	
	linter.activate(context.subscriptions);
	vscode.languages.registerCodeActionsProvider('fortran', linter);
}