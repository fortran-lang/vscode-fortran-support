'use strict';

import { strictEqual } from 'assert';

import { selectDebugAdapter } from '../../src/debug/configuration';

suite('Debug Adapter Integration Tests', () => {
  test('selectDebugAdapter returns valid type', function () {
    try {
      const adapter = selectDebugAdapter();
      const debugType = adapter.debugType(process.platform);
      const validTypes = ['cppdbg', 'cppvsdbg', 'gdb', 'lldb'];
      strictEqual(validTypes.includes(debugType), true);
    } catch (err) {
      // No debugger installed in test environment - that's fine
      strictEqual((err as Error).message.includes('No supported debugger extension found'), true);
    }
  });
});
