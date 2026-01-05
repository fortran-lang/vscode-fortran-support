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
    include: ['**/out/**/*.js'],
    exclude: ['**/node_modules/**', '**/out/test/**'],
    reporter: ['html', 'text', 'lcov'],
  },
});
