import * as assert from 'assert';
import * as path from 'path';

import { Uri } from 'vscode';

import { shellTask, spawnAsPromise, pathRelToAbs } from '../../src/util/tools';

declare const __dirname: string;

suite('Tools tests', () => {
  test('shellTask returns correct output', async () => {
    const name = 'pip: fortls';
    const output = await shellTask(
      'python3',
      ['-m', 'pip', 'install', '--upgrade', '--force', 'fortls'],
      name
    );
    assert.strictEqual(output, `${name}: shell task completed successfully.`);
  });

  test('shellTask returns rejected promise', async () => {
    const name = 'pip: fortls';
    await assert.rejects(shellTask('python3', ['-m', 'pip', 'install', 'fortls2'], name));
  });

  test('spawnAsPromise correct stdout, stderr output exit code 0', async () => {
    const [stdout, stderr] = await spawnAsPromise('node', [
      path.resolve(__dirname, './exit-code.js'),
    ]);
    assert.strictEqual(stdout, 'Hello World!');
    assert.strictEqual(stderr, 'No errors');
  });

  test('spawnAsPromise correct stdout, stderr output exit code 1', async () => {
    try {
      const [stdout, stderr] = await spawnAsPromise('node', [
        path.resolve(__dirname, './exit-code-err.js'),
      ]);
    } catch (error: any) {
      const [stdout, stderr] = error as [string, string];
      assert.strictEqual(stdout, 'Hello World!');
      assert.strictEqual(stderr, 'Errors');
    }
  });

  test('spawnAsPromise correct stdout, stderr output exit code 1 with ignoreExitCode', async () => {
    const [stdout, stderr] = await spawnAsPromise(
      'node',
      [path.resolve(__dirname, './exit-code-err.js')],
      undefined,
      undefined,
      true
    );
    assert.strictEqual(stdout, 'Hello World!');
    assert.strictEqual(stderr, 'Errors');
  });

  test('Resolve local paths: undefined', () => {
    const root = Uri.file(path.resolve('/', 'home', 'user', 'project'));
    const absPath = pathRelToAbs('./sample.f90', root);
    assert.strictEqual(absPath, undefined);
  });

  test('Resolve local paths: absolute', () => {
    const root = Uri.file(path.resolve('/', 'home', 'user', 'project'));
    const absPath = pathRelToAbs(path.resolve(process.cwd()), root);
    assert.strictEqual(absPath, path.resolve(process.cwd()));
  });

  test('Resolve local paths: workspace selection', () => {
    const root = Uri.file(path.resolve(__dirname, '../../../test/fortran'));
    const absPath = pathRelToAbs('./sample.f90', root);
    assert.strictEqual(absPath, path.resolve(__dirname, '../../../test/fortran/sample.f90'));
  });
});
