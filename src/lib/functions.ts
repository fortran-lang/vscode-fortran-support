/* c8 ignore start */
import * as vscode from 'vscode';

export interface Tag {
  name: string;
  path?: string;
  scope?: string;
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

export interface FortranFunction extends Subroutine {
  return: Variable; // function is a subroutine with return type
}

export enum MethodType {
  Subroutine,
  FortranFunction,
}

export function getDeclaredFunctions(document: vscode.TextDocument): FortranFunction[] {
  const lines = document.lineCount;
  const funcs = [];

  for (let i = 0; i < lines; i++) {
    const line: vscode.TextLine = document.lineAt(i);
    if (line.isEmptyOrWhitespace) continue;
    const newFunc = parseFunction(line);
    if (newFunc) {
      funcs.push(newFunc);
    }
  }
  return funcs;
}

export function getDeclaredSubroutines(document: vscode.TextDocument): Subroutine[] {
  const lines = document.lineCount;
  const subroutines = [];

  for (let i = 0; i < lines; i++) {
    const line: vscode.TextLine = document.lineAt(i);
    if (line.isEmptyOrWhitespace) continue;
    const newSubroutine = parseSubroutine(line);
    if (newSubroutine) {
      subroutines.push(newSubroutine);
    }
  }
  return subroutines;
}

export const parseFunction = (line: vscode.TextLine) => {
  return _parse(line, MethodType.FortranFunction);
};

export const parseSubroutine = (line: vscode.TextLine) => {
  return _parse(line, MethodType.Subroutine);
};
export const _parse = (line: vscode.TextLine, type: MethodType) => {
  const functionRegEx =
    /(?<=([a-zA-Z]+(\([\w.=]+\))*)*)\s*\bfunction\b\s*([a-zA-Z_][a-z0-9_]*)\s*\((\s*[a-z_][a-z0-9_,\s]*)*\s*(?:\)|&)\s*(result\([a-z_][\w]*(?:\)|&))*/i;
  const subroutineRegEx =
    /^\s*(?!\bend\b)\w*\s*\bsubroutine\b\s*([a-z][a-z0-9_]*)\s*(?:\((\s*[a-z][a-z0-9_,\s]*)*\s*(\)|&))*/i;
  const regEx = type === MethodType.Subroutine ? subroutineRegEx : functionRegEx;

  if (type === MethodType.Subroutine && line.text.toLowerCase().indexOf('subroutine') < 0) return;
  if (type === MethodType.FortranFunction && line.text.toLowerCase().indexOf('function') < 0)
    return;
  const searchResult = regEx.exec(line.text);
  if (searchResult && type === MethodType.FortranFunction) {
    const [attr, kind_descriptor, name, argsstr, result] = searchResult.slice(1, 5);
    const args = argsstr ? parseArgs(argsstr) : [];
    return {
      name: name,
      args: args,
      lineNumber: line.lineNumber,
    };
  } else if (searchResult && type === MethodType.Subroutine) {
    const [name, argsstr] = searchResult.slice(1);
    const args = argsstr ? parseArgs(argsstr) : [];
    return {
      name: name,
      args: args,
      lineNumber: line.lineNumber,
    };
  }
};

export const parseArgs = (argsstr: string) => {
  const args = argsstr.trim().split(',');
  const variables: Variable[] = args
    .filter(name => validVariableName(name))
    .map(name => {
      return { name: name };
    });
  return variables;
};

export const validVariableName = (name: string) => {
  return name.trim().match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) !== null;
};
/* c8 ignore stop */
