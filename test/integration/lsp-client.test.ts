import { strictEqual } from 'assert';
import * as path from 'path';

import * as vscode from 'vscode';

import { FortlsClient } from '../../src/lsp/client';
import { Logger, LogLevel } from '../../src/services/logging';
import { delay } from '../../src/util/helper';

const logger = new Logger(
  vscode.window.createOutputChannel('Modern Fortran', 'log'),
  LogLevel.DEBUG
);

suite('Language Server integration tests', () => {
  const server = new FortlsClient(logger);
  const fileUri = vscode.Uri.file(path.resolve(__dirname, '../../../test/fortran/sample.f90'));

  suiteSetup(async () => {
    const doc = await vscode.workspace.openTextDocument(fileUri);
    await vscode.window.showTextDocument(doc);
  });

  test('Launch fortls & Check Initialization Response', async () => {
    await server.activate();
    await delay(3000); // wait for server to initialize

    const ref = {
      capabilities: {
        completionProvider: {
          resolveProvider: false,
          triggerCharacters: ['%'],
        },
        definitionProvider: true,
        documentSymbolProvider: true,
        referencesProvider: true,
        hoverProvider: true,
        implementationProvider: true,
        renameProvider: true,
        workspaceSymbolProvider: true,
        textDocumentSync: 2,
        signatureHelpProvider: {
          triggerCharacters: ['(', ','],
        },
        codeActionProvider: true,
      },
    };
    const res = server['client']?.initializeResult;
    strictEqual(JSON.stringify(ref), JSON.stringify(res));
  });
});
