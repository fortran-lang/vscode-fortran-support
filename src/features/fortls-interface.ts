// Modified version of Chris Hansen's Fortran Intellisense

'use strict';

import { spawnSync } from 'child_process';
import { commands, window, workspace, TextDocument, WorkspaceFolder } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node';
import { EXTENSION_ID, FortranDocumentSelector } from '../lib/tools';
import { LoggingService } from '../services/logging-service';

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

export class FortranLanguageServer {
  constructor(private logger: LoggingService) {
    this.logger.logInfo('Fortran Language Server');
  }

  private _fortlsVersion: string | undefined;

  public async activate() {
    workspace.onDidOpenTextDocument(this.didOpenTextDocument, this);
    workspace.textDocuments.forEach(this.didOpenTextDocument, this);
    return;
  }

  public async deactivate(): Promise<void> {
    const promises: Thenable<void>[] = [];
    for (const client of clients.values()) {
      promises.push(client.stop());
    }
    await Promise.all(promises);
    return undefined;
  }

  /**
   * Launch the fortran-language-server. This launches the server for all
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

    // Get path for the language server
    const conf = workspace.getConfiguration(EXTENSION_ID);
    const executablePath = conf.get<string>('fortls.path');
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
      args.push('--variable_hover', '--hover_signature', '--use_signature_help');
    }
    if (letterCase === 'lowercase') args.push('--lowercase_intrinsics');

    // FORTLS specific args with no overlap with the main extension
    if (conf.get<boolean>('fortls.preserveKeywordOrder')) {
      args.push('--preserve_keyword_order');
    }
    if (conf.get<boolean>('fortls.disableDiagnostics')) {
      args.push('--disable_diagnostics');
    }
    if (conf.get<boolean>('fortls.incrementalSync')) {
      args.push('--incremental_sync');
    }
    if (!conf.get<boolean>('fortls.symbolTypes')) {
      args.push('--symbol_skip_mem');
    }
    if (conf.get<boolean>('fortls.notifyInit')) {
      args.push('--notify_init');
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

    // Detect language server version and verify selected options
    this._fortlsVersion = this.getLSVersion(executablePath, args);
    if (this._fortlsVersion) {
      // Check if there is a newer version
      //  this.checkVersion(this._fortlsVersion);

      const serverOptions: ServerOptions = {
        command: executablePath,
        args: args,
      };

      // Options to control the language client
      const clientOptions: LanguageClientOptions = {
        // Register the server for all Fortran documents in workspace
        documentSelector: FortranDocumentSelector(folder),
        workspaceFolder: folder,
      };

      // Create the language client, start the client and add it to the registry
      const client = new LanguageClient(
        'fortls',
        'Fortran Language Server',
        serverOptions,
        clientOptions
      );
      client.start();
      clients.set(folder.uri.toString(), client);
    }
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
        'Error spawning fortls: Please check that fortran-language-server is installed and in your path.',
        'Open settings'
      );
      selected.then(() => commands.executeCommand('workbench.action.openGlobalSettings'));
      return null;
    }
    if (results.status !== 0) {
      const selected = window.showErrorMessage(
        'Error launching fortls: Please check that all selected options are supported by your language server version.',
        'Open settings'
      );
      selected.then(() => commands.executeCommand('workbench.action.openGlobalSettings'));
      return null;
    }
    return results.stdout.toString().trim();
  }
}
