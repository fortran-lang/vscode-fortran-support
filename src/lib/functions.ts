
import * as vscode from 'vscode';

export interface Variable {
    name: string;
    type?: string;
}

export interface Function {
    name: string;
    args: Variable[];
    return: Variable;
    docstr: string;
    lineNumber: number
}



export function getDeclaredFunctions(document: vscode.TextDocument): Function[] {

    let lines = document.lineCount;
    let funs = [];

    for (let i = 0; i < lines; i++) {
        let line: vscode.TextLine = document.lineAt(i);
        if (line.isEmptyOrWhitespace) continue;
        let newFunc = parseFunction(line.text)
        if(newFunc){
            funs.push({...newFunc, lineNumber: i });
        }
    }
    return funs;
}

export const parseFunction = (line: string) => {

    const functionRegEx = /function\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\((\s*[a-zA-z][a-zA-z0-9_,\s]*)*\s*\)/g
    if (line.match(functionRegEx)) {

        let [name, argsstr] = functionRegEx.exec(line).slice(1, 3);
        let args = (argsstr)? parseArgs(argsstr): [];
        return {
            name: name,
            args: args,
            return: null
        };
    }
}

export const parseArgs = (argsstr: string) => {
    let args = argsstr.trim().split(',');
    let variables: Variable[] = args.filter(name => validVariableName(name))
        .map(name => {
            return { name: name };
        });
    return variables;
}

export const validVariableName = (name: string) => {
    return name.trim().match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) !== null;
}

