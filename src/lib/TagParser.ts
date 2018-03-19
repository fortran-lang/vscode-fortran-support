import {
  TextDocument,
  TextLine,
  SymbolInformation,
  workspace,
  Location
} from "vscode";
import * as vscode from "vscode";
import {
  parseFunction as getDeclaredFunction,
  parseSubroutine as getDeclaredSubroutine
} from "./parsers/functions";
import { parseVars as getDeclaredVar } from "./parsers/variables";

type SymbolType = "subroutine" | "function" | "variable";
type ParserFunc = (line: TextLine) => SymbolInformation | undefined;

let projectSymbols: { [key: string]: SymbolInformation[] } = {};

export const parseDoc = async (document: TextDocument) => {
  let lines = document.lineCount;
  let symbols = [];
  const symbolTypes = getSymbolTypes();

  for (let i = 0; i < lines; i++) {
    let line: TextLine = document.lineAt(i);
    line = { ...line, text: line.text.trim() };
    if (line.isEmptyOrWhitespace) continue;
    let initialCharacter = line.text.trim().charAt(0);
    if (initialCharacter === "!" || initialCharacter === "#") continue;
    const symbolsInLine = symbolTypes
      .map(type => getSymbolsOfType(type))
      .map(fn => fn(line))
      .filter(symb => symb != undefined);
    if (symbolsInLine.length > 0) {
      symbols = symbols.concat(symbolsInLine);
    }
  }

  if (!document.isUntitled && document.uri.scheme === "file") {
    // save symbols in local store
    projectSymbols[document.fileName] = symbols.map<SymbolInformation>(
      (symbol: SymbolInformation) =>
        new SymbolInformation(
          symbol.name,
          symbol.kind,
          symbol.location.range,
          document.uri
        )
    );
  }
  return symbols;
};

function getSymbolsOfType(type: SymbolType): ParserFunc {
  switch (type) {
    case "subroutine":
      return parseSubroutineDefinition;
    case "function":
      return parseFunctionDefinition;
    case "variable":
      return parseVariableDefinition;
    default:
      return () => undefined;
  }
}

function getSymbolTypes() {
  let config = workspace.getConfiguration("fortran");
  const symbolTypes = config.get<SymbolType[]>("symbols", [
    "subroutine",
    "function"
  ]);
  return symbolTypes;
}

function parseSubroutineDefinition(line: TextLine) {
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

function parseFunctionDefinition(line: TextLine) {
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
function parseVariableDefinition(line: TextLine) {
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

export function getLocationsForTag(tagText: string): Location[] {
  const possiblesSymbolDefinition = Object.keys(projectSymbols).reduce<
    SymbolInformation[]
  >((tagsForWorkspace: SymbolInformation[], fileName: string) => {
    const symbolInDocument = projectSymbols[fileName].find(symbol => {
      return symbol.name === tagText;
    });
    if (symbolInDocument) {
      tagsForWorkspace.push(symbolInDocument);
    }
    return tagsForWorkspace;
  }, []);

  return possiblesSymbolDefinition.map<Location>(
    symbolDefinition => symbolDefinition.location
  );
}
