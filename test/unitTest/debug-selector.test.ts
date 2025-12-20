'use strict';

import { strictEqual, throws } from 'assert';

import * as vscode from 'vscode';

import {
  selectDebugAdapter,
  createDebugConfiguration,
  DebugType,
} from '../../src/debug/configuration';

suite('Debug Adapter Selector Tests', () => {
  suite('selectDebugAdapter', () => {
    test('selects cppdbg on Linux with cpptools', () => {
      const getter = (id: string) =>
        id === 'ms-vscode.cpptools' ? ({} as vscode.Extension<any>) : undefined;
      const spec = selectDebugAdapter(getter);
      strictEqual(spec.debugType('linux'), DebugType.CppDbg);
    });

    test('selects cppvsdbg on Windows with cpptools', () => {
      const getter = (id: string) =>
        id === 'ms-vscode.cpptools' ? ({} as vscode.Extension<any>) : undefined;
      const spec = selectDebugAdapter(getter);
      strictEqual(spec.debugType('win32'), DebugType.CppVsDbg);
    });

    test('selects gdb when cdt-gdb is installed', () => {
      const getter = (id: string) =>
        id === 'eclipse-cdt.cdt-gdb-vscode' ? ({} as vscode.Extension<any>) : undefined;
      const spec = selectDebugAdapter(getter);
      strictEqual(spec.debugType('linux'), DebugType.Gdb);
    });

    test('selects lldb when codelldb is installed', () => {
      const getter = (id: string) =>
        id === 'vadimcn.vscode-lldb' ? ({} as vscode.Extension<any>) : undefined;
      const spec = selectDebugAdapter(getter);
      strictEqual(spec.debugType('linux'), DebugType.Lldb);
    });

    test('prefers cpptools over others', () => {
      const getter = (_id: string) => ({}) as vscode.Extension<any>;
      const spec = selectDebugAdapter(getter);
      strictEqual(spec.debugType('linux'), DebugType.CppDbg);
    });

    test('prefers gdb over lldb', () => {
      const getter = (id: string) =>
        id === 'eclipse-cdt.cdt-gdb-vscode' || id === 'vadimcn.vscode-lldb'
          ? ({} as vscode.Extension<any>)
          : undefined;
      const spec = selectDebugAdapter(getter);
      strictEqual(spec.debugType('linux'), DebugType.Gdb);
    });

    test('throws when no debugger is installed', () => {
      const getter = (_id: string) => undefined;
      throws(() => selectDebugAdapter(getter), /No supported debugger extension found/);
    });
  });

  suite('createDebugConfiguration', () => {
    test('creates basic config', () => {
      const adapter = {
        extensionId: 'ms-vscode.cpptools',
        debugType: () => DebugType.CppDbg,
      } as const;
      const config = createDebugConfiguration({
        name: 'Test',
        adapter,
        program: '/path/to/prog',
        cwd: '/cwd',
      });
      strictEqual(config.name, 'Test');
      strictEqual(config.type, DebugType.CppDbg);
      strictEqual(config.request, 'launch');
      strictEqual(config.program, '/path/to/prog');
      strictEqual(config.cwd, '/cwd');
    });
  });
});
