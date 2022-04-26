// Modified version of Chris Hansen's Fortran Intellisense

'use strict';

import * as vscode from 'vscode';
import { spawnSync } from 'child_process';
import { commands, window, workspace, TextDocument, WorkspaceFolder } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node';
import { EXTENSION_ID, FortranDocumentSelector, LS_NAME } from '../lib/tools';
import { LoggingService } from '../services/logging-service';
import { RestartLS } from '../features/commands';

// The clients are non member variables of the class because they need to be
// shared for command registration. The command operates on the client and not
// the server
export const clients: Map<string, LanguageClient> = new Map();

/**
 * Checks if the Language Server should run in the current workspace and return
 * the workspace folder if it should else return undefined.
 * @param document the active VS Code editor
 * @returns the root workspace folder or undefined
 */
export function checkLanguageServerActivation(document: TextDocument): WorkspaceFolder | undefined {
  // We are only interested in Fortran files
  if (
    !FortranDocumentSelector().some(e => e.scheme === document.uri.scheme) ||
    !FortranDocumentSelector().some(e => e.language === document.languageId)
  ) {
    return undefined;
  }
  const uri = document.uri;
  const folder = workspace.getWorkspaceFolder(uri);
  // Files outside a folder can't be handled. This might depend on the language.
  // Single file languages like JSON might handle files outside the workspace folders.
  // This will be undefined if the file does not belong to the workspace
  if (!folder) return undefined;
  if (clients.has(folder.uri.toString())) return undefined;

  return folder;
}

export class FortlsClient {
  constructor(private logger: LoggingService, private context?: vscode.ExtensionContext) {
    this.logger.logInfo('Fortran Language Server');

    // if context is present
    if (context !== undefined) {
      // Register Language Server Commands
      this.context.subscriptions.push(
        vscode.commands.registerCommand(RestartLS, this.restartLS, this)
      );
    }
  }

  private client: LanguageClient | undefined;
  private _fortlsVersion: string | undefined;

  public async activate() {
    // Detect if fortls is present, download if missing or disable LS functionality
    // Do not allow activating the LS functionality if no fortls is detected
    await this.fortlsDownload().then(fortlsDisabled => {
      if (fortlsDisabled) return;
      workspace.onDidOpenTextDocument(this.didOpenTextDocument, this);
      workspace.textDocuments.forEach(this.didOpenTextDocument, this);
    });
    return;
  }

  public async deactivate(): Promise<void> {
    const promises: Thenable<void>[] = [];
    for (const [key, client] of clients.entries()) {
      promises.push(client.stop()); // stop the language server
      clients.delete(key); // delete the URI from the map
    }
    await Promise.all(promises);
    return undefined;
  }

  /**
   * Launch fortls. This launches the server for all
   * glob matches in the workspace and caches it.
   *
   * for references on the method see:
   * https://code.visualstudio.com/api/language-extensions/language-server-extension-guide#implementing-a-language-server
   *
   * @param document document to lint
   * @returns
   */
  private async didOpenTextDocument(document: TextDocument): Promise<void> {
    const folder = checkLanguageServerActivation(document);
    if (!folder) return;

    this.logger.logInfo('Initialising the Fortran Language Server');

    const args: string[] = await this.fortlsArguments();
    const executablePath = workspace.getConfiguration(EXTENSION_ID).get<string>('fortls.path');

    // Detect language server version and verify selected options
    this._fortlsVersion = this.getLSVersion(executablePath, args);
    if (this._fortlsVersion) {
      const serverOptions: ServerOptions = {
        command: executablePath,
        args: args,
      };

      // Options to control the language client
      const clientOptions: LanguageClientOptions = {
        // Register the server for all Fortran documents in workspace
        // NOTE: remove the folder args and workspaceFolder to ge single file language servers
        // will also have to change the checkLanguageServerActivation method
        // we want fortran documents but not just in the workspace
        // if in the workspace do provide
        documentSelector: FortranDocumentSelector(folder),
        workspaceFolder: folder,
      };

      // Create the language client, start the client and add it to the registry
      this.client = new LanguageClient(
        LS_NAME,
        'Fortran Language Server',
        serverOptions,
        clientOptions
      );
      this.client.start();
      // Add the Language Client to the global map
      clients.set(folder.uri.toString(), this.client);
    }
  }

