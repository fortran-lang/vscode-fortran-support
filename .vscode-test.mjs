import { defineConfig } from '@vscode/test-cli';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const mochaConfig = require('./test/mochaConfig.json');

const commonConfig = {
  version: 'stable',
  workspaceFolder: 'test/fortran',
  launchArgs: ['--disable-extensions'],
  mocha: mochaConfig,
};

export default defineConfig([
  {
    label: 'unit',
    files: 'out/test/unitTest/**/*.test.js',
    ...commonConfig,
  },
  {
    label: 'integration',
    files: 'out/test/integration/**/*.test.js',
    ...commonConfig,
  },
]);
