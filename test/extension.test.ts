//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import { strictEqual } from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as path from 'path';
import { FortranDocumentSymbolProvider } from '../src/features/document-symbol-provider';

// Defines a Mocha test suite to group tests of similar kind together
suite('Extension Integration Tests', async () => {
  const filePath = path.resolve(__dirname, '../../test/fortran/sample.f90');
  const openPath = vscode.Uri.file(filePath);
  const doc = await vscode.workspace.openTextDocument(openPath);

  suiteSetup(async () => {
    await vscode.window.showTextDocument(doc);
  });

  test('Built-in symbol provider works as expected', async () => {
    const symbolProvider = new FortranDocumentSymbolProvider();
    const symbols = await symbolProvider.provideDocumentSymbols(doc, null);
    strictEqual(symbols.length, 1);
  });
});
