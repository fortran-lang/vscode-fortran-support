import {
  LanguageClient,
  LanguageClientOptions,
  Executable,
} from 'vscode-languageclient'
import { getBinPath, FORTRAN_FREE_FORM_ID } from './lib/helper'

class FortranLangServer {
  c: LanguageClient
  constructor(context, config) {
    let langServerFlags: string[] = config.get('languageServerFlags', [])

    const serverOptions: Executable = {
      command: getBinPath('fortran-langserver'),
      args: [...langServerFlags],
      options: {},
    }

    const clientOptions: LanguageClientOptions = {
      documentSelector: [FORTRAN_FREE_FORM_ID],
    }

    this.c = new LanguageClient(
      'fortran-langserver',
      serverOptions,
      clientOptions
    )
  }

  start() {
    this.c.start()
  }

  onReady() {
    return this.c.onReady()
  }

  getCapabilities() {
    const capabilities =
      this.c.initializeResult && this.c.initializeResult.capabilities
    return capabilities
  }
}

export { FortranLangServer }
