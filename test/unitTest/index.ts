import path from 'path';

import { glob } from 'glob';
import Mocha from 'mocha';

export async function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
  });

  const testsRoot = __dirname;

  // Use glob promise API to find files
  const files = await glob('**/**.test.js', { cwd: testsRoot });

  // Add files to the test suite
  files.forEach((f: string) => {
    mocha.addFile(path.join(testsRoot, f));
  });

  // Run the mocha test
  mocha.timeout(300000);
  const runner = mocha.run();

  // Wait for the test runner to complete
  const failures = await new Promise<number>((resolve, reject) => {
    runner.on('end', () => {
      resolve(runner.failures);
    });
    runner.on('fail', (test: Mocha.Test, err: Error) => {
      reject(err);
    });
  });

  // Throw an error if there were any test failures
  if (failures > 0) {
    throw new Error(`${failures} tests failed.`);
  }
}
