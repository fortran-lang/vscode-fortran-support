import {
  CancellationToken,
  TextDocument,
  Position,
  Hover,
  TextLine,
  SymbolInformation
} from "vscode";

import * as vscode from "vscode";
import { error } from "util";

import { parseDoc } from "../lib/TagParser";

export class FortranDocumentSymbolProvider
  implements vscode.DocumentSymbolProvider {
  vars: Array<vscode.SymbolInformation>;
  functions: Array<vscode.SymbolInformation>;
  subroutines: Array<vscode.SymbolInformation>;

  public provideDocumentSymbols(
    document: TextDocument,
    token: CancellationToken
  ): Thenable<vscode.SymbolInformation[]> {
    const cancel = new Promise<vscode.SymbolInformation[]>(
      (resolve, reject) => {
        token.onCancellationRequested(evt => {
          reject(error);
        });
      }
    );
    return Promise.race([parseDoc(document), cancel]);
  }
}
