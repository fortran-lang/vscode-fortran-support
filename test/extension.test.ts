//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from "assert";
import * as fs from "fs";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as myExtension from "../src/extension";
import { FortranDocumentSymbolProvider } from "../src/features/document-symbol-provider";

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {
  test("symbol provider works as expected", async () => {
    const filePath = "/test/resources/sample.f90";
    const openPath = vscode.Uri.file(`${vscode.workspace.rootPath}${filePath}`);
    const doc = await vscode.workspace.openTextDocument(openPath);
    vscode.window.showTextDocument(doc);
    const symbolProvider = new FortranDocumentSymbolProvider();
    const symbols = await symbolProvider.provideDocumentSymbols(doc, null);
    assert.equal(symbols.length, 6);
  });
});
