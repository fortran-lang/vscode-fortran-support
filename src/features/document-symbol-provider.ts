import {
  CancellationToken,
  TextDocument,
  Position,
  Hover,
  TextLine,
  SymbolInformation
} from "vscode";

import * as vscode from "vscode";
import {
  parseFunction as getDeclaredFunction,
  parseSubroutine as getDeclaredSubroutine
} from "../lib/functions";
import { parseVars as getDeclaredVar } from "../lib/variables";
import { error } from "util";

type SymbolType = "subroutine" | "function" | "variable";
type ParserFunc = (line: TextLine) => SymbolInformation | undefined;

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
    return Promise.race([this.parseDoc(document), cancel]);
  }
  parseDoc = async (document: TextDocument) => {
    let lines = document.lineCount;
    let symbols = [];
    const symbolTypes = this.getSymbolTypes();

    for (let i = 0; i < lines; i++) {
      let line: vscode.TextLine = document.lineAt(i);
      if (line.isEmptyOrWhitespace) continue;
      let initialCharacter = line.text.trim().charAt(0);
      if (initialCharacter === "!" || initialCharacter === "#") continue;
      const symbolsInLine = symbolTypes
        .map(type => this.getSymbolsOfType(type))
        .map(fn => fn(line))
        .filter(symb => symb !== undefined);
      if (symbolsInLine.length > 0) {
        symbols = symbols.concat(symbolsInLine);
      }
    }
    return symbols;
  }

  getSymbolsOfType(type: "subroutine" | "function" | "variable"): ParserFunc {
    switch (type) {
      case "subroutine":
        return this.parseSubroutineDefinition;
      case "function":
        return this.parseFunctionDefinition;

      case "variable":
        return this.parseVariableDefinition;
      default:
        return () => undefined;
    }
  }

  private parseSubroutineDefinition(line: TextLine) {
    try {
      const subroutine = getDeclaredSubroutine(line);
      if (subroutine) {
        let range = new vscode.Range(line.range.start, line.range.end);
        return new vscode.SymbolInformation(
          subroutine.name,
          vscode.SymbolKind.Function,
          range
        );
      }
    } catch (err) {
      console.log(err);
    }
  }

  private parseFunctionDefinition(line: TextLine) {
    const fun = getDeclaredFunction(line);
    if (fun) {
      let range = new vscode.Range(line.range.start, line.range.end);
      return new vscode.SymbolInformation(
        fun.name,
        vscode.SymbolKind.Function,
        range
      );
    }
  }

  private parseVariableDefinition(line: TextLine) {
    const variable = getDeclaredVar(line);
    if (variable) {
      let range = new vscode.Range(line.range.start, line.range.end);
      return new vscode.SymbolInformation(
        variable.name,
        vscode.SymbolKind.Variable,
        range
      );
    }
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
