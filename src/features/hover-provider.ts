import { CancellationToken, TextDocument, Position, Hover } from 'vscode';

import { isIntrinsic, loadDocString } from '../lib/helper';
import { LoggingService } from '../services/logging-service';

export class FortranHoverProvider {
  constructor(private loggingService: LoggingService) {}
  public provideHover(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Hover | Thenable<Hover> {
    const wordRange = document.getWordRangeAtPosition(position);
    const word = document.getText(wordRange);

    if (isIntrinsic(word)) {
      return new Hover(loadDocString(word));
    }
  }
}
