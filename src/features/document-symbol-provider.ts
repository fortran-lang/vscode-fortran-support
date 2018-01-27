import { CancellationToken, TextDocument, Position, Hover } from "vscode";

import * as vscode from "vscode";
import { getDeclaredFunctions, getDeclaredSubroutines } from "../lib/functions";
import { getDeclaredVars } from "../lib/variables";

type SymbolType = "subroutine" | "function" | "variable";

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
      const symbolTypes = this.getSymbolTypes();
      const documentSymbols = symbolTypes.reduce<vscode.SymbolInformation[]>(
        (symbols, type: SymbolType) => {
          return [...symbols, ...this.getSymbolsOfType(type, document)];
        },
        []
      );

      resolve(documentSymbols);
    });
  }
  getSymbolsOfType(
    type: "subroutine" | "function" | "variable",
    document: TextDocument
  ) {
    switch (type) {
      case "subroutine":
        this.updateSubroutineDefinitions(document);
        return this.subroutines;
      case "function":
        this.updateFunctionDefinitions(document);
        return this.functions;
      case "variable":
        this.updateVariablesDefiniton(document);
        return this.vars;
    }
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
  getSymbolTypes() {
    let config = vscode.workspace.getConfiguration("fortran");
    const symbolTypes = config.get<SymbolType[]>("symbols", [
      "subroutine",
      "function"
    ]);
    return symbolTypes;
  }
}
