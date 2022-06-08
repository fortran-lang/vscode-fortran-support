'use strict';

import * as path from 'path';
import * as vscode from 'vscode';
import { spawnSync } from 'child_process';
import { commands, window, workspace, TextDocument } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node';
import {
  EXTENSION_ID,
  FortranDocumentSelector,
  LS_NAME,
  isFortran,
  getOuterMostWorkspaceFolder,
} from '../lib/tools';
import { LoggingService } from '../services/logging-service';
import { RestartLS } from '../features/commands';

// The clients are non member variables of the class because they need to be
// shared for command registration. The command operates on the client and not
// the server
export const clients: Map<string, LanguageClient> = new Map();

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
  private version: string | undefined;
  private readonly name: string = 'Fortran Language Server';

  public async activate() {
    // Detect if fortls is present, download if missing or disable LS functionality
    // Do not allow activating the LS functionality if no fortls is detected
    await this.fortlsDownload().then(fortlsDisabled => {
      if (fortlsDisabled) return;
      workspace.onDidOpenTextDocument(this.didOpenTextDocument, this);
      workspace.textDocuments.forEach(this.didOpenTextDocument, this);
      workspace.onDidChangeWorkspaceFolders(event => {
        for (const folder of event.removed) {
          const client = clients.get(folder.uri.toString());
          if (client) {
            clients.delete(folder.uri.toString());
            client.stop();
          }
        }
      });
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
    if (!isFortran(document)) return;

    const args: string[] = await this.fortlsArguments();
    const executablePath = workspace.getConfiguration(EXTENSION_ID).get<string>('fortls.path');

    // Detect language server version and verify selected options
    this.version = this.getLSVersion(executablePath, args);
    if (!this.version) return;
    const serverOptions: ServerOptions = {
      command: executablePath,
      args: args,
    };

    let folder = workspace.getWorkspaceFolder(document.uri);

    /**
     * The strategy for registering the language server is to register an individual
     * server for the top-most workspace folder. If we are outside of a workspace
     * then we register the server for folder the standalone Fortran file is located.
     * This has to be done in order for standalone server to NOT interfere with
     * the workspace server.
     *
     * We also set the log channel to the Modern Fortran log output and add
     * system watchers for the default configuration file .fortls and the
     * configuration settings for the entire extension.
     */

    // If the document is part of a standalone file and not part of a workspace
    if (!folder) {
      const fileRoot: string = path.dirname(document.uri.fsPath);
      if (clients.has(fileRoot)) return; // already registered
      this.logger.logInfo(
        'Initialising Language Server for file: ' +
          `${document.uri.fsPath} with command-line options: ${args.join(', ')}`
      );
      // Options to control the language client
      const clientOptions: LanguageClientOptions = {
        documentSelector: FortranDocumentSelector(fileRoot),
        outputChannel: this.logger.getOutputChannel(),
        synchronize: {
          // Synchronize all configuration settings to the server
          configurationSection: EXTENSION_ID,
          // Notify the server about file changes to '.fortls files contained in the workspace
          // fileEvents: workspace.createFileSystemWatcher('**/.fortls'),
        },
      };
      this.client = new LanguageClient(LS_NAME, this.name, serverOptions, clientOptions);
      this.client.start();
      clients.set(fileRoot, this.client); // Add the client to the global map
      return;
    }
    // The document is part of a workspace folder
    if (!clients.has(folder.uri.toString())) {
      folder = getOuterMostWorkspaceFolder(folder);
      if (clients.has(folder.uri.toString())) return; // already registered
      this.logger.logInfo(
        'Initialising Language Server for workspace: ' +
          `${document.uri.fsPath} with command-line options: ${args.join(', ')}`
      );
      // Options to control the language client
      const clientOptions: LanguageClientOptions = {
        documentSelector: FortranDocumentSelector(folder.uri.fsPath),
        workspaceFolder: folder,
        outputChannel: this.logger.getOutputChannel(),
        synchronize: {
          // Synchronize all configuration settings to the server
          configurationSection: EXTENSION_ID,
          // Notify the server about file changes to '.fortls files contained in the workspace
          // fileEvents: workspace.createFileSystemWatcher('**/.fortls'),
        },
      };
      this.client = new LanguageClient(LS_NAME, this.name, serverOptions, clientOptions);
      this.client.start();
      clients.set(folder.uri.toString(), this.client); // Add the client to the global map
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
    const pp = workspace.getConfiguration(`${EXTENSION_ID}.fortls.preprocessor`);

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
    if (conf.get<number>('fortls.nthreads')) {
      args.push(`--nthreads=${conf.get<number>('fortls.nthreads')}`);
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

    // Fortran source file parsing
    if (conf.get<string[]>('fortls.suffixes').length > 0) {
      args.push('--incl_suffixes', ...conf.get<string[]>('fortls.suffixes'));
    }
    if (conf.get<string[]>('fortls.directories').length > 0) {
      args.push('--source_dirs', ...conf.get<string[]>('fortls.directories'));
    }
    if (conf.get<string[]>('fortls.excludeSuffixes').length > 0) {
      args.push('--excl_suffixes', ...conf.get<string[]>('fortls.excludeSuffixes'));
    }
    if (conf.get<string[]>('fortls.excludeDirectories').length > 0) {
      args.push('--excl_paths', ...conf.get<string[]>('fortls.excludeDirectories'));
    }

    // Preprocessor args
    if (pp.get<string[]>('suffixes').length > 0) {
      args.push(`--pp_suffixes`, ...pp.get<string[]>('suffixes'));
    }
    if (pp.get<string[]>('directories').length > 0) {
      args.push(`--include_dirs`, ...pp.get<string[]>('directories'));
    }
    const pp_defs = pp.get('definitions');
    if (Object.keys(pp_defs).length > 0) {
      args.push(`--pp_defs=${JSON.stringify(pp_defs)}`);
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
        'Modern Fortran Error starting fortls: Check that fortls is in your PATH or that "fortran.fortls.path" is pointing to a fortls binary.',
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
