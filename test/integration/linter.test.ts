import * as vscode from 'vscode';
import * as path from 'path';
import { strictEqual } from 'assert';
import { FortranLintingProvider } from '../../src/lint/linter-provider';
import {
  CleanLintDiagnostics,
  CleanLintFiles,
  InitLint,
  RescanLint,
} from '../../src/commands/commands';

suite('Linter', async () => {
  let doc: vscode.TextDocument;
  const fileUri = vscode.Uri.file(path.resolve(__dirname, '../../../test/fortran/sample.f90'));
  const linter = new FortranLintingProvider();

  suiteSetup(async () => {
    doc = await vscode.workspace.openTextDocument(fileUri);
    await vscode.window.showTextDocument(doc);
  });

  test('Check disposables array has been populated', async () => {
    await linter.activate();
    strictEqual(linter['subscriptions'].length > 1, true);
  });

  // test(`Run command ${InitLint}`, async () => {
  //   await vscode.commands.executeCommand(InitLint);
  // });

  test(`Run command is ${RescanLint}`, async () => {
    await vscode.commands.executeCommand(RescanLint);
  });

  test(`Run command ${CleanLintDiagnostics}`, async () => {
    await vscode.commands.executeCommand(CleanLintDiagnostics);
  });

  test(`Run command ${CleanLintFiles}`, async () => {
    await vscode.commands.executeCommand(CleanLintFiles);
  });

  test('Check disposables have been cleared', () => {
    linter.dispose();
    strictEqual(linter['subscriptions'].length, 0);
  });

  test('Check file association overrides propagate to the linter', async () => {
    const file = '../../../test/fortran/lint/fixed-as-free.f77';
    const fileUri = vscode.Uri.file(path.resolve(__dirname, file));
    doc = await vscode.workspace.openTextDocument(fileUri);
    await vscode.window.showTextDocument(doc);
    const res = await linter['doLint'](doc);
    strictEqual(res !== undefined, true);
    strictEqual(res?.length, 0);
  });
});
