// src/extension.ts
import * as vscode from 'vscode'; 

import FortranLintingProvider from './features/linter-provider';
import FortranHoverProvider from "./features/hover-provider";

export function activate(context: vscode.ExtensionContext) {
	let linter = new FortranLintingProvider();	
	let hover = new FortranHoverProvider();	
	linter.activate(context.subscriptions);
	vscode.languages.registerCodeActionsProvider('fortran90', linter);
	vscode.languages.registerHoverProvider('fortran90', hover);
	
}