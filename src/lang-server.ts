import {
  LanguageClient,
  LanguageClientOptions,
  Executable,
} from 'vscode-languageclient/node';
import * as which from 'which';
import * as vscode from 'vscode';
import {
  FORTRAN_DOCUMENT_SELECTOR,
} from './lib/helper';
import { LANG_SERVER_TOOL_ID } from './lib/tools';

export class FortranLangServer {

  c: LanguageClient
  constructor(context, config) {
    const langServerFlags: string[] = config.get('languageServerFlags', []);

    const serverOptions: Executable = {
      command: which.sync(LANG_SERVER_TOOL_ID),
      args: [...langServerFlags],
      options: {},
    };

    const clientOptions: LanguageClientOptions = {
      documentSelector: FORTRAN_DOCUMENT_SELECTOR,
    };

    this.c = new LanguageClient(
      LANG_SERVER_TOOL_ID,
      serverOptions,
      clientOptions
    );
  }

  start() {
    this.c.start();
  }

  onReady() {
    return this.c.onReady();
  }

  getCapabilities() {
    const capabilities =
      this.c.initializeResult && this.c.initializeResult.capabilities;
    return capabilities;
  }
}
