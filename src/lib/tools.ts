export const LANG_SERVER_TOOL_ID = 'fortran-language-server';
export const FORMATTERS = ['Disabled', 'findent', 'fprettify'];

import * as os from 'os';
import * as vscode from 'vscode'
import * as assert from 'assert';
import * as cp from 'child_process';
import { LoggingService } from '../services/logging-service';
import { isString, isArrayOfString } from './helper';

// Platform-specific environment variable delimiter
export const envDelimiter: string = (process.platform === 'win32') ? ";" : ":";


export function installPythonTool(pyPackage: string, logger?: LoggingService) {

  const installProcess = cp.spawn(
    'pip',
    'install --user --upgrade '.concat(pyPackage).split(' ')
  );
  installProcess.stdout.on('data', (data) => { logger.logInfo(`pip install: ${data}`) });
  installProcess.on('exit', (code, signal) => {
    if (code !== 0) {
      logger.logError(`Python package ${pyPackage} failed to install with code: ${code}, signal: ${signal}`);
    }
  });
  installProcess.on('error', err => {
    logger.logError(`${err}`);
  });
}

/**
 * Resolve VSCode internal variables `workspaceFolder`, `env`, `config`, etc.
 * 
 * @param input string for which we will substitute internal variables
 * @param additionalEnvironment Additional environmental variables
 * @returns 
 */
export function resolveVariables(input: string | undefined, additionalEnvironment?: { [key: string]: string | string[] }): string {
  if (!input) {
    return "";
    // return new Promise<string>((resolve) => { resolve("") });
  }

  // Replace environment and configuration variables.
  let regexp: () => RegExp = () => /\$\{((env|config|workspaceFolder|file|fileDirname|fileBasenameNoExtension)(\.|:))?(.*?)\}/g;
  let ret: string = input;
  const cycleCache: Set<string> = new Set();
  while (!cycleCache.has(ret)) {
    cycleCache.add(ret);
    ret = ret.replace(regexp(), (match: string, ignored1: string, varType: string, ignored2: string, name: string) => {
      // Historically, if the variable didn't have anything before the "." or ":"
      // it was assumed to be an environment variable
      // We ignore that and we make it to be workspacefolder
      if (!varType) {
        varType = "workspaceFolder";
      }
      let newValue: string | undefined;
      switch (varType) {
        case "env": {
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
        case "config": {
          const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration();
          if (config) {
            newValue = config.get<string>(name);
          }
          break;
        }
        case "workspaceFolder": {
          // Only replace ${workspaceFolder:name} variables for now.
          // We may consider doing replacement of ${workspaceFolder} here later, but we would have to update the language server and also
          // intercept messages with paths in them and add the ${workspaceFolder} variable back in (e.g. for light bulb suggestions)
          if (name && vscode.workspace && vscode.workspace.workspaceFolders) {
            let folder: vscode.WorkspaceFolder | undefined = vscode.workspace.workspaceFolders.find(folder => folder.name.toLocaleLowerCase() === name.toLocaleLowerCase());
            if (folder) {
              newValue = folder.uri.fsPath;
            }
            // If ${workspaceFolder:workspacename} fails or doesn't exist go to
            // the first availbale workspaceFolder and assign its path
            else {
              folder = vscode.workspace.workspaceFolders[0];
              newValue = folder.uri.fsPath;
            }

            // Replace the initial string
            newValue = input.replace(/(\${workspaceFolder(?:(:|.)\w*)?})/g, newValue);
          }
          break;
        }
        default: { assert.fail("unknown varType matched"); }
      }
      return newValue !== undefined ? newValue : match;
    });
  }

  // Resolve '~' at the start of the path.
  regexp = () => /^\~/g;
  ret = ret.replace(regexp(), (match: string, name: string) => os.homedir());

  return ret;
  // return new Promise<string>((resolve) => { resolve(ret) });
}
