

import { CancellationToken, TextDocument, Position, Hover } from "vscode";

import * as vscode from 'vscode';
import { getDeclaredFunctions } from '../lib/functions'


export class FortranDocumentSymbolProvider implements vscode.DocumentSymbolProvider {

    public provideDocumentSymbols(document: TextDocument, token: CancellationToken){
        
        let functions = getDeclaredFunctions(document).map(fun => {

            let range = new vscode.Range(fun.lineNumber, 0, fun.lineNumber, 100);
            return new vscode.SymbolInformation(fun.name, vscode.SymbolKind.Function, range );
        });


        return functions;
    }

}