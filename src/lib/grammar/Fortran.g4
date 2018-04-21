grammar Fortran;

options {
    language = JavaScript;
}

tokens {
    SUBROUTINE_DECLARATION
}

/* punctuation symbols */
LP         : '(';
RP         : ')';
LB         : '[';
RB         : ']';
UNDERSCORE : '_';
COMMA      : ',';
COLON      : ':';
POINT      : '.';
POUND      : '#';
AND        : '&';
ASTERISK   : '*';
PLUS       : '+';
MINUS      : '-';
EQUAL      : '=';
LT         : '<';
GT         : '>';
SLASH      : '/';
DQUOTE     : '"';
SQUOTE     : '\'';
PERCENT    : '%';
SEMICOLON  : ';';
PIPE       : '|';

fragment A: [aA];
fragment B: [bB];
fragment C: [cC];
fragment D: [dD];
fragment E: [eE];
fragment F: [fF];
fragment G: [gG];
fragment H: [hH];
fragment I: [iI];
fragment J: [jJ];
fragment K: [kK];
fragment L: [lL];
fragment M: [mM];
fragment N: [nN];
fragment O: [oO];
fragment P: [pP];
fragment Q: [qQ];
fragment R: [rR];
fragment S: [sS];
fragment T: [tT];
fragment U: [uU];
fragment V: [vV];
fragment W: [wW];
fragment X: [xX];
fragment Y: [yY];
fragment Z: [zZ];

/* reserved words */
CONTAINS   : C O N T A I N S;
ELEMENTAL  : E L E M E N T A L;
END        : E N D;
FUNCTION   : F U N C T I O N;
MODULE     : M O D U L E;
PURE       : P U R E;
PROGRAM    : P R O G R A M;
RESULT     : R E S U L T;
RECURSIVE  : R E C U R S I V E;
SUBROUTINE : S U B R O U T I N E;


fragment LETTER : ('a' .. 'z' | 'A' .. 'Z');
fragment DIGIT  : '0' .. '9';

/* tokens */
ID           : LETTER (LETTER | DIGIT | UNDERSCORE)*;
INT          : (DIGIT)+;
WHITESPACE   : (' ' | '\t' | '\r' | '\n')+ -> skip;
COMMENT      : '!' ~('\r' | '\n')* -> skip;
PREPROCESSOR : '#' ~('\r' | '\n')* -> skip;

/* grammar */
file:
    (program | modules) EOF;

block:
    .*?;

program:
    PROGRAM ID block (CONTAINS (subroutine_declaration | function_declaration)*)? END PROGRAM ID;

module:
    MODULE ID block (CONTAINS (subroutine_declaration | function_declaration)*)? END MODULE ID;

modules:
    module+;

arguments:
    ID (COMMA ID)*;

spec_part: /* specifications part */
    block;

exec_part: /* execution part */
    block;

subp_part: /* subprogram part */
    (CONTAINS (subroutine_declaration | function_declaration))?;

subroutine_declaration:
    SUBROUTINE ID LP arguments? RP
        spec_part
    END SUBROUTINE ID;

function_modifiers:
    (ELEMENTAL | PURE | RECURSIVE | ID)*;

function_declaration:
    function_modifiers FUNCTION ID LP arguments? RP (RESULT LP ID RP)?
        spec_part
    END FUNCTION ID;

subroutines:
    subroutine_declaration*;

functions:
    function_declaration*;
