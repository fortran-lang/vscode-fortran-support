import * as assert from 'assert';
import * as cp from 'child_process';
import * as os from 'os';
import * as path from 'path';

import * as vscode from 'vscode';

import { isString, isArrayOfString } from './helper';

export const LS_NAME = 'fortls';
export const EXTENSION_ID = 'fortran';
export const EXTENSION_VSSTORE_ID = 'fortran-lang.linter-gfortran';
export const FORMATTERS = ['Disabled', 'findent', 'fprettify'];

// Platform-specific environment variable delimiter
export const envDelimiter: string = process.platform === 'win32' ? ';' : ':';

/**
 * Generates a document selector for the supported file and languages
 * if the folder is present then a glob pattern for all the files in the workspace
 * is included
 *
 * @warning this should match the value on the package.json otherwise the extension
 * won't work at all
 * @param path `optional` string for `pattern` path to include
 * @returns tuple of DocumentSelector
 */
export function FortranDocumentSelector(path?: string) {
  if (path) {
    return [
      { scheme: 'file', language: 'FortranFreeForm', pattern: `${path}/**/*` },
      { scheme: 'file', language: 'FortranFixedForm', pattern: `${path}/**/*` },
    ];
  } else {
    return [
      { scheme: 'file', language: 'FortranFreeForm' },
      { scheme: 'file', language: 'FortranFixedForm' },
    ];
  }
}

export function isFortran(document: vscode.TextDocument): boolean {
  return (
    FortranDocumentSelector().some(e => e.scheme === document.uri.scheme) &&
    FortranDocumentSelector().some(e => e.language === document.languageId)
  );
}

export function isFreeForm(document: vscode.TextDocument): boolean {
  return document.languageId === 'FortranFreeForm';
}

//
// Taken with minimal alterations from lsp-multi-server-sample
//

/**
 * Return in ascending order the workspace folders in an array of strings
 * @returns sorted workspace folders
 */
export function sortedWorkspaceFolders(): string[] | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders
    ? vscode.workspace.workspaceFolders
        .map(folder => {
          let result = folder.uri.toString();
          if (result.charAt(result.length - 1) !== '/') result = result + '/';
          return result;
        })
        .sort((a, b) => {
          return a.length - b.length;
        })
    : [];
  return workspaceFolders;
}

/**
 * Locate the top most workspace folder for a given file
 * @param folder workspace folder
 * @returns outer most workspace folder
 */
export function getOuterMostWorkspaceFolder(
  folder: vscode.WorkspaceFolder | undefined
): vscode.WorkspaceFolder | undefined {
  if (folder === undefined) return undefined;
  const sorted = sortedWorkspaceFolders();
  for (const element of sorted) {
    let uri = folder.uri.toString();
    if (uri.charAt(uri.length - 1) !== '/') uri = uri + '/';
    if (uri.startsWith(element))
      return vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(element))!;
  }
  return folder;
}

/**
 * Install a package either a Python pip package or a VS Marketplace Extension.
 *
 * For the Python install supply the name of the package in PyPi
 * e.g. fortls
 *
 * For the VS Extension to be installed supply the id of the extension
 * e.g 'hansec.fortran-ls'
 *
 * @param tool name of the tool e.g. fortls
 * @param msg message for installing said package
 * @param toolType type of tool, supports `Python` (through pip) and 'VSExt'
 * @param opts options for the prompt. "Install" and "Don't Show Again" are coded
 * @param action a void function for an action to perform when "Don't Show Again" is pressed
 */
export async function promptForMissingTool(
  tool: string,
  msg: string,
  toolType: string,
  opts: string[],
  action?: () => void
) {
  const items = ['Install'];
  return vscode.window.showInformationMessage(msg, ...opts).then(async selected => {
    if (selected === 'Install') {
      if (toolType === 'Python') {
        try {
          const inst_msg = await pipInstall(tool);
          vscode.window.showInformationMessage(inst_msg);
        } catch (error) {
          vscode.window.showErrorMessage(error);
        }
      } else if (toolType === 'VSExt') {
        // Installing VS Marketplace Extension
        vscode.commands.executeCommand('extension.open', tool);
        vscode.commands.executeCommand('workbench.extensions.installExtension', tool);
      } else {
        vscode.window.showErrorMessage(`Failed to install tool: ${tool}`);
      }
    } else if (selected === "Don't Show Again") {
      action();
    }
  });
}

