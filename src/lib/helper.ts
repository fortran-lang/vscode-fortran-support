import * as fs from 'fs';
import * as vscode from 'vscode';
import intrinsics from './fortran-intrinsics';
import { installTool } from './tools';

// IMPORTANT: this should match the value
// on the package.json otherwise the extension won't
// work at all
export const LANGUAGE_ID = 'FortranFreeForm';
export const FORTRAN_FREE_FORM_ID = { language: LANGUAGE_ID, scheme: 'file' };
export { intrinsics }
export const EXTENSION_ID = 'fortran';

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
  return (
    intrinsics.findIndex(intrinsic => intrinsic === keyword.toUpperCase()) !==
    -1
  );
};

interface Doc {
  keyword: string;
  docstr: string;
}

export const loadDocString = keyword => {
  keyword = keyword.toUpperCase();
  let filepath = __dirname + '/../docs/' + keyword + '.json';
  let docstr = fs.readFileSync(filepath).toString();
  let doc: Doc = JSON.parse(docstr);
  return doc.docstr;
};

export const _loadDocString = (keyword: string) => {
  keyword = keyword.toUpperCase();

  let docStringBuffer = fs.readFileSync(
    __dirname + '/../../../src/docs/' + keyword + '.html'
  );
  let docText = docStringBuffer.toString();
  const codeRegex = /<code>(.+?)<\/code>\n?/g;
  const varRegex = /<var>(.+?)<\/var>/g;
  const spanRegex = /<samp><span class="command">(\w+)<\/span><\/samp>/g;
  const tableRegex = /<table\s*.*>([\s\w<>\/\W]+?)<\/table>/g;
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
    .replace(/<td\s*.*?>([\s\w<>\/\W]+?)<\/td>/g, (match, code) => ' | ' + code)
    .replace(/<tr\s*.*?>([\s\w<>\/\W]+?)<\/tr>/g, (match, code) => code + '\n')
    .replace(/<tbody\s*.*?>([\s\w<>\/\W]+?)<\/tbody>/g, (match, code) => code)
    .replace(tableRegex, (match, code) => code)
    .replace(codeRegex, (match, code: string) => {
      return '`' + code + '`';
    })
    .replace(/<p>\s*?/g, '\n')
    .replace(/<\/p>\s*?/g, '\n')
    .replace(headerRegex, (match, h: string, code: string) => {
      let headerLevel: number = parseInt(h);
      let header = '#'.repeat(headerLevel);
      return `${header} ${code}\n`;
    });
  docText = docText.replace(/^ *<br>\n?/gm, '\n').replace(/<\?dl>/g, '');
  console.log(docText);
  return docText;
};

export const getIncludeParams = (paths: string[]) => {
  return paths.map(path => `-I${path}`);
};

export function isPositionInString(
  document: vscode.TextDocument,
  position: vscode.Position
): boolean {
  let lineText = document.lineAt(position.line).text;
  let lineTillCurrentPosition = lineText.substr(0, position.character);

  // Count the number of double quotes in the line till current position. Ignore escaped double quotes
  let doubleQuotesCnt = (lineTillCurrentPosition.match(/\"/g) || []).length;
  let escapedDoubleQuotesCnt = (lineTillCurrentPosition.match(/\\\"/g) || [])
    .length;

  doubleQuotesCnt -= escapedDoubleQuotesCnt;
  return doubleQuotesCnt % 2 === 1;
}

let saveKeywordToJson = keyword => {
  let doc = _loadDocString(keyword);
  let docObject = JSON.stringify({ keyword: keyword, docstr: doc });
  fs.appendFile('src/docs/' + keyword + '.json', docObject, function(err) {
    if (err) throw err;
    console.log('Saved!');
  });
};

export { default as getBinPath } from './paths'

export function promptForMissingTool(tool: string) {
  const items = ['Install'];
  let message = '';
  if (tool === 'fortran-langserver') {
    message =
      'You choose to use the fortranLanguageServer functionality but it is not installed. Please press the Install button to install it';
  }
  vscode.window.showInformationMessage(message, ...items).then(selected => {
    if (selected === 'Install') {
      installTool(tool);
    }
  });

}
