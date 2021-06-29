import { CancellationToken, TextDocument, Position, Hover } from 'vscode'

import { isIntrinsic, loadDocString } from '../lib/helper'
import { LoggingService } from '../services/logging-service'

export default class FortranHoverProvider {
  constructor(private loggingService: LoggingService) {}
  public provideHover(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Hover | Thenable<Hover> {
    let wordRange = document.getWordRangeAtPosition(position)
    let word = document.getText(wordRange)

    if (isIntrinsic(word)) {
      return new Hover(loadDocString(word))
    }
  }
}