/**
 * A wrapper around a call to `pip` for installing external tools.
 * Does not explicitly check if `pip` is installed.
 *
 * @param pyPackage name of python package in PyPi
 */
export async function pipInstall(pyPackage: string): Promise<string> {
  const py = 'python3'; // Fetches the top-most python in the Shell
  const args = ['-m', 'pip', 'install', '--user', '--upgrade', pyPackage];
  return await shellTask(py, args, `pip: ${pyPackage}`);
}

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
 * Resolve VSCode internal variables `workspaceFolder`, `env`, `config`, etc.
 *
 * @param input string for which we will substitute internal variables
 * @param additionalEnvironment Additional environmental variables
 * @returns
 */
export function resolveVariables(
  input: string | undefined,
  additionalEnvironment?: { [key: string]: string | string[] }
): string {
  if (!input) {
    return '';
    // return new Promise<string>((resolve) => { resolve("") });
  }

  // Replace environment and configuration variables.
  let regexp: () => RegExp = () =>
    /\$\{((env|config|workspaceFolder|file|fileDirname|fileBasenameNoExtension)(\.|:))?(.*?)\}/g;
  let ret: string = input;
  const cycleCache: Set<string> = new Set();
  while (!cycleCache.has(ret)) {
    cycleCache.add(ret);
    ret = ret.replace(
      regexp(),
      (match: string, ignored1: string, varType: string, ignored2: string, name: string) => {
        // Historically, if the variable didn't have anything before the "." or ":"
        // it was assumed to be an environment variable
        // We ignore that and we make it to be workspacefolder
        if (!varType) {
          varType = 'workspaceFolder';
        }
        let newValue: string | undefined;
        switch (varType) {
          case 'env': {
            if (additionalEnvironment) {
              const v: string | string[] | undefined = additionalEnvironment[name];
              if (isString(v)) {
                newValue = v;
              } else if (input === match && isArrayOfString(v)) {
                newValue = v.join(envDelimiter);
              }
            }
            if (newValue === undefined) {
              newValue = process.env[name];
            }
            break;
          }
          case 'config': {
            const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration();
            if (config) {
              newValue = config.get<string>(name);
            }
            break;
          }
          case 'workspaceFolder': {
            // Only replace ${workspaceFolder:name} variables for now.
            // We may consider doing replacement of ${workspaceFolder} here later, but we would have to update the language server and also
            // intercept messages with paths in them and add the ${workspaceFolder} variable back in (e.g. for light bulb suggestions)
            if (name && vscode.workspace && vscode.workspace.workspaceFolders) {
              let folder: vscode.WorkspaceFolder | undefined =
                vscode.workspace.workspaceFolders.find(
                  folder => folder.name.toLocaleLowerCase() === name.toLocaleLowerCase()
                );
              if (folder) {
                newValue = folder.uri.fsPath;
              }
              // If ${workspaceFolder:workspacename} fails or doesn't exist go to
              // the first availbale workspaceFolder and assign its path
              else {
                folder = vscode.workspace.workspaceFolders[0];
                newValue = folder.uri.fsPath;
              }
            }
            break;
          }
          default: {
            assert.fail('unknown varType matched');
          }
        }
        return newValue !== undefined ? newValue : match;
      }
    );
  }

  // Resolve '~' at the start of the path.
  regexp = () => /^~/g;
  ret = ret.replace(regexp(), (match: string, name: string) => os.homedir());

  return ret;
  // return new Promise<string>((resolve) => { resolve(ret) });
}

/**
 * Resolves a path relative to the workspace folder, an optional `uri`
 * can be provided to help retrieve the correct workspace folder when working
 * with multi-root workspaces, else the first workspace folder is used.
 *
 * @param relPath relative path to resolve against the workspace folder
 * @param uri optional uri of a file/folder within the workspace folder
 * usefull when using multiroot workspaces to pick the right workspace root
 * @returns absolute path relative to the workspace root
 */
export function pathRelToAbs(relPath: string, uri: vscode.Uri): string | undefined {
  if (path.isAbsolute(relPath)) return relPath;
  const root = getOuterMostWorkspaceFolder(vscode.workspace.getWorkspaceFolder(uri));
  if (root === undefined) return undefined;
  return path.join(root.uri.fsPath, relPath);
}

export function getWholeFileRange(document: vscode.TextDocument): vscode.Range {
  return new vscode.Range(0, 0, document.lineCount, 0);
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
