'use strict';

import * as os from 'os';
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
  pipInstall,
  resolveVariables,
} from '../lib/tools';
import { Logger } from '../services/logging';
import { RestartLS } from '../features/commands';

// The clients are non member variables of the class because they need to be
// shared for command registration. The command operates on the client and not
// the server
export const clients: Map<string, LanguageClient> = new Map();

export class FortlsClient {
  constructor(private logger: Logger, private context?: vscode.ExtensionContext) {
    this.logger.debug('[lsp.client] Fortran Language Server -- constructor');

    // if context is present
    if (context !== undefined) {
      // Register Language Server Commands
      this.context.subscriptions.push(
        vscode.commands.registerCommand(RestartLS, this.restartLS, this)
      );
    }
  }

  private client: LanguageClient | undefined;
  private path: string | undefined; // path to the forls binary
  private version: string | undefined; // fortls version
  private readonly name: string = 'Fortran Language Server';

  public async activate() {
    const config = workspace.getConfiguration(EXTENSION_ID);

    if (!config.get['fortls.disabled']) {
      // Detect if fortls is present, download if missing or disable LS functionality
      // Do not allow activating the LS functionality if no fortls is detected
      const fortlsFound = this.getLSPath();

      const configuredPath = resolveVariables(config.get<string>('fortls.path'));
      if (configuredPath) {
        const msg = `Failed to run fortls from user configured path '` + configuredPath + `'`;
        await window.showErrorMessage(msg);
        return;
      }

      if (!fortlsFound) {
        const msg = `Forlts wasn't found on your system.
        It is highly recommended to use the fortls to enable IDE features like hover, peeking, GoTos and many more. 
        For a full list of features the language server adds see: https://fortls.fortran-lang.org`;

        const selection = window.showInformationMessage(msg, 'Install', 'Disable');
        selection.then(async opt => {
          if (opt === 'Install') {
            try {
              this.logger.info(`[lsp.client] Downloading ${LS_NAME}`);
              const msg = await pipInstall(LS_NAME);
              window.showInformationMessage(msg);
              this.logger.info(`[lsp.client] ${LS_NAME} installed`);

              // restart this class
              this.deactivate();
              this.activate();
            } catch (error) {
              this.logger.error(`[lsp.client] Error installing ${LS_NAME}: ${error}`);
              window.showErrorMessage(error);
            }
          } else if (opt == 'Disable') {
            config.update('fortls.disabled', true, vscode.ConfigurationTarget.Global);
            this.logger.info(`[lsp.client] ${LS_NAME} disabled in settings`);
          }
        });
      } else {
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
      }
    }

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
    const executablePath: string = this.path;

    // Detect language server version and verify selected options
    this.version = this.getLSVersion(executablePath, args);
    this.logger.debug(`[lsp.client] Language Server version: ${this.version}`);
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
      this.logger.info(
        `[lsp.client] Initialising Language Server for file: ${document.uri.fsPath}`
      );
      this.logger.info(`[lsp.client] Language Server arguments: ${args.join(' ')}`);
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
      this.logger.info(
        `[lsp.client] Initialising Language Server for workspace: ${folder.uri.toString()}`
      );
      this.logger.info(`[lsp.client] Language Server arguments: ${args.join(' ')}`);
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

    this.logger.debug(`[lsp.client] Language Server arguments:`, args);
    return args;
  }

  /**
   * Tries to find fortls and saves its path to this.path.
   *
   * If a user path is configured, then only use this.
   * If not, try running fortls globally, or from python user scripts folder on Windows.
   *
   * @returns true if fortls found, false if not
   */
  private getLSPath(): boolean {
    const config = workspace.getConfiguration(EXTENSION_ID);
    const configuredPath = resolveVariables(config.get<string>('fortls.path'));

    const pathsToCheck: string[] = [];

    // if there's a user configured path to the executable, check if it's absolute
    if (configuredPath !== '') {
      if (!path.isAbsolute(configuredPath)) {
        window.showErrorMessage('The path to fortls (fortran.fortls.path) must be absolute.');
        return false;
      }

      pathsToCheck.push(configuredPath);
    } else {
      // no user configured path => perform standard search for fortls

      pathsToCheck.push('fortls');

      // On Windows, `pip install fortls --user` installs fortls to the userbase\PythonXY\Scripts path,
      // so we want to look for it in this path as well.
      if (os.platform() == 'win32') {
        const result = spawnSync('python', [
          '-c',
          'import site; print(site.getusersitepackages())',
        ]);
        const userSitePackagesStr = result.stdout.toString().trim();

        // check if the call above returned something, in case the site module in python ever changes...
        if (userSitePackagesStr) {
          const userScriptsPath = path.resolve(userSitePackagesStr, '../Scripts/fortls');
          pathsToCheck.push(userScriptsPath);
        }
      }
    }

    // try to run `fortls --version` for all the given paths
    // if any succeed, save it to this.path and stop.
    for (const pathToCheck of pathsToCheck) {
      const result = spawnSync(pathToCheck, ['--version']);
      if (result.status == 0) {
        this.path = pathToCheck;
        this.logger.info('Successfully spawned fortls with path ' + pathToCheck);
        return true;
      } else {
        this.logger.info('Failed to spawn fortls with path ' + pathToCheck);
      }
    }

    return false; // fortls not found
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
      this.logger.error(`[lsp.client] Unable to launch LS to check version:`, results.error);
      this.logger.show();
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
      this.logger.error(`[lsp.client] Unable to verify input arguments with LS:`);
      this.logger.show();
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
   * Restart the language server
   */
  private async restartLS(): Promise<void> {
    this.logger.info('[lsp.client] Restarting language server...');
    vscode.window.showInformationMessage('Restarting language server...');
    await this.deactivate();
    await this.activate();
    this.logger.info('[lsp.client] Language server restarted');
  }
}
