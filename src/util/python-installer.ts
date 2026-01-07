import * as vscode from 'vscode';

import { spawnAsPromise } from './tools';

const PYTHON_EXTENSION_ID = 'ms-python.python';
// TODO: add pretty output Log channel or maybe progress notification?
// TODO: Creates a schism between installation and detection/usage of binaries
//       the detection/usage should also leverage the python extension
// TODO: All of these functions watch for change events in the python extension
/**
 * Get Python executable from ms-python.python extension if available, otherwise fallback.
 * @param resource Optional URI to determine workspace-specific environment
 * @returns Python executable path or undefined
 */
async function getPythonExecutable(resource?: vscode.Uri): Promise<string | undefined> {
  const pyExt = vscode.extensions.getExtension(PYTHON_EXTENSION_ID);
  if (!pyExt) return undefined;

  if (!pyExt.isActive) {
    await pyExt.activate();
  }

  // Import type only when extension is available
  const { PythonExtension } = await import('@vscode/python-extension');
  const api = await PythonExtension.api();

  const envPath = api.environments.getActiveEnvironmentPath(resource);
  if (!envPath) return undefined;

  const env = await api.environments.resolveEnvironment(envPath);
  return env?.executable.uri?.fsPath;
}

/**
 * Install Python package using pip with ms-python.python integration.
 * Falls back to system Python if extension unavailable.
 * @param pyPackage name of python package in PyPi
 * @param resource Optional URI for workspace-specific environment selection
 * @returns Success message
 */
export async function installPythonPackage(
  pyPackage: string,
  resource?: vscode.Uri
): Promise<string> {
  let pythonExe = await getPythonExecutable(resource);

  // Fallback to system Python
  if (!pythonExe) {
    const candidates = ['python3', 'py', 'python'];
    for (const cmd of candidates) {
      try {
        await spawnAsPromise(cmd, ['--version'], { windowsHide: true });
        pythonExe = cmd;
        break;
      } catch {
        continue;
      }
    }
  }

  if (!pythonExe) {
    throw new Error('No Python interpreter found');
  }

  const args = ['-m', 'pip', 'install', '--upgrade', pyPackage];

  try {
    // Virtual environments do not support user installs
    // the first attempt is "global"
    await spawnAsPromise(pythonExe, args, { windowsHide: true });
  } catch {
    // Retry with --user for permission-restricted environments
    await spawnAsPromise(pythonExe, [...args, '--user'], { windowsHide: true });
  }
  // TODO: needs better returns, strings are lazy programming
  return `Successfully installed ${pyPackage}`;
}
