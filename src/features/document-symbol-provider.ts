import { CancellationToken, TextDocument, Position, Hover } from "vscode";

import * as vscode from "vscode";
import { getDeclaredFunctions, getDeclaredSubroutines } from "../lib/functions";
import { getDeclaredVars } from "../lib/variables";

export class FortranDocumentSymbolProvider
  implements vscode.DocumentSymbolProvider {
  vars: Array<vscode.SymbolInformation>;
  functions: Array<vscode.SymbolInformation>;
  subroutines: Array<vscode.SymbolInformation>;

  public provideDocumentSymbols(
    document: TextDocument,
    token: CancellationToken
  ): Thenable<vscode.SymbolInformation[]> {
    return new Promise<vscode.SymbolInformation[]>((resolve, reject) => {
      token.onCancellationRequested(e => {
        reject();
      });
      this.updateFunctionDefinitions(document);
      this.updateSubroutineDefinitions(document);
      this.updateVariablesDefiniton(document);
      resolve([...this.functions, ...this.subroutines, ...this.vars]);
    });
  }

  private updateFunctionDefinitions(document: TextDocument) {
    this.functions = getDeclaredFunctions(document).map(fun => {
      let range = new vscode.Range(fun.lineNumber, 0, fun.lineNumber, 100);
      return new vscode.SymbolInformation(
        fun.name,
        vscode.SymbolKind.Function,
        range
      );
    });
  }

  private updateSubroutineDefinitions(document: TextDocument) {
    this.subroutines = getDeclaredSubroutines(document).map(fun => {
      let range = new vscode.Range(fun.lineNumber, 0, fun.lineNumber, 100);
      return new vscode.SymbolInformation(
        fun.name,
        vscode.SymbolKind.Function,
        range
      );
    });
  }
  private updateVariablesDefiniton(document: TextDocument) {
    this.vars = getDeclaredVars(document).map(variable => {
      let range = new vscode.Range(
        variable.lineNumber,
        0,
        variable.lineNumber,
        100
      );
      return new vscode.SymbolInformation(
        variable.name,
        vscode.SymbolKind.Variable,
        range
      );
    });
  }
}
