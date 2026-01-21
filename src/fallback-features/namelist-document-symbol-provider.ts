import * as vscode from 'vscode';

const blockStartRegex = /^\s*&(\w+)/;
const blockEndRegex = /^\s*\/\s*$/;
const assignmentRegex = /\b\w+(?:\([^)]*\))?(?=\s*=)/g;

export class NamelistDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
  public provideDocumentSymbols(
    document: vscode.TextDocument
  ): vscode.ProviderResult<vscode.DocumentSymbol[]> {
    const symbols: vscode.DocumentSymbol[] = [];
    let currentBlock: vscode.DocumentSymbol | null = null;
    let currentBlockStart: number | null = null;

    for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex += 1) {
      const line = document.lineAt(lineIndex);
      const lineText = line.text;
      const trimmedLineText = lineText.trim();
      if (trimmedLineText.startsWith('!')) {
        continue;
      }

      const commentIndex = lineText.indexOf('!');
      const effectiveLineText =
        commentIndex >= 0 ? lineText.slice(0, commentIndex) : lineText;

      const blockStartMatch = blockStartRegex.exec(effectiveLineText);
      if (blockStartMatch) {
        if (currentBlock && currentBlockStart !== null) {
          const endLine = Math.max(currentBlockStart, lineIndex - 1);
          currentBlock.range = new vscode.Range(
            currentBlockStart,
            0,
            endLine,
            document.lineAt(endLine).text.length
          );
        }

        const name = blockStartMatch[1];
        const startCharacter = blockStartMatch.index ?? 0;
        const startRange = new vscode.Range(
          lineIndex,
          startCharacter,
          lineIndex,
          startCharacter + blockStartMatch[0].length
        );
        currentBlock = new vscode.DocumentSymbol(
          name,
          'namelist',
          vscode.SymbolKind.Namespace,
          startRange,
          startRange
        );
        currentBlockStart = lineIndex;
        symbols.push(currentBlock);
      }

      assignmentRegex.lastIndex = 0;
      let assignmentMatch = assignmentRegex.exec(effectiveLineText);
      while (assignmentMatch) {
        const varName = assignmentMatch[0];
        const startCharacter = assignmentMatch.index ?? 0;
        const range = new vscode.Range(
          lineIndex,
          startCharacter,
          lineIndex,
          startCharacter + varName.length
        );
        const variableSymbol = new vscode.DocumentSymbol(
          varName,
          '',
          vscode.SymbolKind.Variable,
          range,
          range
        );

        if (currentBlock) {
          currentBlock.children.push(variableSymbol);
        } else {
          symbols.push(variableSymbol);
        }

        assignmentMatch = assignmentRegex.exec(effectiveLineText);
      }

      if (blockEndRegex.test(effectiveLineText) && currentBlock && currentBlockStart !== null) {
        currentBlock.range = new vscode.Range(
          currentBlockStart,
          0,
          lineIndex,
          line.text.length
        );
        currentBlock = null;
        currentBlockStart = null;
      }
    }

    if (currentBlock && currentBlockStart !== null) {
      const endLine = document.lineCount - 1;
      currentBlock.range = new vscode.Range(
        currentBlockStart,
        0,
        endLine,
        document.lineAt(endLine).text.length
      );
    }

    return symbols;
  }
}
