import * as path from 'path';

import { glob } from 'glob';
import Mocha from 'mocha';

import * as mochaConfig from './mochaConfig.json';

export async function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha(mochaConfig as Mocha.MochaOptions);

  const testsRoot = __dirname;
  // Default to running all tests if TEST_TYPE is not set
  const testType = process.env.TEST_TYPE || '**';
  const pattern = `${testType}/**/*.test.js`;

  // Use glob promise API to find files
  const files = await glob(pattern, { cwd: testsRoot });

  // Add files to the test suite
  files.forEach(f => {
    mocha.addFile(path.resolve(testsRoot, f));
  });

  // Run the mocha test
  return new Promise((resolve, reject) => {
    try {
      mocha.run(failures => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
