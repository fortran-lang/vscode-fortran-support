import { CancellationToken, TextDocument, Position, Hover } from 'vscode'
import * as fs from 'fs'
import * as vscode from 'vscode'
import { isPositionInString, intrinsics, FORTRAN_KEYWORDS } from '../lib/helper'
import { getDeclaredFunctions } from '../lib/functions'

import { EXTENSION_ID } from '../lib/helper'
import { LoggingService } from '../services/logging-service'

class CaseCoverter {
  preferredCase: string
  static LOWER = 'lowercase'
  static UPPER = 'uppercase'

  constructor(preferredCase: string = CaseCoverter.LOWER) {
    this.preferredCase = preferredCase
  }

  convert(word: string): string {
    if (this.preferredCase === CaseCoverter.LOWER) {
      return this.toLower(word)
    } else if (this.preferredCase === CaseCoverter.UPPER) {
      return this.toUpper(word)
    }

    throw new Error(`the provided case ${this.preferredCase} is not supported`)
  }

  toLower(word: string) {
    return word.toLowerCase()
  }
  toUpper(word: string) {
    return word.toUpperCase()
  }
}

export class FortranCompletionProvider
  implements vscode.CompletionItemProvider
{
  constructor(private loggingService: LoggingService) {}
  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Thenable<vscode.CompletionItem[]> {
    return this.provideCompletionItemsInternal(
      document,
      position,
      token,
      vscode.workspace.getConfiguration(EXTENSION_ID)
    )
  }

  public provideCompletionItemsInternal(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    config: vscode.WorkspaceConfiguration
  ): Thenable<vscode.CompletionItem[]> {
    return new Promise<vscode.CompletionItem[]>((resolve, reject) => {
      let lineText = document.lineAt(position.line).text
      let lineTillCurrentPosition = lineText.substr(0, position.character)
      // nothing to complete
      if (lineText.match(/^\s*\/\//)) {
        return resolve([])
      }

      let inString = isPositionInString(document, position)
      if (!inString && lineTillCurrentPosition.endsWith('"')) {
        // completing a string
        return resolve([])
      }

      let currentWord = this.getCurrentWord(document, position)

      if (currentWord.match(/^\d+$/)) {
        // starts with a number
        return resolve([])
      }

      const caseConverter = new CaseCoverter(config.get('preferredCase'))

      if (currentWord.length === 0) {
        resolve([])
      }

      const intrinsicSuggestions = this.getIntrinsicSuggestions(
        currentWord,
        caseConverter
      )

      // add keyword suggestions
      const keywordSuggestions = this.getKeywordSuggestions(currentWord)

      const functionSuggestions = this.getFunctionSuggestions(
        document,
        currentWord
      )

      return resolve([
        ...intrinsicSuggestions,
        ...keywordSuggestions,
        ...functionSuggestions,
      ])
    })
  }

  private getIntrinsicSuggestions(
    currentWord: string,
    caseConverter: CaseCoverter
  ): vscode.CompletionItem[] {
    return intrinsics
      .filter((i) => i.startsWith(currentWord.toUpperCase()))
      .map((intrinsic: string) => {
        return new vscode.CompletionItem(
          caseConverter.convert(intrinsic),
          vscode.CompletionItemKind.Method
        )
      })
  }

  private getKeywordSuggestions(currentWord: string): vscode.CompletionItem[] {
    return FORTRAN_KEYWORDS.filter((keyword) =>
      keyword.startsWith(currentWord.toUpperCase())
    ).map((keyword) => {
      return new vscode.CompletionItem(
        keyword.toLowerCase(),
        vscode.CompletionItemKind.Keyword
      )
    })
  }

  private getFunctionSuggestions(
    document: TextDocument,
    currentWord: string
  ): vscode.CompletionItem[] {
    const functions = getDeclaredFunctions(document)
    // check for available functions
    return functions
      .filter((fun) => fun.name.startsWith(currentWord))
      .map((fun) => {
        return new vscode.CompletionItem(
          `${fun.name}(`,
          vscode.CompletionItemKind.Function
        )
      })
  }

  private getCurrentWord(document: TextDocument, position: Position): string {
    let wordAtPosition = document.getWordRangeAtPosition(position)
    let currentWord = ''
    if (wordAtPosition && wordAtPosition.start.character < position.character) {
      let word = document.getText(wordAtPosition)
      currentWord = word.substr(
        0,
        position.character - wordAtPosition.start.character
      )
    }
    return currentWord
  }
}
