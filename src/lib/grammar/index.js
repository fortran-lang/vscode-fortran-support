const { InputStream, CommonTokenStream } = require('antlr4');
const FortranParser = require('./generated/FortranParser');
const FortranLexer = require('./generated/FortranLexer');
const fs = require('fs');
const memoizee = require('memoizee');


function extractArguments(node, root) {
    var args = [];
    if (node.children) {
        for (let child of node.children)
            args = args.concat(extractArguments(child, root));
    } else {
        if (root.parser.symbolicNames[node.symbol.type] === 'ID')
            args.push({
                name: node.symbol.text,
                line: node.symbol.line,
                column: node.symbol.column
            });
    }
    return args;
}


function extractDeclarations(node, root) {
    var result = {
        subroutines: [],
        functions: []
    };
    const ruleName = root.parser.ruleNames[node.ruleIndex];
    if (ruleName === 'subroutine_declaration') {
        var argChild = node.children
            .find(child => root.parser.ruleNames[child.ruleIndex] === 'arguments');
        var args = [];
        if (argChild)
            args = extractArguments(argChild, root);
        var subroutineNameSymbol = node.children[1].symbol;
        result.subroutines.push({
            name: subroutineNameSymbol.text,
            line: subroutineNameSymbol.line,
            column: subroutineNameSymbol.column,
            arguments: args
        });
    } else if (ruleName === 'function_declaration') {
        var argChild = node.children
            .find(child => root.parser.ruleNames[child.ruleIndex] === 'arguments');
        var args = [];
        if (argChild)
            args = extractArguments(argChild, root);
        var subroutineNameSymbol = node.children[2].symbol;
        result.functions.push({
            name: subroutineNameSymbol.text,
            line: subroutineNameSymbol.line,
            column: subroutineNameSymbol.column,
            arguments: args
        });
    } else if (node.children) {
        for (let child of node.children) {
            const newDeclarations = extractDeclarations(child, root);
            result = {
                subroutines: [...result.subroutines, ...newDeclarations.subroutines],
                functions: [...result.functions, ...newDeclarations.functions]
            };
        }
    }
    return result;
}


function declarations(input) {
    var chars = new InputStream(input);
    var lexer = new FortranLexer.FortranLexer(chars);
    var tokens = new CommonTokenStream(lexer);
    var parser = new FortranParser.FortranParser(tokens);
    parser.buildParseTrees = true;
    var root = parser.file();
    return extractDeclarations(root, root);
}

const memoizeDeclarations = memoizee(declarations);

function declarationsFromFile(fileName) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(memoizeDeclarations(data));
            }
        });
    });
}

exports.declarations = declarations;
exports.declarationsFromFile = declarationsFromFile;
