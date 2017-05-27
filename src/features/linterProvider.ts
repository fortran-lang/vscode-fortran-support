'use strict';

import * as path from 'path';
import * as cp from 'child_process';
import ChildProcess = cp.ChildProcess;

import * as vscode from 'vscode';

export default class FortranLintingProvider {

        
	constructor(){
		// filename:line:col: is common for multiline and single line warnings
		// this.regex = '^[^:]*:(\d+)[:.](?P<col>\d+):';
		
	}

	private diagnosticCollection: vscode.DiagnosticCollection;
	private doModernFortranLint(textDocument: vscode.TextDocument) {
		let errorRegex:RegExp = /^([^:]*):([0-9]+):([0-9]+):\n\s(.*)\n.*\n(Error|Warning):\s(.*)$/gm;
		console.log(textDocument.languageId);
		if (textDocument.languageId !== 'Fortran') {
			return;
		}
		let decoded = '';
		let diagnostics: vscode.Diagnostic[] = [];
		let options = vscode.workspace.rootPath ? { cwd: vscode.workspace.rootPath } : undefined;
		let args = ['', textDocument.fileName];
		let childProcess = cp.spawn('gfortran', ['-cpp', '-fsyntax-only', '-Wall','-fdiagnostics-show-option', textDocument.fileName]);
		// let childProcess = cp.spawn('ps', ['ax']);
		if (childProcess.pid) {
			childProcess.stdout.on('data', (data: Buffer) => {
				decoded += data;
			});
			childProcess.stderr.on('data', (data) => {
				decoded += data;
			});
			childProcess.stdout.on('end', () => {
				let decodedOriginal =  decoded;
				console.log(decoded);
				let myArray;
				while ((myArray = errorRegex.exec(decoded)) !== null) {
  					let elements: string[] = myArray.slice(1);
					let startLine =  parseInt(elements[1]);
					let startColumn = parseInt(elements[2])
					let type = elements[4]; //error or warning
					let severity = type.toLowerCase() === "warning" ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Error;
					let message = elements[5];
					let range = new vscode.Range(new vscode.Position(startLine - 1 , startColumn),
					 new vscode.Position(startLine - 1, startColumn));
					let diagnostic = new vscode.Diagnostic(range,message , severity);
					diagnostics.push(diagnostic)
				}
			
				this.diagnosticCollection.set(textDocument.uri, diagnostics);
			});
			childProcess.stdout.on('close', code => {
				console.log(`child process exited with code ${code}`);
			});
		}
	}

	private static commandId: string = 'fortran.lint.runCodeAction';

	public provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.Command[] {
		let diagnostic: vscode.Diagnostic = context.diagnostics[0];
		return [{
			title: "Accept gfortran suggestion",
			command: FortranLintingProvider.commandId,
			arguments: [document, diagnostic.range, diagnostic.message]
		}];
	}

	private runCodeAction(document: vscode.TextDocument, range: vscode.Range, message: string): any {
		let fromRegex: RegExp = /.*Replace:(.*)==>.*/g
		let fromMatch: RegExpExecArray = fromRegex.exec(message.replace(/\s/g, ''));
		let from = fromMatch[1];
		let to: string = document.getText(range).replace(/\s/g, '')
		if (from === to) {
			let newText = /.*==>\s(.*)/g.exec(message)[1]
			let edit = new vscode.WorkspaceEdit();
			edit.replace(document.uri, range, newText);
			return vscode.workspace.applyEdit(edit);
		} else {
			vscode.window.showErrorMessage("The suggestion was not applied because it is out of date. You might have tried to apply the same edit twice.");
		}
	}

	private command: vscode.Disposable;

	public activate(subscriptions: vscode.Disposable[]) {

		this.command = vscode.commands.registerCommand(FortranLintingProvider.commandId, this.runCodeAction, this);
		subscriptions.push(this);
		this.diagnosticCollection = vscode.languages.createDiagnosticCollection();

		vscode.workspace.onDidOpenTextDocument(this.doModernFortranLint, this, subscriptions);
		vscode.workspace.onDidCloseTextDocument((textDocument) => {
			this.diagnosticCollection.delete(textDocument.uri);
		}, null, subscriptions);

		vscode.workspace.onDidSaveTextDocument(this.doModernFortranLint, this);

		// Hlint all open haskell documents
		vscode.workspace.textDocuments.forEach(this.doModernFortranLint, this);
	}


	public dispose(): void {
		this.diagnosticCollection.clear();
		this.diagnosticCollection.dispose();
		this.command.dispose();
	}

}
