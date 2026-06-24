import { strictEqual } from 'assert';

import * as vscode from 'vscode';

import {
  collectDefinedPreprocessorMacros,
  computeInactivePreprocessorRanges,
  evaluatePreprocessorCondition,
} from '../../src/fallback-features/inactive-preprocessor-provider';

suite('inactive preprocessor provider', () => {
  test('collectDefinedPreprocessorMacros returns configured macro names', () => {
    const macros = collectDefinedPreprocessorMacros({
      FOO: '1',
      BAR: '',
    });

    strictEqual(macros.has('FOO'), true);
    strictEqual(macros.has('BAR'), true);
    strictEqual(macros.has('BAZ'), false);
  });

  test('evaluatePreprocessorCondition supports bare macro names and defined(MACRO)', () => {
    const macros = new Set<string>(['FOO', 'BAR']);

    strictEqual(evaluatePreprocessorCondition('0', macros), false);
    strictEqual(evaluatePreprocessorCondition('1', macros), true);
    strictEqual(evaluatePreprocessorCondition('2', macros), true);
    strictEqual(evaluatePreprocessorCondition('-1', macros), true);
    strictEqual(evaluatePreprocessorCondition('FOO', macros), true);
    strictEqual(evaluatePreprocessorCondition('BAZ', macros), false);
    strictEqual(evaluatePreprocessorCondition('defined(FOO)', macros), true);
    strictEqual(evaluatePreprocessorCondition('defined(BAZ)', macros), false);
  });

  test('evaluatePreprocessorCondition rejects unsupported expressions', () => {
    const macros = new Set<string>(['FOO', 'BAR']);

    strictEqual(evaluatePreprocessorCondition('defined(FOO) && defined(BAR)', macros), false);
    strictEqual(evaluatePreprocessorCondition('FOO == 1', macros), false);
    strictEqual(evaluatePreprocessorCondition('!defined(FOO)', macros), false);
  });

  test('computeInactivePreprocessorRanges dims false #ifdef branch', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'FortranFreeForm',
      content: ['#ifdef FOO', 'print *, "foo"', '#else', 'print *, "bar"', '#endif'].join('\n'),
    });

    const ranges = computeInactivePreprocessorRanges(document, new Set<string>());

    strictEqual(ranges.length, 1);
    strictEqual(ranges[0].start.line, 1);
    strictEqual(ranges[0].end.line, 1);
  });

  test('computeInactivePreprocessorRanges dims false #ifndef branch', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'FortranFreeForm',
      content: ['#ifndef FOO', 'print *, "foo"', '#else', 'print *, "bar"', '#endif'].join('\n'),
    });

    const ranges = computeInactivePreprocessorRanges(document, new Set<string>(['FOO']));

    strictEqual(ranges.length, 1);
    strictEqual(ranges[0].start.line, 1);
    strictEqual(ranges[0].end.line, 1);
  });

  test('computeInactivePreprocessorRanges handles nested inactive regions', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'FortranFreeForm',
      content: [
        '#ifdef OUTER',
        'print *, "outer"',
        '#ifdef INNER',
        'print *, "inner"',
        '#else',
        'print *, "inner else"',
        '#endif',
        '#endif',
      ].join('\n'),
    });

    const ranges = computeInactivePreprocessorRanges(document, new Set<string>(['OUTER']));

    strictEqual(ranges.length, 1);
    strictEqual(ranges[0].start.line, 3);
    strictEqual(ranges[0].end.line, 3);
  });

  test('computeInactivePreprocessorRanges ignores directive lines themselves', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'FortranFreeForm',
      content: ['#ifdef FOO', '#else', 'print *, "bar"', '#endif'].join('\n'),
    });

    const ranges = computeInactivePreprocessorRanges(document, new Set<string>(['FOO']));

    strictEqual(ranges.length, 1);
    strictEqual(ranges[0].start.line, 2);
    strictEqual(ranges[0].end.line, 2);
  });

  test('computeInactivePreprocessorRanges activates matching #elif branch', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'FortranFreeForm',
      content: [
        '#ifdef FOO',
        'print *, "foo"',
        '#elif BAR',
        'print *, "bar"',
        '#else',
        'print *, "fallback"',
        '#endif',
      ].join('\n'),
    });

    const ranges = computeInactivePreprocessorRanges(document, new Set<string>(['BAR']));

    strictEqual(ranges.length, 2);
    strictEqual(ranges[0].start.line, 1);
    strictEqual(ranges[0].end.line, 1);
    strictEqual(ranges[1].start.line, 5);
    strictEqual(ranges[1].end.line, 5);
  });

  test('computeInactivePreprocessorRanges supports #elif defined(MACRO)', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'FortranFreeForm',
      content: [
        '#ifdef FOO',
        'print *, "foo"',
        '#elif defined(BAR)',
        'print *, "bar"',
        '#else',
        'print *, "fallback"',
        '#endif',
      ].join('\n'),
    });

    const ranges = computeInactivePreprocessorRanges(document, new Set<string>(['BAR']));

    strictEqual(ranges.length, 2);
    strictEqual(ranges[0].start.line, 1);
    strictEqual(ranges[0].end.line, 1);
    strictEqual(ranges[1].start.line, 5);
    strictEqual(ranges[1].end.line, 5);
  });

  test('computeInactivePreprocessorRanges supports #if MACRO', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'FortranFreeForm',
      content: ['#if FOO', 'print *, "foo"', '#else', 'print *, "fallback"', '#endif'].join('\n'),
    });

    const ranges = computeInactivePreprocessorRanges(document, new Set<string>(['FOO']));

    strictEqual(ranges.length, 1);
    strictEqual(ranges[0].start.line, 3);
    strictEqual(ranges[0].end.line, 3);
  });

  test('computeInactivePreprocessorRanges supports #if defined(MACRO)', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'FortranFreeForm',
      content: [
        '#if defined(FOO)',
        'print *, "foo"',
        '#else',
        'print *, "fallback"',
        '#endif',
      ].join('\n'),
    });

    const ranges = computeInactivePreprocessorRanges(document, new Set<string>(['FOO']));

    strictEqual(ranges.length, 1);
    strictEqual(ranges[0].start.line, 3);
    strictEqual(ranges[0].end.line, 3);
  });

  test('computeInactivePreprocessorRanges treats unsupported #if expressions as inactive', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'FortranFreeForm',
      content: [
        '#if defined(FOO) && defined(BAR)',
        'print *, "complex"',
        '#else',
        'print *, "fallback"',
        '#endif',
      ].join('\n'),
    });

    const ranges = computeInactivePreprocessorRanges(document, new Set<string>(['FOO', 'BAR']));

    strictEqual(ranges.length, 1);
    strictEqual(ranges[0].start.line, 1);
    strictEqual(ranges[0].end.line, 1);
  });

  test('computeInactivePreprocessorRanges supports #elif 1', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'FortranFreeForm',
      content: [
        '#if defined(FOO)',
        'print *, "foo"',
        '#elif 1',
        'print *, "fallback"',
        '#endif',
      ].join('\n'),
    });

    const ranges = computeInactivePreprocessorRanges(document, new Set<string>());

    strictEqual(ranges.length, 1);
    strictEqual(ranges[0].start.line, 1);
    strictEqual(ranges[0].end.line, 1);
  });

  test('computeInactivePreprocessorRanges supports #if 0', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'FortranFreeForm',
      content: ['#if 0', 'print *, "inactive"', '#else', 'print *, "active"', '#endif'].join('\n'),
    });

    const ranges = computeInactivePreprocessorRanges(document, new Set<string>());

    strictEqual(ranges.length, 1);
    strictEqual(ranges[0].start.line, 1);
    strictEqual(ranges[0].end.line, 1);
  });

  test('computeInactivePreprocessorRanges supports non-zero integer literals', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'FortranFreeForm',
      content: ['#if 2', 'print *, "active"', '#else', 'print *, "inactive"', '#endif'].join('\n'),
    });

    const ranges = computeInactivePreprocessorRanges(document, new Set<string>());

    strictEqual(ranges.length, 1);
    strictEqual(ranges[0].start.line, 3);
    strictEqual(ranges[0].end.line, 3);
  });
});
