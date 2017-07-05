

import { CancellationToken, TextDocument, Position, Hover } from "vscode";
import * as fs from 'fs';
import * as vscode from 'vscode';
import { isPositionInString, intrinsics, FORTRAN_KEYWORDS } from "../lib/helper";
import { getDeclaredFunctions } from "../lib/functions";


export class FortranCompletionProvider implements vscode.CompletionItemProvider {

    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> {
        return this.provideCompletionItemsInternal(document, position, token, vscode.workspace.getConfiguration('go'));
    }
    public provideCompletionItemsInternal(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, config: vscode.WorkspaceConfiguration): Thenable<vscode.CompletionItem[]> {
        return new Promise<vscode.CompletionItem[]>((resolve, reject) => {
            let filename = document.fileName;
            let lineText = document.lineAt(position.line).text;
            let lineTillCurrentPosition = lineText.substr(0, position.character);
            // nothing to complete
            if (lineText.match(/^\s*\/\//)) {
                return resolve([]);
            }

            let inString = isPositionInString(document, position);
            if (!inString && lineTillCurrentPosition.endsWith('\"')) { // completing a string
                return resolve([]);
            }

            // get current word
            let wordAtPosition = document.getWordRangeAtPosition(position);
            let currentWord = '';
            if (wordAtPosition && wordAtPosition.start.character < position.character) {
                let word = document.getText(wordAtPosition);
                currentWord = word.substr(0, position.character - wordAtPosition.start.character);
            }

            if (currentWord.match(/^\d+$/)) { // starts with a number
                return resolve([]);
            }

            let suggestions = [];

            if (currentWord.length > 0) {
                intrinsics.forEach(intrinsic => {
                    if (intrinsic.startsWith(currentWord.toUpperCase())) {
                        suggestions.push(new vscode.CompletionItem(intrinsic, vscode.CompletionItemKind.Method));
                    }
                });

                // add keyword suggestions
               FORTRAN_KEYWORDS.forEach(keyword => {
                    if (keyword.startsWith(currentWord.toUpperCase())) {
                        suggestions.push(new vscode.CompletionItem(keyword.toLowerCase(), vscode.CompletionItemKind.Keyword));
                    }
                });
            }
            const functions = getDeclaredFunctions(document);
            // check for available functions
            functions.filter(fun => fun.name.startsWith(currentWord))
            .forEach(fun =>{
                suggestions.push(new vscode.CompletionItem(fun.name, vscode.CompletionItemKind.Function));   
            });
            

            return resolve(suggestions);

        })

    }
}
