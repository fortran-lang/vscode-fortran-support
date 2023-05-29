import { deepStrictEqual, strictEqual } from 'assert';
import * as path from 'path';

import { glob } from 'glob';
import {
  commands,
  Diagnostic,
  DiagnosticSeverity,
  Position,
  Range,
  TextDocument,
  Uri,
  window,
  workspace,
} from 'vscode';

import {
  CleanLintDiagnostics,
  CleanLintFiles,
  InitLint,
  RescanLint,
} from '../../src/commands/commands';
import {
  GNULinter,
  GNUModernLinter,
  IntelLinter,
  LFortranLinter,
  NAGLinter,
} from '../../src/lint/compilers';
import { FortranLintingProvider } from '../../src/lint/provider';
import { LogLevel, Logger } from '../../src/services/logging';
import { EXTENSION_ID, pipInstall } from '../../src/util/tools';

suite('Linter VS Code commands', async () => {
  let doc: TextDocument;
  const fileUri = Uri.file(path.resolve(__dirname, '../../../test/fortran/sample.f90'));
  const linter = new FortranLintingProvider();

  suiteSetup(async () => {
    doc = await workspace.openTextDocument(fileUri);
    await window.showTextDocument(doc);
  });

  test('Check disposables array has been populated', async () => {
    await linter.activate();
    strictEqual(linter['subscriptions'].length > 1, true);
  });

  // test(`Run command ${InitLint}`, async () => {
  //   await commands.executeCommand(InitLint);
  // });

  test(`Run command is ${RescanLint}`, async () => {
    await commands.executeCommand(RescanLint);
  });

  test(`Run command ${CleanLintDiagnostics}`, async () => {
    await commands.executeCommand(CleanLintDiagnostics);
  });

  test(`Run command ${CleanLintFiles}`, async () => {
    await commands.executeCommand(CleanLintFiles);
  });

  test('Check disposables have been cleared', () => {
    linter.dispose();
    strictEqual(linter['subscriptions'].length, 0);
  });

  test('Check file association overrides propagate to the linter', async () => {
    const file = '../../../test/fortran/lint/fixed-as-free.f77';
    const fileUri = Uri.file(path.resolve(__dirname, file));
    doc = await workspace.openTextDocument(fileUri);
    await window.showTextDocument(doc);
    const res = await linter['doLint'](doc);
    strictEqual(res !== undefined, true);
    strictEqual(res?.length, 0);
  });
});

const logger = new Logger(window.createOutputChannel('Modern Fortran', 'log'), LogLevel.DEBUG);

suite('Linter integration', async () => {
  let doc: TextDocument;
  const linter = new FortranLintingProvider(logger);
  const fileUri = Uri.file(path.resolve(__dirname, '../../../test/fortran/lint/test1.f90'));
  const root = path.resolve(__dirname, '../../../test/fortran/');
  const config = workspace.getConfiguration(EXTENSION_ID);
  const oldVals = config.get<string[]>('linter.includePaths');

  suiteSetup(async () => {
    doc = await workspace.openTextDocument(fileUri);
    await window.showTextDocument(doc);
  });
  // different versions of gfortran report the error at a different column number
  // need to implement a the compiler versioning see #523
  test('GNU - API call to doLint produces correct diagnostics', async () => {
    const diags = await new FortranLintingProvider(logger)['doLint'](doc);
    const ref: Diagnostic[] = [
      new Diagnostic(
        new Range(new Position(21 - 1, 18 - 1), new Position(21 - 1, 18 - 1)),
        'Syntax error in argument list at (1)',
        DiagnosticSeverity.Error
      ),
      new Diagnostic(
        new Range(new Position(7 - 1, 9 - 1), new Position(7 - 1, 9 - 1)),
        "Type specified for intrinsic function 'size' at (1) is ignored [-Wsurprising]",
        DiagnosticSeverity.Warning
      ),
    ];

    deepStrictEqual(diags, ref);
  });

  test('Include path globs & internal variable resolution', async () => {
    const paths = linter['getGlobPathsFromSettings']('linter.includePaths');
    // const refs: string[] = fg.sync(path.dirname(fileUri.path) + '/**', { onlyDirectories: true });
    const refs: string[] = glob.sync(path.dirname(fileUri.path) + '/**/');
    deepStrictEqual(paths, refs);
  });

  test('Path cache contains expected values', async () => {
    let refs: string[] = ['${workspaceFolder}/lint/**'];
    deepStrictEqual(linter['pathCache'].get('linter.includePaths')?.globs, refs);
    // refs = fg.sync(path.join(root, 'lint') + '/**', { onlyDirectories: true });
    refs = glob.sync(path.join(root, 'lint') + '/**/');
    deepStrictEqual(linter['pathCache'].get('linter.includePaths')?.paths, refs);
  });

  test('Update paths using cache', async () => {
    // const refs: string[] = fg.sync([path.join(root, 'lint') + '/**', path.join(root, 'debug')], {
    //   onlyDirectories: true,
    // });
    const refs: string[] = [path.join(root, 'lint') + '/**', path.join(root, 'debug')]
      .map(d => glob.sync(d + '/'))
      .flat();
    await config.update(
      'linter.includePaths',
      ['${workspaceFolder}/lint/**', path.join(root, 'debug')],
      false
    );
    const paths = linter['getGlobPathsFromSettings']('linter.includePaths');
    deepStrictEqual(paths, refs);
  });

  test('Linter user setting returns the right linter internally', () => {
    const names = ['gfortran', 'ifort', 'ifx', 'nagfor', 'lfortran', 'fake'];
    for (const n of names) {
      const compiler = linter['getLinter'](n);
      if (n === 'gfortran') {
        if (linter['settings'].modernGNU) {
          strictEqual(compiler instanceof GNUModernLinter, true);
        } else {
          strictEqual(compiler instanceof GNULinter, true);
        }
      } else if (n === 'ifort' || n === 'ifx') {
        strictEqual(compiler instanceof IntelLinter, true);
      } else if (n === 'nagfor') {
        strictEqual(compiler instanceof NAGLinter, true);
      } else if (n == 'lfortran') {
        strictEqual(compiler instanceof LFortranLinter, true);
      } else {
        strictEqual(compiler instanceof GNULinter, true);
      }
    }
  });

  suiteTeardown(async function (): Promise<void> {
    await config.update('linter.includePaths', oldVals, false);
  });
});

suite('Linter (fypp) integration', () => {
  const root = path.resolve(__dirname, '../../../test/fortran/');
  const config = workspace.getConfiguration(EXTENSION_ID);

  suiteSetup(async () => {
    await pipInstall('fypp');
    await config.update(`linter.fypp.enabled`, true, false);
  });

  test('GNU - API call to doLint produces correct diagnostics', async () => {
    const fileUri = Uri.file(path.resolve(__dirname, '../../../test/fortran/fypp/demo.fypp'));
    const doc = await workspace.openTextDocument(fileUri);
    await window.showTextDocument(doc);

    const diags = await new FortranLintingProvider(logger)['doLint'](doc);
    const refs: Diagnostic[] = [
      new Diagnostic(
        new Range(new Position(18, 35), new Position(18, 35)),
        "Unused dummy argument 'this' at (1) [-Wunused-dummy-argument]",
        DiagnosticSeverity.Warning
      ),
    ];
    deepStrictEqual(diags, refs);
  });

  suiteTeardown(async () => {
    await config.update(`linter.fypp.enabled`, false, false);
  });
});
