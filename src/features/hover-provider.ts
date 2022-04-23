import { CancellationToken, TextDocument, Position, Hover } from 'vscode';
import { LoggingService } from '../services/logging-service';
import intrinsics from './intrinsics.json';

export class FortranHoverProvider {
  constructor(private loggingService: LoggingService) {}
  public provideHover(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Hover | Thenable<Hover> {
    const wordRange = document.getWordRangeAtPosition(position);
    const word = document.getText(wordRange);

    const intrinsicDoc: string = this.isIntrinsic(word);
    if (intrinsicDoc) return new Hover(intrinsicDoc);
  }

  /**
   * Get if a word is a Fortran intrinsic and return the documentation if true.
   * @param keyword word to provide hover info for
   * @returns if `keyword` is an intrinsic return the documentation for it, otherwise return `undefined`
   */
  private isIntrinsic(keyword: string): string {
    if (Object.prototype.hasOwnProperty.call(intrinsics, keyword.toUpperCase())) {
      return intrinsics[keyword.toUpperCase()].doc;
    }
  }
}
