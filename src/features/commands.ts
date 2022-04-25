'use strict';

import * as vscode from 'vscode';
import { checkLanguageServerActivation, clients } from '../lsp/client';

export const RestartLS = 'fortran.analysis.restartLanguageServer';
export const StarttLS = 'fortran.analysis.startLanguageServer';
export const StoptLS = 'fortran.analysis.stopLanguageServer';

let commandsActivated = false;

export function registerCommands(disposables: vscode.Disposable[]): void {
  if (commandsActivated) return;

  commandsActivated = true;
  disposables.push(vscode.commands.registerCommand(RestartLS, onRestartLS));
  disposables.push(vscode.commands.registerCommand(StarttLS, onStartLS));
  disposables.push(vscode.commands.registerCommand(StoptLS, onStopLS));
}

function onRestartLS(): void {
  const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
  vscode.window.showInformationMessage('Restarting the Fortran Language Server');
  const folder = checkLanguageServerActivation(activeEditor.document);

  if (!folder) return;
  clients.get(folder.uri.toString()).stop();
  clients.get(folder.uri.toString()).start();
}

function onStartLS(): void {
  const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
  vscode.window.showInformationMessage('Starting the Fortran Language Server');
  const folder = checkLanguageServerActivation(activeEditor.document);

  if (!folder) return;
  clients.get(folder.uri.toString()).start();
}

function onStopLS(): void {
  const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
  vscode.window.showInformationMessage('Stopping the Fortran Language Server');
  const folder = checkLanguageServerActivation(activeEditor.document);

  if (!folder) return;
  clients.get(folder.uri.toString()).stop();
}
