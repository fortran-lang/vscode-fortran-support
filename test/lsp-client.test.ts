import * as vscode from 'vscode';
import * as path from 'path';
import { strictEqual } from 'assert';
import { spawnSync } from 'child_process';
import { Logger } from '../src/services/logging-service';
import { FortlsClient } from '../src/lsp/client';
import { delay } from '../src/lib/helper';

suite('Language Server integration tests', () => {
  let doc: vscode.TextDocument;
  const server = new FortlsClient(new Logger());
  const fileUri = vscode.Uri.file(
    path.resolve(__dirname, '../../test/fortran/function_subroutine_definitions.f90')
  );

  suiteSetup(async function (): Promise<void> {
    console.log('Installing fortls Language Server');
    spawnSync('pip', ['install', '--user', '--upgrade', 'fortls']);
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
    const res = server['client'].initializeResult;
    strictEqual(JSON.stringify(ref), JSON.stringify(res));
  });
});
