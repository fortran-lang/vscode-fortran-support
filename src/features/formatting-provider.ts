'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as which from 'which';
import * as vscode from 'vscode';
import * as cp from 'child_process';

import { FORMATTERS } from '../lib/tools';
import { LoggingService } from '../services/logging-service';
import { EXTENSION_ID, promptForMissingTool } from '../lib/helper';


export class FortranFormattingProvider
  implements vscode.DocumentFormattingEditProvider {

  constructor(private logger: LoggingService) { }

  public provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {

    let formatterName: string = this.getFormatter();

    if (formatterName === 'fprettify') {
      this.doFormatFprettify(document);
    }
    else if (formatterName === 'findent') {
      this.doFormatFindent(document);
    }
    else {
      this.logger.logError('Cannot format document with formatter set to Disabled')
    }

    return
  }

  /**
   * Use `fprettyfy` to format a Fortran file.
   * 
   * @param document vscode.TextDocument document to operate on
   */
  private doFormatFprettify(document: vscode.TextDocument) {

    const formatterName: string = 'fprettify';
    let formatterPath: string = this.getFormatterPath();
    // If no formatter path is present check that formatter is present in $PATH
    if (!formatterPath) {
      if (!which.sync(formatterName, { nothrow: true })) {
        this.logger.logWarning(`Formatter: ${formatterName} not detected in your system.
                                Attempting to install now.`);
        let msg = `Installing ${formatterName} through pip with --user option`;
        promptForMissingTool(formatterName, msg, 'Python');
      }
    }
    let formatter: string = path.join(formatterPath, formatterName);

    let args: string[] = [document.fileName, ...this.getFormatterArgs()];
    // args.push('--silent'); // TODO: pass?

    // Get current file (name rel to path), run extension can be in a shell??
    let process = cp.spawn(formatter, args);

    // if the findent then capture the output from that and parse it back to the file
    process.stdout.on('data', (data) => { this.logger.logInfo(`formatter stdout: ${data}`) });
    process.stderr.on('data', (data) => { this.logger.logError(`formatter stderr: ${data}`) });
    process.on('close', (code: number) => { if (code !== 0) this.logger.logInfo(`formatter exited with code: ${code}`) });
    process.on('error', (code) => { this.logger.logInfo(`formatter exited with code: ${code}`) });

  }

  /**
   * Use `findent` to format a Fortran file.
   * Creates a temporary file where the output is placed and then deleted
   * 
   * @param document vscode.TextDocument document to operate on
   */
  private doFormatFindent(document: vscode.TextDocument) {

    const formatterName: string = 'findent';
    let formatterPath: string = this.getFormatterPath();
    let formatter: string = path.join(formatterPath, formatterName);

    // Annoyingly findent only outputs to a file and not to a stream so
    // let us go and create a temporary file
    let out = document.uri.path + '.findent.tmp';
    let args: string = ['< ' + document.fileName + ' >', out, ...this.getFormatterArgs()].join(' ');
    formatter = formatter + ' ' + args;

    // @note It is wise to have all IO operations being synchronous we don't
    // want to copy or delete the temp file before findent has completed.
    // I cannot forsee a situation where a performance bottleneck is created
    // since findent performs something like ~100k lines per second
    cp.execSync(formatter, { stdio: 'inherit' });
    fs.copyFileSync(out, document.fileName);
    fs.unlinkSync(out);

  }

  /**
   * Get the formatter type
   * Currently supporting: `findent` and `fprettify`
   * 
   * Formatters are defined in FORMATTERS (./lib/tools.ts)
   * 
   * @returns {string} formatter name or `Disabled`
   */
  private getFormatter(): string {

    let config = vscode.workspace.getConfiguration(EXTENSION_ID)
    const formatter: string = config.get('formatting.formatter', 'Disabled')

    if (!FORMATTERS.includes(formatter)) {
      this.logger.logError(`Unsupported formatter: ${formatter}`)
    }
    return formatter
  }

  /**
   * Read in any custom arguments for the formatter
   * 
   * @returns {string[]} list of additional arguments
   */
  private getFormatterArgs(): string[] {
    let config = vscode.workspace.getConfiguration(EXTENSION_ID)
    const args: string[] = config.get('formatting.args', [])

    return args
  }

  /**
   * Installation directory for formatter (if not in PATH)
   * 
   * @returns {string} path of formatter
   */
  private getFormatterPath(): string {
    let config = vscode.workspace.getConfiguration(EXTENSION_ID)
    const formatterPath: string = config.get('formatting.path', '')
    if (formatterPath !== '') {
      this.logger.logInfo(`Formatter located in: ${formatterPath}`)
    }

    return formatterPath
  }
}
