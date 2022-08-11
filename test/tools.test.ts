import * as assert from 'assert';
import { shellTask } from '../src/lib/tools';

suite('Tools tests', () => {
  test('shellTask returns correct output', async () => {
    const name = 'pip: fortls';
    const output = await shellTask(
      'python3',
      ['-m', 'pip', 'install', '--upgrade', '--force', 'fortls'],
      name
    );
    assert.strictEqual(output, `${name}: shell task completed successfully.`);
  });

  test('shellTask returns rejected promise', async () => {
    const name = 'pip: fortls';
    assert.rejects(shellTask('python3', ['-m', 'pip', 'install', 'fortls2'], name));
  });
});
