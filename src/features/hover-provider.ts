

import { CancellationToken, TextDocument, Position, Hover } from "vscode";
import * as fs from 'fs';
import * as vscode from 'vscode';

import { isIntrinsic, loadDocString } from '../lib/helper';

export default class FortranHoverProvider {

    public provideHover(document: TextDocument, position: Position, token: CancellationToken): Hover | Thenable<Hover> {
        let wordRange = document.getWordRangeAtPosition(position);
        let word = document.getText(wordRange);
        
        if(isIntrinsic(word)){
            return  new Hover(loadDocString(word));    
        }
  
    }

}