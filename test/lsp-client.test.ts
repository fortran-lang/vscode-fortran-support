import * as vscode from 'vscode';
import * as path from 'path';
import { strictEqual } from 'assert';
import { FortlsClient } from '../src/lsp/client';
import { delay } from '../src/lib/helper';
import { Logger, LogLevel } from '../src/services/logging';

const logger = new Logger(
  vscode.window.createOutputChannel('Modern Fortran', 'log'),
  LogLevel.DEBUG
);

suite('Language Server integration tests', () => {
  let doc: vscode.TextDocument;
  const server = new FortlsClient(logger);
  const fileUri = vscode.Uri.file(
    path.resolve(__dirname, '../../test/fortran/function_subroutine_definitions.f90')
  );

  suiteSetup(async function (): Promise<void> {
    await server.activate();
  });

  test('Launch fortls & Check Initialization Response', async () => {
    await delay(3000); // wait for server to initialize
    doc = await vscode.workspace.openTextDocument(fileUri);
    await vscode.window.showTextDocument(doc);

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
