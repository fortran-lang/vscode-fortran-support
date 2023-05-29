import { strictEqual } from 'assert';
import * as path from 'path';

import * as vscode from 'vscode';

import { FortlsClient } from '../../src/lsp/client';
import { Logger, LogLevel } from '../../src/services/logging';
import { EXTENSION_ID } from '../../src/util/tools';

const logger = new Logger(
  vscode.window.createOutputChannel('Modern Fortran', 'log'),
  LogLevel.DEBUG
);

suite('Language Server integration tests', () => {
  const server = new FortlsClient(logger);
  const fileUri = vscode.Uri.file(path.resolve(__dirname, '../../../test/fortran/sample.f90'));
  const config = vscode.workspace.getConfiguration(EXTENSION_ID);
  const oldVal = config.get<string>('fortls.path');
  let doc: vscode.TextDocument;

  suiteSetup(async () => {
    await config.update('fortls.path', './venv/bin/fortls', false);
    doc = await vscode.workspace.openTextDocument(fileUri);
  });

  test('Local path resolution (Document URI)', async () => {
    const ls = await server['fortlsPath'](doc);
    const root = path.resolve(__dirname, '../../../test/fortran/');
    const ref = path.resolve(root, './venv/bin/fortls');
    console.log(`Reference: ${ref}`);
    strictEqual(ls, ref);
  });

  test('Local path resolution (Document missing workspaceFolders[0])', async () => {
    const ls = await server['fortlsPath']();
    const root = path.resolve(__dirname, '../../../test/fortran/');
    const ref = path.resolve(root, './venv/bin/fortls');
    strictEqual(ls, ref);
  });

  suiteTeardown(async () => {
    await config.update('fortls.path', oldVal, false);
  });
});
