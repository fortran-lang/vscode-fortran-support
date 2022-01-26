'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as which from 'which';
import * as vscode from 'vscode';
import * as cp from 'child_process';

import { LoggingService } from '../services/logging-service';
import {
  FORMATTERS,
  EXTENSION_ID,
  promptForMissingTool,
  FortranDocumentSelector,
} from '../lib/tools';

export class FortranFormattingProvider implements vscode.DocumentFormattingEditProvider {
  constructor(private logger: LoggingService) {}

  public provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.TextEdit[]> {
    const formatterName: string = this.getFormatter();

    if (formatterName === 'fprettify') {
      return this.doFormatFprettify(document);
    } else if (formatterName === 'findent') {
      return this.doFormatFindent(document);
    } else {
      this.logger.logError('Cannot format document with formatter set to Disabled');
      return null;
    }
  }

  /**
   * Use `fprettify` to format a Fortran file.
   *
   * @param document vscode.TextDocument document to operate on
   */
  private doFormatFprettify(
    document: vscode.TextDocument
  ): vscode.ProviderResult<vscode.TextEdit[]> {
    console.log('in fprettify');
    // fprettify can only do FortranFreeFrom
    if (document.languageId !== 'FortranFreeForm') {
      this.logger.logError(`fprettify can only format FortranFreeForm, change
                            to findent for FortranFixedForm formatting`);
      return;
    }

    const formatterName = 'fprettify';
    const formatterPath: string = this.getFormatterPath();
    const formatter: string = path.join(formatterPath, formatterName);
    // If no formatter is detected try and install it
    if (!which.sync(formatter, { nothrow: true })) {
      this.logger.logWarning(`Formatter: ${formatterName} not detected in your system.
                                Attempting to install now.`);
      const msg = `Installing ${formatterName} through pip with --user option`;
      promptForMissingTool(formatterName, msg, 'Python', ['Install'], this.logger);
    }

    // @note Currently we brute force the formatting procedure by creating a tempfile and reading from it once the formatter is finished (synchronously). Fprettify does have a -d flag which won't modify the src file and will output a "diff" file. We could parse that into a TextEdit array in the future
    //

    const firstLine = document.lineAt(0);
    const lastline = document.lineAt(document.lineCount - 1);
    const range_whole_file = new vscode.Range(firstLine.range.start, lastline.range.end);

    const temp_file = document.fileName + '.fprettify.tmp';

    // Cannot copy file since it hasn't been saved yet!
    // Needs to be synchronous!
    fs.writeFileSync(temp_file, document.getText(), 'utf8');
    //fs.copyFileSync(document.fileName, temp_file);

    const args: string[] = [temp_file, ...this.getFormatterArgs()];
    // could run silent on it
    // args.push('--silent'); // TODO: pass?

    const command = formatter + ' ' + args;

    const process = cp.execSync(command, { stdio: 'inherit' });
    // Enable logging

    const new_file_as_string = fs.readFileSync(temp_file, 'utf8');
    fs.unlink(temp_file, err => {
      if (err) {
        console.log('failed to delete tempfile');
      }
    });
    const new_edit = new vscode.TextEdit(range_whole_file, new_file_as_string);
    return [new_edit];
  }

  /**
   * Use `findent` to format a Fortran file.
   * Creates a temporary file where the output is placed and then deleted
   *
   * @param document vscode.TextDocument document to operate on
   */
  private doFormatFindent(document: vscode.TextDocument): vscode.ProviderResult<vscode.TextEdit[]> {
    const formatterName = 'findent';
    const formatterPath: string = this.getFormatterPath();
    const formatter: string = path.join(formatterPath, formatterName);
    // If no formatter is detected try and install it
    if (!which.sync(formatter, { nothrow: true })) {
      this.logger.logWarning(`Formatter: ${formatterName} not detected in your system.
                                    Attempting to install now.`);
      const msg = `Installing ${formatterName} through pip with --user option`;
      promptForMissingTool(formatterName, msg, 'Python', ['Install'], this.logger);
    }

    // Previous note:
    // @note It is wise to have all IO operations being synchronous we don't
    // want to copy or delete the temp file before findent has completed.
    // I cannot forsee a situation where a performance bottleneck is created
    // since findent performs something like ~100k lines per second

    // @note Unlike fprettify we have no option but to brute force for findent since it is old tech! As mentioned above we're not too concerned about bottlenecks
    //
    const firstLine = document.lineAt(0);
    const lastline = document.lineAt(document.lineCount - 1);
    const range_whole_file = new vscode.Range(firstLine.range.start, lastline.range.end);

    const temp_file = document.fileName + '.findent.tmp';
    const temp_file2 = document.fileName + '.findent.tmp2';
    // Cannot copy file since it hasn't been saved yet!
    // Needs to be synchronous!
    fs.writeFileSync(temp_file2, document.getText(), 'utf8');

    const args: string = ['< ' + temp_file2 + ' >', temp_file, ...this.getFormatterArgs()].join(
      ' '
    );
    const command = formatter + ' ' + args;

    const process = cp.execSync(command, { stdio: 'inherit' });

    const new_file_as_string = fs.readFileSync(temp_file, 'utf8');
    fs.unlink(temp_file, err => {
      console.log('failed to delete tempfile');
    });
    fs.unlink(temp_file2, err => {
      console.log('failed to delete tempfile');
    });

    const new_edit = new vscode.TextEdit(range_whole_file, new_file_as_string);
    return [new_edit];
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
    const config = vscode.workspace.getConfiguration(EXTENSION_ID);
    const formatter: string = config.get('formatting.formatter', 'Disabled');

    if (!FORMATTERS.includes(formatter)) {
      this.logger.logError(`Unsupported formatter: ${formatter}`);
    }
    return formatter;
  }

  /**
   * Read in any custom arguments for the formatter
   *
   * @returns {string[]} list of additional arguments
   */
  private getFormatterArgs(): string[] {
    const config = vscode.workspace.getConfiguration(EXTENSION_ID);
    const args: string[] = config.get('formatting.args', []);

    return args;
  }

  /**
   * Installation directory for formatter (if not in PATH)
   *
   * @returns {string} path of formatter
   */
  private getFormatterPath(): string {
    const config = vscode.workspace.getConfiguration(EXTENSION_ID);
    const formatterPath: string = config.get('formatting.path', '');
    if (formatterPath !== '') {
      this.logger.logInfo(`Formatter located in: ${formatterPath}`);
    }

    return formatterPath;
  }
}
