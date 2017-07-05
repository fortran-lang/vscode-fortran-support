
import * as vscode from 'vscode';

export interface Variable {
    name: string;
    type?: string;
}


export interface Subroutine {

    name: string;
    args: Variable[];
    docstr: string;
    lineNumber: number
}

export interface Function extends Subroutine {    

    return: Variable; // function is a subroutine with return type
}

export enum MethodType {
    Subroutine,
    Function
};



export function getDeclaredFunctions(document: vscode.TextDocument): Function[] {

    let lines = document.lineCount;
    let funcs = [];

    for (let i = 0; i < lines; i++) {
        let line: vscode.TextLine = document.lineAt(i);
        if (line.isEmptyOrWhitespace) continue;
        let newFunc = parseFunction(line.text)
        if(newFunc){
            funcs.push({...newFunc, lineNumber: i });
        }
    }
    return funcs;
}

export function getDeclaredSubroutines(document: vscode.TextDocument):Subroutine[]{

    return [];
}



export const parseFunction = (line: string) => {

    return _parse(line, MethodType.Function);
}

export const parseSubroutine = (line: string) => {

    return _parse(line, MethodType.Subroutine);
}
export const _parse = (line: string, type: MethodType) => {

    const functionRegEx = /([a-zA-Z]+(\([\w.=]+\))*)*\s*function\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\((\s*[a-zA-z][a-zA-z0-9_,\s]*)*\s*\)\s*(result\([a-zA-z_][\w]*\))*/g;
    const subroutineRegEx = /subroutine\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\((\s*[a-zA-z][a-zA-z0-9_,\s]*)*\s*\)/g
    const regEx = (type === MethodType.Subroutine)?subroutineRegEx: functionRegEx;
    if (line.match(regEx)) {
        let [name, argsstr] = functionRegEx.exec(line).slice(1, 3);
        let args = (argsstr)? parseArgs(argsstr): [];
        return {
            name: name,
            args: args
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

