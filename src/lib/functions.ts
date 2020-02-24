import * as vscode from "vscode";
import { TextLine } from "vscode";

interface SymbolParser {}

export interface Tag {
  name: string;
  path?: string;
  scope?: string;
  parseMe?: (SymbolParser) => vscode.SymbolInformation;
}

export interface Variable extends Tag {
  name: string;
  type?: string;
  lineNumber?: number;
}

export interface Subroutine extends Tag {
  name: string;
  args: Variable[];
  docstr?: string;
  lineNumber: number;
}

export interface Function extends Subroutine {
  return: Variable; // function is a subroutine with return type
}

export enum MethodType {
  Subroutine,
  Function
}

export function getDeclaredFunctions(
  document: vscode.TextDocument
): Function[] {
  let lines = document.lineCount;
  let funcs = [];

  for (let i = 0; i < lines; i++) {
    let line: vscode.TextLine = document.lineAt(i);
    if (line.isEmptyOrWhitespace) continue;
    let newFunc = parseFunction(line);
    if (newFunc) {
      funcs.push(newFunc);
    }
  }
  return funcs;
}

export function getDeclaredSubroutines(
  document: vscode.TextDocument
): Subroutine[] {
  let lines = document.lineCount;
  let subroutines = [];

  for (let i = 0; i < lines; i++) {
    let line: vscode.TextLine = document.lineAt(i);
    if (line.isEmptyOrWhitespace) continue;
    let newSubroutine = parseSubroutine(line);
    if (newSubroutine) {
      subroutines.push(newSubroutine);
    }
  }
  return subroutines;
}

export const parseFunction = (line: vscode.TextLine) => {
  return _parse(line, MethodType.Function);
};

export const parseSubroutine = (line: TextLine) => {
  return _parse(line, MethodType.Subroutine);
};
export const _parse = (line: TextLine, type: MethodType) => {
  const functionRegEx = /(?<=([a-zA-Z]+(\([\w.=]+\))*)*)\s*\bfunction\b\s*([a-zA-Z_][a-z0-9_]*)\s*\((\s*[a-z_][a-z0-9_,\s]*)*\s*(?:\)|\&)\s*(result\([a-z_][\w]*(?:\)|\&))*/i;
  const subroutineRegEx = /^\s*(?!\bend\b)\w*\s*\bsubroutine\b\s*([a-z][a-z0-9_]*)\s*(?:\((\s*[a-z][a-z0-9_,\s]*)*\s*(\)|\&))*/i;
  const regEx =
    type === MethodType.Subroutine ? subroutineRegEx : functionRegEx;

  if (type === MethodType.Subroutine && line.text.toLowerCase().indexOf("subroutine") < 0)
    return;
  if (type === MethodType.Function && line.text.toLowerCase().indexOf("function") < 0) return;
  const searchResult = regEx.exec(line.text);
  if (searchResult && type === MethodType.Function) {
    let [attr, kind_descriptor, name, argsstr, result] = searchResult.slice(
      1,
      5
    );
    let args = argsstr ? parseArgs(argsstr) : [];
    return {
      name: name,
      args: args,
      lineNumber: line.lineNumber
    };
  } else if (searchResult && type === MethodType.Subroutine) {
    let [name, argsstr] = searchResult.slice(1);
    let args = argsstr ? parseArgs(argsstr) : [];
    return {
      name: name,
      args: args,
      lineNumber: line.lineNumber
    };
  }
};

export const parseArgs = (argsstr: string) => {
  let args = argsstr.trim().split(",");
  let variables: Variable[] = args
    .filter(name => validVariableName(name))
    .map(name => {
      return { name: name };
    });
  return variables;
};

export const validVariableName = (name: string) => {
  return name.trim().match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) !== null;
};
