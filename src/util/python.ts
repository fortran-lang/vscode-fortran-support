'use strict';

import * as path from 'path';

import { extensions, Uri } from 'vscode';

import { IExtensionApi, ResolvedEnvironment } from './ms-python-api/types';
import { shellTask, spawnAsPromise } from './shell';

/**
 * Get Python path from the workspace or the system
 *
 * @param resource file, folder or workspace to search for python
 * @returns string with path to python
 */
export async function getPythonPath(resource?: Uri): Promise<string> {
  const pythonEnv = await getPythonEnvMS(resource);
  if (pythonEnv) {
    return pythonEnv.path;
  }
  return process.platform === 'win32' ? 'python' : 'python3';
}

/**
 * Get path that pip installs binaries into.
 * Useful, for when the path is not in the PATH environment variable.
 *
 * @param resource file, folder or workspace
 * @returns string with path to pip
 */
export async function getPipBinDir(resource?: Uri): Promise<string> {
  const py = await getPythonPath(resource);
  const script = path.join(__dirname, 'scripts', 'get_pip_bin_dir.py');
  const [stdout, stderr] = await spawnAsPromise(py, [script]);
  if (stderr) {
    throw new Error(stderr);
  }
  return stdout.trim();
}

/**
 * A wrapper around a call to `pip` for installing external tools.
 * Does not explicitly check if `pip` is installed.
 *
 * @param pyPackage name of python package in PyPi
 */
export async function pipInstall(pyPackage: string): Promise<string> {
  const py = await getPythonPath();
  const args = ['-m', 'pip', 'install', '--user', '--upgrade', pyPackage];
  return await shellTask(py, args, `pip: ${pyPackage}`);
}

/**
 * Get the active Python environment, if any, via the ms-python.python
 * extension API.
 *
 * @param resource file/folder/workspace Uri or undefined
 * @returns Path to the active Python environment or undefined
 */
export async function getPythonEnvMS(
  resource?: Uri | undefined
): Promise<ResolvedEnvironment | undefined> {
  try {
    const extension = extensions.getExtension('ms-python.python');
    if (!extension) {
      return undefined; // extension not installed
    }
    if (!extension.isActive) {
      await extension.activate();
    }
    const pythonApi: IExtensionApi = extension.exports as IExtensionApi;
    const activeEnv: ResolvedEnvironment = await pythonApi.environments.resolveEnvironment(
      pythonApi.environments.getActiveEnvironmentPath(resource)
    );
    if (!activeEnv) {
      return undefined; // no active environment, unlikely but possible
    }
    return activeEnv;
  } catch (error) {
    return undefined;
  }
}
