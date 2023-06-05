'use strict';

import * as cp from 'child_process';

import * as vscode from 'vscode';

export async function shellTask(command: string, args: string[], name: string): Promise<string> {
  const task = new vscode.Task(
    { type: 'shell' },
    vscode.TaskScope.Workspace,
    name,
    'Modern Fortran',
    new vscode.ShellExecution(command, args)
  );
  // Temporay fix to https://github.com/microsoft/vscode/issues/157756
  (<vscode.Task>task).definition = { type: 'shell', command: command };
  const execution = await vscode.tasks.executeTask(task);
  return await new Promise<string>((resolve, reject) => {
    const disposable = vscode.tasks.onDidEndTaskProcess(e => {
      if (e.execution === execution) {
        disposable.dispose();
        if (e.exitCode !== 0) {
          reject(`ERROR: ${e.execution.task.name} failed with code ${e.exitCode}`);
        }
        resolve(`${name}: shell task completed successfully.`);
      }
    });
  });
}

/**
 * Spawn a command as a `Promise`
 * @param cmd command to execute
 * @param args arguments to pass to the command
 * @param options child_process.spawn options
 * @param input any input to pass to stdin
 * @param ignoreExitCode ignore the exit code of the process and `resolve` the promise
 * @returns Tuple[string, string] `[stdout, stderr]`. By default will `reject` if exit code is non-zero.
 */
export async function spawnAsPromise(
  cmd: string,
  args: ReadonlyArray<string> | undefined,
  options?: cp.SpawnOptions | undefined,
  input?: string | undefined,
  ignoreExitCode?: boolean
) {
  return new Promise<[string, string]>((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const child = cp.spawn(cmd, args, options);
    child.stdout.on('data', data => {
      stdout += data;
    });
    child.stderr.on('data', data => {
      stderr += data;
    });
    child.on('close', code => {
      if (ignoreExitCode || code === 0) {
        resolve([stdout, stderr]);
      } else {
        reject([stdout, stderr]);
      }
    });
    child.on('error', err => {
      reject(err.toString());
    });

    if (input) {
      child.stdin.write(input);
      child.stdin.end();
    }
  });
}
