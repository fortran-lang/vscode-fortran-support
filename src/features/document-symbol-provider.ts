import {
  CancellationToken,
  TextDocument,
  Position,
  Hover,
  TextLine,
  SymbolInformation
} from "vscode";

import * as vscode from "vscode";
import * as grammar from '../lib/grammar';
import {
  parseFunction as getDeclaredFunction,
  parseSubroutine as getDeclaredSubroutine
} from "../lib/functions";
import { parseVars as getDeclaredVar } from "../lib/variables";
import { error } from "util";
import * as helper from '../lib/helper';

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
    return grammar.declarationsFromFile(document.fileName).then(({ subroutines, functions }) => {
      return [...subroutines.map(helper.convertToMethod), ...functions.map(helper.convertToFunction)]
        .sort((a, b) => a.location.range.start.line - b.location.range.start.line);
    });
  }

  parseDoc = async (document: TextDocument) => {
    let lines = document.lineCount;
    let symbols = [];
    const symbolTypes = this.getSymbolTypes();

    for (let i = 0; i < lines; i++) {
      let line: vscode.TextLine = document.lineAt(i);
      line = { ...line, text: line.text.trim() };
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
      const fun = getDeclaredSubroutine(line);
      if (fun) {
        let range = new vscode.Range(line.range.start, line.range.end);
        return new vscode.SymbolInformation(
          fun.name,
          vscode.SymbolKind.Method,
          range
        );
      }
    } catch (err) {
      console.log(err);
    }
  }

  private parseFunctionDefinition(line: TextLine) {
    const subroutine = getDeclaredFunction(line);
    if (subroutine) {
      let range = new vscode.Range(line.range.start, line.range.end);

      return new vscode.SymbolInformation(
        subroutine.name,
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
