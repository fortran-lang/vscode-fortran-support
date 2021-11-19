import * as fs from 'fs';
import * as vscode from 'vscode';
import { installPythonTool } from './tools';
import intrinsics from './fortran-intrinsics';
import { LoggingService } from '../services/logging-service';

export { intrinsics };

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

export const isIntrinsic = keyword => {
  return intrinsics.findIndex(intrinsic => intrinsic === keyword.toUpperCase()) !== -1;
};

interface Doc {
  keyword: string;
  docstr: string;
}

export const loadDocString = keyword => {
  keyword = keyword.toUpperCase();
  const filepath = __dirname + '/../docs/' + keyword + '.json';
  const docstr = fs.readFileSync(filepath).toString();
  const doc: Doc = JSON.parse(docstr);
  return doc.docstr;
};

export const _loadDocString = (keyword: string) => {
  keyword = keyword.toUpperCase();

  const docStringBuffer = fs.readFileSync(__dirname + '/../../../src/docs/' + keyword + '.html');
  let docText = docStringBuffer.toString();
  const codeRegex = /<code>(.+?)<\/code>\n?/g;
  const varRegex = /<var>(.+?)<\/var>/g;
  const spanRegex = /<samp><span class="command">(\w+)<\/span><\/samp>/g;
  const tableRegex = /<table\s*.*>([\s\w<>/\W]+?)<\/table>/g;
  const codeExampleRegex = /<code class="smallexample"[\s\W\w]*?>([\s\W\w<>]*?)<\/code>/g;
  const headerRegex = /^ *<h(\d)>(.+?)<\/h\1>\n?/gm;
  const defListRegex = /<dt>([\w\W]+?)<\/dt><dd>([\w\W]+?)(<br>)?<\/dd>/g;

  docText = docText
    .replace(varRegex, (match, code: string) => {
      return '`' + code + '`';
    })
    .replace(spanRegex, (match, code) => `*${code}*`)
    .replace(defListRegex, (match, entry, def) => `**${entry}** ${def}\n`)
    .replace(codeExampleRegex, (match, code) => '```\n' + code + '\n\n```\n')
    .replace(/<td\s*.*?>([\s\w<>/\W]+?)<\/td>/g, (match, code) => ' | ' + code)
    .replace(/<tr\s*.*?>([\s\w<>/\W]+?)<\/tr>/g, (match, code) => code + '\n')
    .replace(/<tbody\s*.*?>([\s\w<>/\W]+?)<\/tbody>/g, (match, code) => code)
    .replace(tableRegex, (match, code) => code)
    .replace(codeRegex, (match, code: string) => {
      return '`' + code + '`';
    })
    .replace(/<p>\s*?/g, '\n')
    .replace(/<\/p>\s*?/g, '\n')
    .replace(headerRegex, (match, h: string, code: string) => {
      const headerLevel: number = parseInt(h);
      const header = '#'.repeat(headerLevel);
      return `${header} ${code}\n`;
    });
  docText = docText.replace(/^ *<br>\n?/gm, '\n').replace(/<\?dl>/g, '');
  console.log(docText);
  return docText;
};

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

const saveKeywordToJson = keyword => {
  const doc = _loadDocString(keyword);
  const docObject = JSON.stringify({ keyword: keyword, docstr: doc });
  fs.appendFile('src/docs/' + keyword + '.json', docObject, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
};

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
  if (a.every((e, i) => e !== b[i])) return false;
  return true;
}