  /**
   * Sets `fortls` arguments based on VS Code settings
   * @returns argument list
   */
  private async fortlsArguments() {
    // Get path for the language server
    const conf = workspace.getConfiguration(EXTENSION_ID);
    const maxLineLength = conf.get<number>('fortls.maxLineLength');
    const maxCommentLineLength = conf.get<number>('fortls.maxCommentLineLength');
    const fortlsExtraArgs = conf.get<string[]>('fortls.extraArgs');
    const autocomplete = conf.get<string>('provide.autocomplete');
    const letterCase = conf.get<string>('preferredCase');
    const hover = conf.get<string>('provide.hover');

    // Setup server arguments
    const args: string[] = ['--enable_code_actions'];
    if (autocomplete === 'Disabled' || autocomplete === 'Built-in') {
      args.push('--autocomplete_no_prefix');
    }
    // Enable all hover functionality. Does not make much sense to have one
    // but not the other two
    if (hover === 'fortls' || hover === 'Both') {
      args.push('--hover_signature', '--use_signature_help');
    }
    if (letterCase === 'lowercase') args.push('--lowercase_intrinsics');

    // FORTLS specific args with no overlap with the main extension
    if (conf.get<string>('fortls.configure')) {
      args.push('-c', conf.get<string>('fortls.configure'));
    }
    if (conf.get<boolean>('fortls.notifyInit')) {
      args.push('--notify_init');
    }
    if (conf.get<boolean>('fortls.incrementalSync')) {
      args.push('--incremental_sync');
    }
    if (conf.get<boolean>('fortls.sortKeywords')) {
      args.push('--sort_keywords');
    }
    if (conf.get<boolean>('fortls.disableAutoupdate')) {
      args.push('--disable_autoupdate');
    }
    if (conf.get<boolean>('fortls.disableDiagnostics')) {
      args.push('--disable_diagnostics');
    }
    if (!conf.get<boolean>('fortls.symbolTypes')) {
      args.push('--symbol_skip_mem');
    }
    if (maxLineLength > 0) {
      args.push(`--max_line_length=${maxLineLength}`);
    }
    if (maxCommentLineLength > 0) {
      args.push(`--max_comment_line_length=${maxCommentLineLength}`);
    }
    if (fortlsExtraArgs.length > 0) {
      args.push(...fortlsExtraArgs);
    }

    return args;
  }

  /**
   * Check if `fortls` is present and the arguments being passed are correct
   * The presence check has already been done in the extension activate call
   *
   * Code taken from Fortran Intellisense
   *
   * @param executablePath path for `fortls` if not in path  else `fortls`
   * @param args `fortls` input arguments see documentation
   * @returns truthy value on success
   */
  private getLSVersion(executablePath: string, args: string[]) {
    const results = spawnSync(executablePath, args.concat(['--version']));
    if (results.error) {
      const selected = window.showErrorMessage(
        'Error starting fortls: Check that fortls is in your PATH or that "fortran.fortls.path" is pointing to a fortls binary.',
        'Settings',
        'Workspace settings',
        'Disable fortls'
      );
      selected.then(opt => {
        const config = workspace.getConfiguration(EXTENSION_ID);
        if (opt === 'Settings') commands.executeCommand('workbench.action.openGlobalSettings');
        else if (opt === 'Workspace settings')
          commands.executeCommand('workbench.action.openWorkspaceSettings');
        else if (opt === 'Disable fortls') config.update('fortls.disabled', true);
      });
      return null;
    }
    if (results.status !== 0) {
      const selected = window.showErrorMessage(
        'Error launching fortls: Please check that all selected options are supported by your language server version.',
        'Settings',
        'Workspace settings'
      );
      selected.then(opt => {
        if (opt === 'Settings') commands.executeCommand('workbench.action.openGlobalSettings');
        else if (opt === 'Workspace settings')
          commands.executeCommand('workbench.action.openWorkspaceSettings');
      });
      return null;
    }
    return results.stdout.toString().trim();
  }

  /**
   * Check if fortls is present in the system, if not show prompt to install/disable.
   * If disabling or erroring the function will return true.
   * For all normal cases it should return false.
   *
   * @returns false if the fortls has been detected or installed successfully
   */
  private async fortlsDownload(): Promise<boolean> {
    const config = workspace.getConfiguration(EXTENSION_ID);
    const ls = config.get<string>('fortls.path');

    // Check for version, if this fails fortls provided is invalid
    const results = spawnSync(ls, ['--version']);
    const msg = `It is highly recommended to use the fortls to enable IDE features like hover, peeking, GoTos and many more. 
      For a full list of features the language server adds see: https://github.com/gnikit/fortls`;
    return new Promise<boolean>(resolve => {
      let fortlsDisabled = false;
      if (results.error) {
        const selection = window.showInformationMessage(msg, 'Install', 'Disable');
        selection.then(opt => {
          if (opt === 'Install') {
            const install = spawnSync('pip', ['install', '--user', '--upgrade', LS_NAME]);
            if (install.error) {
              window.showErrorMessage('Had trouble installing fortls, please install manually');
              fortlsDisabled = true;
            }
            if (install.stdout) {
              this.logger.logInfo(install.stdout.toString());
              fortlsDisabled = false;
            }
          } else if (opt == 'Disable') {
            config.update('fortls.disabled', true);
            fortlsDisabled = true;
          }
          resolve(fortlsDisabled);
        });
      } else {
        resolve(false);
      }
    });
  }

  /**
   * Restart the language server
   */
  private async restartLS(): Promise<void> {
    this.logger.logInfo('Restarting language server...');
    vscode.window.showInformationMessage('Restarting language server...');
    await this.deactivate();
    await this.activate();
  }
}
