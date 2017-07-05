
// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as fs from 'fs';
import { Tokenizer, TokenType } from '../src/lib/tokenizer';

suite("function helper test", () => {

    test("sample test", () => {
        let tokenizer = new Tokenizer();
        tokenizer.add(/^function\s*/,  TokenType.FUNCTION );
        tokenizer.add(/^subroutine\s*/, TokenType.SUBROUTINE );
        tokenizer.add(/^if\s*/, TokenType.IF);
        tokenizer.add(/^do\s*/, TokenType.DO);
        tokenizer.add(/^end\s*/, TokenType.END );
        tokenizer.add(/^[0-9]+\s*/, TokenType.NUMBER); // number
        tokenizer.add(/^[a-zA-Z_]+[a-zA-Z0-9_]*\s*/, TokenType.VARIABLE ); // variable
        tokenizer.add(/^\(\s*/, TokenType.LEFT_PARENTESIS); // left parentesis
        tokenizer.add(/^\)\s*/, TokenType.RIGHT_PARENTESIS); // right parentesis
        tokenizer.add(/^,\s*/, TokenType.COMMA); // right parentesis
        tokenizer.add(/[+\-*\/]\s*/, TokenType.BINARY_OPERATOR); // right parentesis

        tokenizer.tokenize("function a( m, a10)\n 2 + 3\nend");
        let tokens = tokenizer.tokens;
        console.log(tokens);
    });
});