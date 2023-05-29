import { strictEqual } from 'assert';
import * as path from 'path';

import * as vscode from 'vscode';

import { FortranDocumentSymbolProvider } from '../../src/fallback-features/document-symbol-provider';

suite('Document Symbol Provider', () => {
  let doc: vscode.TextDocument;
  const fileUri = vscode.Uri.file(path.resolve(__dirname, '../../../test/fortran/sample.f90'));

  suiteSetup(async () => {
    doc = await vscode.workspace.openTextDocument(fileUri);
    await vscode.window.showTextDocument(doc);
  });

  test('should return symbols', async () => {
    const provider = new FortranDocumentSymbolProvider();
    const symbols = await provider.provideDocumentSymbols(
      doc,
      new vscode.CancellationTokenSource().token
    );
    strictEqual(symbols.length, 2);
  });
});
