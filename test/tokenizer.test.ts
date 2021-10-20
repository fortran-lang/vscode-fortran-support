
// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as fs from 'fs';
import { Tokenizer, TokenType } from '../src/lib/tokenizer';

suite("fortran tokenizer", () => {

  test("get correct amount of tokens", () => {
    const fortranTokenizer = constructFortranTokenizer();
    fortranTokenizer.tokenize("function a( m, n)\n 2 + 3\nend");
    let tokens = fortranTokenizer.tokens;
    assert.strictEqual(tokens.length, 11);
  });
});

function constructFortranTokenizer() {
  const tokenizer = new Tokenizer();
  tokenizer.add(/^function\s*/, TokenType.FUNCTION);
  tokenizer.add(/^subroutine\s*/, TokenType.SUBROUTINE);
  tokenizer.add(/^if\s*/, TokenType.IF);
  tokenizer.add(/^do\s*/, TokenType.DO);
  tokenizer.add(/^end\s*/, TokenType.END);
  tokenizer.add(/^[0-9]+\s*/, TokenType.NUMBER); // number
  tokenizer.add(/^[a-zA-Z_]+[a-zA-Z0-9_]*\s*/, TokenType.VARIABLE); // variable
  tokenizer.add(/^\(\s*/, TokenType.LEFT_PARENTESIS); // left parentesis
  tokenizer.add(/^\)\s*/, TokenType.RIGHT_PARENTESIS); // right parentesis
  tokenizer.add(/^,\s*/, TokenType.COMMA); // comma separator
  tokenizer.add(/[+\-*\/]\s*/, TokenType.BINARY_OPERATOR); // operators
  return tokenizer;
}
