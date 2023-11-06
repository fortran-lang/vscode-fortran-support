import * as path from 'path';

import { extensions, Uri } from 'vscode';

import { IExtensionApi, ResolvedEnvironment } from './ms-python-api/types';
import { shellTask, spawnAsPromise } from './shell';

export class Python {
  public readonly path: Promise<string>;
  private usingMSPython = false;
  private pythonEnvMS: ResolvedEnvironment | undefined;

  constructor(resource?: Uri) {
    this.path = this.getPythonPath(resource);
  }

  /**
   * Get the path to the active Python interpreter.
   *
   * @returns The path to the active Python interpreter.
   */
  public async getPythonPath(resource?: Uri): Promise<string> {
    const pythonEnv = await this.getPythonEnvMS(resource);
    if (pythonEnv) {
      this.usingMSPython = true;
      return pythonEnv.path;
    }
    return process.platform === 'win32' ? 'python' : 'python3';
  }

  /**
   * Get the path to the directory where pip installs binaries.
   *
   * @returns The path to the directory where pip installs binaries.
   */
  public async getPipBinDir(): Promise<string> {
    const py = await this.path;
    const script = path.join(__dirname, 'scripts', 'get_pip_bin_dir.py');
    const [stdout, stderr] = await spawnAsPromise(py, [script]);
    if (stderr) {
      throw new Error(stderr);
    }
    return stdout.trim();
  }

  /**
   * Install a Python package using pip.
   *
   * @param packageName The name of the package to install.
   * @returns The output of the pip command.
   */
  public async pipInstall(packageName: string): Promise<string> {
    const py = await this.path;
    const args = ['-m', 'pip', 'install', '--user', '--upgrade', packageName];
    return await shellTask(py, args, `pip: ${packageName}`);
  }

  /**
   * Get the active Python environment, if any, via the ms-python.python
   * extension API.
   *
   * @returns The active Python environment, or undefined if there is none.
   */
  public async getPythonEnvMS(resource?: Uri): Promise<ResolvedEnvironment | undefined> {
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
      this.pythonEnvMS = activeEnv;
      return activeEnv;
    } catch (error) {
      return undefined;
    }
  }

  public async isInstalled(packageName: string): Promise<boolean> {
    const py = await this.path;
    const script = path.join(__dirname, 'scripts', 'mod_in_env.py');
    try {
      const [_, stderr] = await spawnAsPromise(py, [script, packageName]);
      if (stderr) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}
