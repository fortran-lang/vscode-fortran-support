

import { CancellationToken, TextDocument, Position, Hover } from "vscode";

import * as vscode from 'vscode';
import { getDeclaredFunctions, getDeclaredSubroutines} from '../lib/functions';
import { getDeclaredVars } from '../lib/variables';

export class FortranDocumentSymbolProvider implements vscode.DocumentSymbolProvider {

    public provideDocumentSymbols(document: TextDocument, token: CancellationToken){

        let functions = getDeclaredFunctions(document).map(fun => {

            let range = new vscode.Range(fun.lineNumber, 0, fun.lineNumber, 100);
            return new vscode.SymbolInformation(fun.name, vscode.SymbolKind.Function, range );
        });
        let subroutines = getDeclaredSubroutines(document).map(fun => {

            let range = new vscode.Range(fun.lineNumber, 0, fun.lineNumber, 100);
            return new vscode.SymbolInformation(fun.name, vscode.SymbolKind.Function, range );
        });
        let vars = getDeclaredVars(document).map(variable => {
            let range = new vscode.Range(variable.lineNumber, 0, variable.lineNumber, 100);
            return new vscode.SymbolInformation(variable.name, vscode.SymbolKind.Variable, range );
        });

        return [...functions, ...subroutines, ...vars];
    }

}