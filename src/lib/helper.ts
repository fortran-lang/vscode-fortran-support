import * as fs from 'fs';
import * as vscode from 'vscode';
import { installPythonTool } from './tools';
import intrinsics from './fortran-intrinsics';
import { LoggingService } from '../services/logging-service';

// IMPORTANT: this should match the value
// on the package.json otherwise the extension won't
// work at all
export const FORTRAN_DOCUMENT_SELECTOR = [
  { scheme: 'file', language: 'FortranFreeForm' },
  { scheme: 'file', language: 'FortranFixedForm' },
];
export { intrinsics };
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

export const getIncludeParams = (paths: string[]) => {
  return paths.map(path => `-I${path}`);
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

/**
 * Install a package either a Python pip package or a VS Marketplace Extension.
 *
 * For the Python install supply the name of the package in PyPi
 * e.g. fortran-language-server
 *
 * For the VS Extension to be installed supply the id of the extension
 * e.g 'hansec.fortran-ls'
 *
 * @param tool name of the tool e.g. fortran-language-server
 * @param msg optional message for installing said package
 * @param toolType type of tool, supports `Python` (through pip) and 'VSExt'
 */
export function promptForMissingTool(
  tool: string,
  msg: string,
  toolType: string,
  logger?: LoggingService
) {
  const items = ['Install'];
  return new Promise((resolve, reject) => {
    resolve(
      vscode.window.showInformationMessage(msg, ...items).then(selected => {
        if (selected === 'Install') {
          switch (toolType) {
            case 'Python':
              installPythonTool(tool, logger);
              break;

            case 'VSExt':
              logger.logInfo(`Installing VS Marketplace Extension with id: ${tool}`);
              vscode.commands.executeCommand('extension.open', tool);
              vscode.commands.executeCommand('workbench.extensions.installExtension', tool);
              logger.logInfo(`Extension ${tool} successfully installed`);
              break;

            default:
              logger.logError(`Failed to install tool: ${tool}`);
              break;
          }
        }
      })
    );
  });
}
