import * as vscode from "vscode";
import { Variable } from "./functions";
import { TextLine } from "vscode";

const varibleDecRegEx = /([a-zA-Z]{1,}(\([a-zA-Z0-9]{1,}\))?)(\s*,\s*[a-zA-Z\(\)])*\s*::\s*([a-zA-Z_][a-zA-Z0-9_]*)/g;

export function getDeclaredVars(document: vscode.TextDocument): Variable[] {
  let lines = document.lineCount;
  let vars = [];

  for (let i = 0; i < lines; i++) {
    let line: vscode.TextLine = document.lineAt(i);
    if (line.isEmptyOrWhitespace) continue;
    let newVar = parseVars(line);
    if (newVar) {
      vars.push({ ...newVar, lineNumber: i });
    }
  }
  return vars;
}

export const parseVars = (line: TextLine) => {
  if (line.text.match(varibleDecRegEx)) {
    let [matchExp, type, kind, props, name] = varibleDecRegEx.exec(line.text);
    return { name: name, type: type };
  }
};
