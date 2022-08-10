'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as which from 'which';
import * as vscode from 'vscode';
import * as cp from 'child_process';

import { Logger } from '../services/logging';
import {
  FORMATTERS,
  EXTENSION_ID,
  promptForMissingTool,
  getWholeFileRange,
  spawnAsPromise,
} from '../lib/tools';

export class FortranFormattingProvider implements vscode.DocumentFormattingEditProvider {
  private readonly workspace = vscode.workspace.getConfiguration(EXTENSION_ID);
  private formatter: string | undefined;
  constructor(private logger: Logger) {}

  public async provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): Promise<vscode.TextEdit[]> {
    const formatterName: string = this.getFormatter();

    if (formatterName === 'fprettify') {
      return this.doFormatFprettify(document);
    } else if (formatterName === 'findent') {
      return this.doFormatFindent(document);
    } else {
      this.logger.error('[format] Cannot format document with formatter set to Disabled');
    }

    return undefined;
  }

  /**
   * Use `fprettify` to format a Fortran file.
   *
   * @param document vscode.TextDocument document to operate on
   */
  private async doFormatFprettify(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
    // fprettify can only do FortranFreeFrom
    if (document.languageId !== 'FortranFreeForm') {
      this.logger.error(
        `[format] fprettify can only format FortranFreeForm, change to findent for FortranFixedForm formatting`
      );
      return undefined;
    }

    const formatterName = process.platform !== 'win32' ? 'fprettify' : 'fprettify.exe';
    const formatterPath: string = this.getFormatterPath();
    const formatter: string = path.join(formatterPath, formatterName);
    // If no formatter is detected try and install it
    if (!which.sync(formatter, { nothrow: true })) {
      this.logger.warn(`[format] ${formatterName} not found. Attempting to install now.`);
      const msg = `Installing ${formatterName} through pip with --user option`;
      promptForMissingTool(formatterName, msg, 'Python', ['Install'], this.logger);
    }

    const args: string[] = ['--stdout', ...this.getFormatterArgs()];
    this.logger.debug(`[format] fprettify args:`, args);
    const edits: vscode.TextEdit[] = [];
    const [stdout, stderr] = await spawnAsPromise(formatter, args, undefined, document.getText());
    edits.push(new vscode.TextEdit(getWholeFileRange(document), stdout));
    if (stderr) this.logger.error(`[format] fprettify error output: ${stderr}`);
    return edits;
  }

  /**
   * Use `findent` to format a Fortran file.
   *
   * @param document vscode.TextDocument document to operate on
   */
  private async doFormatFindent(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
    const formatterName = process.platform !== 'win32' ? 'findent' : 'findent.exe';
    const formatterPath: string = this.getFormatterPath();
    const formatter: string = path.join(formatterPath, formatterName);
    // If no formatter is detected try and install it
    if (!which.sync(formatter, { nothrow: true })) {
      this.logger.warn(`[format] ${formatterName} not found! Attempting to install now.`);
      const msg = `Installing ${formatterName} through pip with --user option`;
      promptForMissingTool(formatterName, msg, 'Python', ['Install'], this.logger);
    }

    const args: string[] = this.getFormatterArgs();
    this.logger.debug(`[format] findent args:`, args);
    const edits: vscode.TextEdit[] = [];
    const [stdout, stderr] = await spawnAsPromise(formatter, args, undefined, document.getText());
    edits.push(new vscode.TextEdit(getWholeFileRange(document), stdout));
    if (stderr) this.logger.error(`[format] findent error output: ${stderr}`);
    return edits;
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
    this.formatter = this.workspace.get('formatting.formatter', 'Disabled');

    if (!FORMATTERS.includes(this.formatter)) {
      this.logger.error(`[format] Unsupported formatter: ${this.formatter}`);
    }
    return this.formatter;
  }

  /**
   * Read in any custom arguments for the formatter
   *
   * @returns {string[]} list of additional arguments
   */
  private getFormatterArgs(): string[] {
    const args: string[] = this.workspace.get(`formatting.${this.formatter}Args`, []);
    return args;
  }

  /**
   * Installation directory for formatter (if not in PATH)
   *
   * @returns {string} path of formatter
   */
  private getFormatterPath(): string {
    const formatterPath: string = this.workspace.get('formatting.path', '');
    if (formatterPath !== '') {
      this.logger.info(`[format] Formatter located in: ${formatterPath}`);
    }

    return formatterPath;
  }
}
