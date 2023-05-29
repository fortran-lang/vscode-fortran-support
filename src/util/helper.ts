import * as vscode from 'vscode';

export const FORTRAN_KEYWORDS = [
  'FUNCTION',
  'MODULE',
  'SUBROUTINE',
  'CONTAINS',
  'USE',
  'KIND',
  'DO',
  'IF',
  'ELIF',
  'END',
  'IMPLICIT',
];

export function isPositionInString(
  document: vscode.TextDocument,
  position: vscode.Position
): boolean {
  const lineText = document.lineAt(position.line).text;
  const lineTillCurrentPosition = lineText.substr(0, position.character);

  // Count the number of double quotes in the line till current position. Ignore escaped double quotes
  let doubleQuotesCnt = (lineTillCurrentPosition.match(/"/g) || []).length;
  const escapedDoubleQuotesCnt = (lineTillCurrentPosition.match(/\\"/g) || []).length;

  doubleQuotesCnt -= escapedDoubleQuotesCnt;
  return doubleQuotesCnt % 2 === 1;
}

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export function isUri(input: any): input is vscode.Uri {
  return input && input instanceof vscode.Uri;
}

export function isString(input: any): input is string {
  return typeof input === 'string';
}

export function isNumber(input: any): input is number {
  return typeof input === 'number';
}

export function isBoolean(input: any): input is boolean {
  return typeof input === 'boolean';
}

export function isObject(input: any): input is object {
  return typeof input === 'object';
}

export function isArray(input: any): input is any[] {
  return input instanceof Array;
}

export function isOptionalString(input: any): input is string | undefined {
  return input === undefined || isString(input);
}

export function isArrayOfString(input: any): input is string[] {
  return isArray(input) && input.every(isString);
}

export function arraysEqual(a: any[], b: any[]) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  if (!a.every((e, i) => e === b[i])) return false;
  return true;
}
