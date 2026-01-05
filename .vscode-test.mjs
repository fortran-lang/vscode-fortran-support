import { defineConfig } from '@vscode/test-cli';
import { createRequire } from 'module';
import * as path from 'path';
import process from 'process';

const require = createRequire(import.meta.url);
const mochaConfig = require('./test/mochaConfig.json');

const commonConfig = {
  version: 'stable',
  workspaceFolder: 'test/fortran',
  launchArgs: ['--disable-extensions'],
  mocha: mochaConfig,
};

export default defineConfig({
  tests: [
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
  ],
  coverage: {
    includeAll: true,
    include: [path.join(process.cwd(), 'out/**/*.js')],
    exclude: ['**/node_modules/**', path.join(process.cwd(), 'out/test/**')],
    reporter: ['html', 'text', 'lcov'],
  },
});
