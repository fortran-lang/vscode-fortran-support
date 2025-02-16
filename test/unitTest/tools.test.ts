import * as assert from 'assert';
import * as path from 'path';

import { Uri } from 'vscode';

import { pathRelToAbs } from '../../src/util/tools';

suite('Tools tests', () => {
  test('Resolve local paths: undefined', () => {
    const root = Uri.parse('/home/user/project');
    const absPath = pathRelToAbs('./sample.f90', root);
    assert.strictEqual(absPath, undefined);
  });

  test('Resolve local paths: absolute', () => {
    const root = Uri.parse('/home/user/project');
    const absPath = pathRelToAbs(path.resolve(process.cwd()), root);
    assert.strictEqual(absPath, path.resolve(process.cwd()));
  });

  test('Resolve local paths: workspace selection', () => {
    const root = Uri.parse(path.resolve(__dirname, '../../../test/fortran'));
    const absPath = pathRelToAbs('./sample.f90', root);
    assert.strictEqual(absPath, path.resolve(__dirname, '../../../test/fortran/sample.f90'));
  });
});
