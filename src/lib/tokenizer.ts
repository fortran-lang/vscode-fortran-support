export enum TokenType {
  FUNCTION,
  SUBROUTINE,
  NUMBER,
  VARIABLE,
  END,
  DO,
  IF,
  LEFT_PARENTESIS,
  RIGHT_PARENTESIS,
  COMMA,
  BINARY_OPERATOR,
}

export interface TokenInfo {
  pattern: RegExp;
  token: TokenType;
}

export interface Token {
  token: TokenType;
  sequence: string;
}

export class Tokenizer {
  tokenInfos: TokenInfo[];
  public tokens: Token[];
  constructor() {
    this.tokenInfos = [];
    this.tokens = [];
  }

  public add(regex, token) {
    this.tokenInfos.push({ pattern: regex, token: token });
  }

  public tokenize(expression: string) {
    this.tokens = [];
    while (expression !== '') {
      let match = false;
      for (let i = 0; i < this.tokenInfos.length; i++) {
        const info = this.tokenInfos[i];
        const result = info.pattern.exec(expression);

        if (result && result.length > 0) {
          match = true;
          this.tokens.push({ token: info.token, sequence: result[0].trim() });
          expression = expression.replace(info.pattern, '');
          break;
        }
      }
    }
  }
}
