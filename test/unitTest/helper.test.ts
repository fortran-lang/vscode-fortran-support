import { strictEqual } from 'assert';

import * as vscode from 'vscode';

import {
  isUri,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isOptionalString,
  isArrayOfString,
  arraysEqual,
  isPositionInString,
} from '../../src/util/helper';

suite('helper functions isTypeVariable tests', () => {
  test('isUri', () => {
    strictEqual(true, isUri(vscode.Uri.parse('file:///home/user/file.txt')));
  });
  test('isString', () => {
    strictEqual(true, isString('hello'));
  });
  test('isNumber', () => {
    strictEqual(true, isNumber(1));
  });
  test('isBoolean', () => {
    strictEqual(true, isBoolean(true));
  });
  test('isObject', () => {
    strictEqual(true, isObject({}));
  });
  test('isArray', () => {
    strictEqual(true, isArray([]));
  });
  test('isOptionalString', () => {
    strictEqual(true, isOptionalString('hello'));
    strictEqual(true, isOptionalString(undefined));
  });
  test('isArrayOfString', () => {
    strictEqual(true, isArrayOfString(['hello']));
  });
  test('arraysEqual', () => {
    strictEqual(true, arraysEqual(['hello'], ['hello']));
    strictEqual(false, arraysEqual(['hello'], [null]));
    strictEqual(false, arraysEqual(['hello'], ['hello', 'world']));
    strictEqual(false, arraysEqual(['hello'], ['world']));
  });
});

suite('helper functions general tests', () => {
  test('isPositionInString', async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: 'text',
      content: 'hello "world"',
    });
    const pos = new vscode.Position(0, 7);
    strictEqual(true, isPositionInString(doc, pos));
  });
});
