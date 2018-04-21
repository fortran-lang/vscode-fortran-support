// Generated from /home/leandro/Desktop/vscode-fortran-support/src/lib/grammar/Fortran.g4 by ANTLR 4.7.1
// jshint ignore: start
var antlr4 = require('antlr4/index');
var grammarFileName = "Fortran.g4";

var serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964",
    "\u0003(\u0096\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004\t",
    "\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007\u0004",
    "\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0004\f\t\f\u0004",
    "\r\t\r\u0004\u000e\t\u000e\u0004\u000f\t\u000f\u0003\u0002\u0003\u0002",
    "\u0005\u0002!\n\u0002\u0003\u0002\u0003\u0002\u0003\u0003\u0007\u0003",
    "&\n\u0003\f\u0003\u000e\u0003)\u000b\u0003\u0003\u0004\u0003\u0004\u0003",
    "\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0007\u00041\n\u0004\f\u0004",
    "\u000e\u00044\u000b\u0004\u0005\u00046\n\u0004\u0003\u0004\u0003\u0004",
    "\u0003\u0004\u0003\u0004\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005",
    "\u0003\u0005\u0003\u0005\u0007\u0005B\n\u0005\f\u0005\u000e\u0005E\u000b",
    "\u0005\u0005\u0005G\n\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003",
    "\u0005\u0003\u0006\u0006\u0006N\n\u0006\r\u0006\u000e\u0006O\u0003\u0007",
    "\u0003\u0007\u0003\u0007\u0007\u0007U\n\u0007\f\u0007\u000e\u0007X\u000b",
    "\u0007\u0003\b\u0003\b\u0003\t\u0003\t\u0003\n\u0003\n\u0003\n\u0005",
    "\na\n\n\u0005\nc\n\n\u0003\u000b\u0003\u000b\u0003\u000b\u0003\u000b",
    "\u0005\u000bi\n\u000b\u0003\u000b\u0003\u000b\u0003\u000b\u0003\u000b",
    "\u0003\u000b\u0003\u000b\u0003\f\u0007\fr\n\f\f\f\u000e\fu\u000b\f\u0003",
    "\r\u0003\r\u0003\r\u0003\r\u0003\r\u0005\r|\n\r\u0003\r\u0003\r\u0003",
    "\r\u0003\r\u0003\r\u0005\r\u0083\n\r\u0003\r\u0003\r\u0003\r\u0003\r",
    "\u0003\r\u0003\u000e\u0007\u000e\u008b\n\u000e\f\u000e\u000e\u000e\u008e",
    "\u000b\u000e\u0003\u000f\u0007\u000f\u0091\n\u000f\f\u000f\u000e\u000f",
    "\u0094\u000b\u000f\u0003\u000f\u0003\'\u0002\u0010\u0002\u0004\u0006",
    "\b\n\f\u000e\u0010\u0012\u0014\u0016\u0018\u001a\u001c\u0002\u0003\u0006",
    "\u0002\u001a\u001a\u001e\u001e!!##\u0002\u0099\u0002 \u0003\u0002\u0002",
    "\u0002\u0004\'\u0003\u0002\u0002\u0002\u0006*\u0003\u0002\u0002\u0002",
    "\b;\u0003\u0002\u0002\u0002\nM\u0003\u0002\u0002\u0002\fQ\u0003\u0002",
    "\u0002\u0002\u000eY\u0003\u0002\u0002\u0002\u0010[\u0003\u0002\u0002",
    "\u0002\u0012b\u0003\u0002\u0002\u0002\u0014d\u0003\u0002\u0002\u0002",
    "\u0016s\u0003\u0002\u0002\u0002\u0018v\u0003\u0002\u0002\u0002\u001a",
    "\u008c\u0003\u0002\u0002\u0002\u001c\u0092\u0003\u0002\u0002\u0002\u001e",
    "!\u0005\u0006\u0004\u0002\u001f!\u0005\n\u0006\u0002 \u001e\u0003\u0002",
    "\u0002\u0002 \u001f\u0003\u0002\u0002\u0002!\"\u0003\u0002\u0002\u0002",
    "\"#\u0007\u0002\u0002\u0003#\u0003\u0003\u0002\u0002\u0002$&\u000b\u0002",
    "\u0002\u0002%$\u0003\u0002\u0002\u0002&)\u0003\u0002\u0002\u0002\'(",
    "\u0003\u0002\u0002\u0002\'%\u0003\u0002\u0002\u0002(\u0005\u0003\u0002",
    "\u0002\u0002)\'\u0003\u0002\u0002\u0002*+\u0007\u001f\u0002\u0002+,",
    "\u0007#\u0002\u0002,5\u0005\u0004\u0003\u0002-2\u0007\u0019\u0002\u0002",
    ".1\u0005\u0014\u000b\u0002/1\u0005\u0018\r\u00020.\u0003\u0002\u0002",
    "\u00020/\u0003\u0002\u0002\u000214\u0003\u0002\u0002\u000220\u0003\u0002",
    "\u0002\u000223\u0003\u0002\u0002\u000236\u0003\u0002\u0002\u000242\u0003",
    "\u0002\u0002\u00025-\u0003\u0002\u0002\u000256\u0003\u0002\u0002\u0002",
    "67\u0003\u0002\u0002\u000278\u0007\u001b\u0002\u000289\u0007\u001f\u0002",
    "\u00029:\u0007#\u0002\u0002:\u0007\u0003\u0002\u0002\u0002;<\u0007\u001d",
    "\u0002\u0002<=\u0007#\u0002\u0002=F\u0005\u0004\u0003\u0002>C\u0007",
    "\u0019\u0002\u0002?B\u0005\u0014\u000b\u0002@B\u0005\u0018\r\u0002A",
    "?\u0003\u0002\u0002\u0002A@\u0003\u0002\u0002\u0002BE\u0003\u0002\u0002",
    "\u0002CA\u0003\u0002\u0002\u0002CD\u0003\u0002\u0002\u0002DG\u0003\u0002",
    "\u0002\u0002EC\u0003\u0002\u0002\u0002F>\u0003\u0002\u0002\u0002FG\u0003",
    "\u0002\u0002\u0002GH\u0003\u0002\u0002\u0002HI\u0007\u001b\u0002\u0002",
    "IJ\u0007\u001d\u0002\u0002JK\u0007#\u0002\u0002K\t\u0003\u0002\u0002",
    "\u0002LN\u0005\b\u0005\u0002ML\u0003\u0002\u0002\u0002NO\u0003\u0002",
    "\u0002\u0002OM\u0003\u0002\u0002\u0002OP\u0003\u0002\u0002\u0002P\u000b",
    "\u0003\u0002\u0002\u0002QV\u0007#\u0002\u0002RS\u0007\b\u0002\u0002",
    "SU\u0007#\u0002\u0002TR\u0003\u0002\u0002\u0002UX\u0003\u0002\u0002",
    "\u0002VT\u0003\u0002\u0002\u0002VW\u0003\u0002\u0002\u0002W\r\u0003",
    "\u0002\u0002\u0002XV\u0003\u0002\u0002\u0002YZ\u0005\u0004\u0003\u0002",
    "Z\u000f\u0003\u0002\u0002\u0002[\\\u0005\u0004\u0003\u0002\\\u0011\u0003",
    "\u0002\u0002\u0002]`\u0007\u0019\u0002\u0002^a\u0005\u0014\u000b\u0002",
    "_a\u0005\u0018\r\u0002`^\u0003\u0002\u0002\u0002`_\u0003\u0002\u0002",
    "\u0002ac\u0003\u0002\u0002\u0002b]\u0003\u0002\u0002\u0002bc\u0003\u0002",
    "\u0002\u0002c\u0013\u0003\u0002\u0002\u0002de\u0007\"\u0002\u0002ef",
    "\u0007#\u0002\u0002fh\u0007\u0003\u0002\u0002gi\u0005\f\u0007\u0002",
    "hg\u0003\u0002\u0002\u0002hi\u0003\u0002\u0002\u0002ij\u0003\u0002\u0002",
    "\u0002jk\u0007\u0004\u0002\u0002kl\u0005\u000e\b\u0002lm\u0007\u001b",
    "\u0002\u0002mn\u0007\"\u0002\u0002no\u0007#\u0002\u0002o\u0015\u0003",
    "\u0002\u0002\u0002pr\t\u0002\u0002\u0002qp\u0003\u0002\u0002\u0002r",
    "u\u0003\u0002\u0002\u0002sq\u0003\u0002\u0002\u0002st\u0003\u0002\u0002",
    "\u0002t\u0017\u0003\u0002\u0002\u0002us\u0003\u0002\u0002\u0002vw\u0005",
    "\u0016\f\u0002wx\u0007\u001c\u0002\u0002xy\u0007#\u0002\u0002y{\u0007",
    "\u0003\u0002\u0002z|\u0005\f\u0007\u0002{z\u0003\u0002\u0002\u0002{",
    "|\u0003\u0002\u0002\u0002|}\u0003\u0002\u0002\u0002}\u0082\u0007\u0004",
    "\u0002\u0002~\u007f\u0007 \u0002\u0002\u007f\u0080\u0007\u0003\u0002",
    "\u0002\u0080\u0081\u0007#\u0002\u0002\u0081\u0083\u0007\u0004\u0002",
    "\u0002\u0082~\u0003\u0002\u0002\u0002\u0082\u0083\u0003\u0002\u0002",
    "\u0002\u0083\u0084\u0003\u0002\u0002\u0002\u0084\u0085\u0005\u000e\b",
    "\u0002\u0085\u0086\u0007\u001b\u0002\u0002\u0086\u0087\u0007\u001c\u0002",
    "\u0002\u0087\u0088\u0007#\u0002\u0002\u0088\u0019\u0003\u0002\u0002",
    "\u0002\u0089\u008b\u0005\u0014\u000b\u0002\u008a\u0089\u0003\u0002\u0002",
    "\u0002\u008b\u008e\u0003\u0002\u0002\u0002\u008c\u008a\u0003\u0002\u0002",
    "\u0002\u008c\u008d\u0003\u0002\u0002\u0002\u008d\u001b\u0003\u0002\u0002",
    "\u0002\u008e\u008c\u0003\u0002\u0002\u0002\u008f\u0091\u0005\u0018\r",
    "\u0002\u0090\u008f\u0003\u0002\u0002\u0002\u0091\u0094\u0003\u0002\u0002",
    "\u0002\u0092\u0090\u0003\u0002\u0002\u0002\u0092\u0093\u0003\u0002\u0002",
    "\u0002\u0093\u001d\u0003\u0002\u0002\u0002\u0094\u0092\u0003\u0002\u0002",
    "\u0002\u0014 \'025ACFOV`bhs{\u0082\u008c\u0092"].join("");


var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map( function(ds, index) { return new antlr4.dfa.DFA(ds, index); });

var sharedContextCache = new antlr4.PredictionContextCache();

var literalNames = [ null, "'('", "')'", "'['", "']'", "'_'", "','", "':'", 
                     "'.'", "'#'", "'&'", "'*'", "'+'", "'-'", "'='", "'<'", 
                     "'>'", "'/'", "'\"'", "'''", "'%'", "';'", "'|'" ];

var symbolicNames = [ null, "LP", "RP", "LB", "RB", "UNDERSCORE", "COMMA", 
                      "COLON", "POINT", "POUND", "AND", "ASTERISK", "PLUS", 
                      "MINUS", "EQUAL", "LT", "GT", "SLASH", "DQUOTE", "SQUOTE", 
                      "PERCENT", "SEMICOLON", "PIPE", "CONTAINS", "ELEMENTAL", 
                      "END", "FUNCTION", "MODULE", "PURE", "PROGRAM", "RESULT", 
                      "RECURSIVE", "SUBROUTINE", "ID", "INT", "WHITESPACE", 
                      "COMMENT", "PREPROCESSOR", "SUBROUTINE_DECLARATION" ];

var ruleNames =  [ "file", "block", "program", "module", "modules", "arguments", 
                   "spec_part", "exec_part", "subp_part", "subroutine_declaration", 
                   "function_modifiers", "function_declaration", "subroutines", 
                   "functions" ];

function FortranParser (input) {
	antlr4.Parser.call(this, input);
    this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
    this.ruleNames = ruleNames;
    this.literalNames = literalNames;
    this.symbolicNames = symbolicNames;
    return this;
}

FortranParser.prototype = Object.create(antlr4.Parser.prototype);
FortranParser.prototype.constructor = FortranParser;

Object.defineProperty(FortranParser.prototype, "atn", {
	get : function() {
		return atn;
	}
});

FortranParser.EOF = antlr4.Token.EOF;
FortranParser.LP = 1;
FortranParser.RP = 2;
FortranParser.LB = 3;
FortranParser.RB = 4;
FortranParser.UNDERSCORE = 5;
FortranParser.COMMA = 6;
FortranParser.COLON = 7;
FortranParser.POINT = 8;
FortranParser.POUND = 9;
FortranParser.AND = 10;
FortranParser.ASTERISK = 11;
FortranParser.PLUS = 12;
FortranParser.MINUS = 13;
FortranParser.EQUAL = 14;
FortranParser.LT = 15;
FortranParser.GT = 16;
FortranParser.SLASH = 17;
FortranParser.DQUOTE = 18;
FortranParser.SQUOTE = 19;
FortranParser.PERCENT = 20;
FortranParser.SEMICOLON = 21;
FortranParser.PIPE = 22;
FortranParser.CONTAINS = 23;
FortranParser.ELEMENTAL = 24;
FortranParser.END = 25;
FortranParser.FUNCTION = 26;
FortranParser.MODULE = 27;
FortranParser.PURE = 28;
FortranParser.PROGRAM = 29;
FortranParser.RESULT = 30;
FortranParser.RECURSIVE = 31;
FortranParser.SUBROUTINE = 32;
FortranParser.ID = 33;
FortranParser.INT = 34;
FortranParser.WHITESPACE = 35;
FortranParser.COMMENT = 36;
FortranParser.PREPROCESSOR = 37;
FortranParser.SUBROUTINE_DECLARATION = 38;

FortranParser.RULE_file = 0;
FortranParser.RULE_block = 1;
FortranParser.RULE_program = 2;
FortranParser.RULE_module = 3;
FortranParser.RULE_modules = 4;
FortranParser.RULE_arguments = 5;
FortranParser.RULE_spec_part = 6;
FortranParser.RULE_exec_part = 7;
FortranParser.RULE_subp_part = 8;
FortranParser.RULE_subroutine_declaration = 9;
FortranParser.RULE_function_modifiers = 10;
FortranParser.RULE_function_declaration = 11;
FortranParser.RULE_subroutines = 12;
FortranParser.RULE_functions = 13;

function FileContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FortranParser.RULE_file;
    return this;
}

FileContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
FileContext.prototype.constructor = FileContext;

FileContext.prototype.EOF = function() {
    return this.getToken(FortranParser.EOF, 0);
};

FileContext.prototype.program = function() {
    return this.getTypedRuleContext(ProgramContext,0);
};

FileContext.prototype.modules = function() {
    return this.getTypedRuleContext(ModulesContext,0);
};




FortranParser.FileContext = FileContext;

FortranParser.prototype.file = function() {

    var localctx = new FileContext(this, this._ctx, this.state);
    this.enterRule(localctx, 0, FortranParser.RULE_file);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 30;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case FortranParser.PROGRAM:
            this.state = 28;
            this.program();
            break;
        case FortranParser.MODULE:
            this.state = 29;
            this.modules();
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
        this.state = 32;
        this.match(FortranParser.EOF);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function BlockContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FortranParser.RULE_block;
    return this;
}

BlockContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
BlockContext.prototype.constructor = BlockContext;





FortranParser.BlockContext = BlockContext;

FortranParser.prototype.block = function() {

    var localctx = new BlockContext(this, this._ctx, this.state);
    this.enterRule(localctx, 2, FortranParser.RULE_block);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 37;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,1,this._ctx)
        while(_alt!=1 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1+1) {
                this.state = 34;
                this.matchWildcard(); 
            }
            this.state = 39;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,1,this._ctx);
        }

    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ProgramContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FortranParser.RULE_program;
    return this;
}

ProgramContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ProgramContext.prototype.constructor = ProgramContext;

ProgramContext.prototype.PROGRAM = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(FortranParser.PROGRAM);
    } else {
        return this.getToken(FortranParser.PROGRAM, i);
    }
};


ProgramContext.prototype.ID = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(FortranParser.ID);
    } else {
        return this.getToken(FortranParser.ID, i);
    }
};


ProgramContext.prototype.block = function() {
    return this.getTypedRuleContext(BlockContext,0);
};

ProgramContext.prototype.END = function() {
    return this.getToken(FortranParser.END, 0);
};

ProgramContext.prototype.CONTAINS = function() {
    return this.getToken(FortranParser.CONTAINS, 0);
};

ProgramContext.prototype.subroutine_declaration = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Subroutine_declarationContext);
    } else {
        return this.getTypedRuleContext(Subroutine_declarationContext,i);
    }
};

ProgramContext.prototype.function_declaration = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Function_declarationContext);
    } else {
        return this.getTypedRuleContext(Function_declarationContext,i);
    }
};




FortranParser.ProgramContext = ProgramContext;

FortranParser.prototype.program = function() {

    var localctx = new ProgramContext(this, this._ctx, this.state);
    this.enterRule(localctx, 4, FortranParser.RULE_program);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 40;
        this.match(FortranParser.PROGRAM);
        this.state = 41;
        this.match(FortranParser.ID);
        this.state = 42;
        this.block();
        this.state = 51;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if(_la===FortranParser.CONTAINS) {
            this.state = 43;
            this.match(FortranParser.CONTAINS);
            this.state = 48;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while(((((_la - 24)) & ~0x1f) == 0 && ((1 << (_la - 24)) & ((1 << (FortranParser.ELEMENTAL - 24)) | (1 << (FortranParser.FUNCTION - 24)) | (1 << (FortranParser.PURE - 24)) | (1 << (FortranParser.RECURSIVE - 24)) | (1 << (FortranParser.SUBROUTINE - 24)) | (1 << (FortranParser.ID - 24)))) !== 0)) {
                this.state = 46;
                this._errHandler.sync(this);
                switch(this._input.LA(1)) {
                case FortranParser.SUBROUTINE:
                    this.state = 44;
                    this.subroutine_declaration();
                    break;
                case FortranParser.ELEMENTAL:
                case FortranParser.FUNCTION:
                case FortranParser.PURE:
                case FortranParser.RECURSIVE:
                case FortranParser.ID:
                    this.state = 45;
                    this.function_declaration();
                    break;
                default:
                    throw new antlr4.error.NoViableAltException(this);
                }
                this.state = 50;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            }
        }

        this.state = 53;
        this.match(FortranParser.END);
        this.state = 54;
        this.match(FortranParser.PROGRAM);
        this.state = 55;
        this.match(FortranParser.ID);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ModuleContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FortranParser.RULE_module;
    return this;
}

ModuleContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ModuleContext.prototype.constructor = ModuleContext;

ModuleContext.prototype.MODULE = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(FortranParser.MODULE);
    } else {
        return this.getToken(FortranParser.MODULE, i);
    }
};


ModuleContext.prototype.ID = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(FortranParser.ID);
    } else {
        return this.getToken(FortranParser.ID, i);
    }
};


ModuleContext.prototype.block = function() {
    return this.getTypedRuleContext(BlockContext,0);
};

ModuleContext.prototype.END = function() {
    return this.getToken(FortranParser.END, 0);
};

ModuleContext.prototype.CONTAINS = function() {
    return this.getToken(FortranParser.CONTAINS, 0);
};

ModuleContext.prototype.subroutine_declaration = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Subroutine_declarationContext);
    } else {
        return this.getTypedRuleContext(Subroutine_declarationContext,i);
    }
};

ModuleContext.prototype.function_declaration = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Function_declarationContext);
    } else {
        return this.getTypedRuleContext(Function_declarationContext,i);
    }
};




FortranParser.ModuleContext = ModuleContext;

FortranParser.prototype.module = function() {

    var localctx = new ModuleContext(this, this._ctx, this.state);
    this.enterRule(localctx, 6, FortranParser.RULE_module);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 57;
        this.match(FortranParser.MODULE);
        this.state = 58;
        this.match(FortranParser.ID);
        this.state = 59;
        this.block();
        this.state = 68;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if(_la===FortranParser.CONTAINS) {
            this.state = 60;
            this.match(FortranParser.CONTAINS);
            this.state = 65;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while(((((_la - 24)) & ~0x1f) == 0 && ((1 << (_la - 24)) & ((1 << (FortranParser.ELEMENTAL - 24)) | (1 << (FortranParser.FUNCTION - 24)) | (1 << (FortranParser.PURE - 24)) | (1 << (FortranParser.RECURSIVE - 24)) | (1 << (FortranParser.SUBROUTINE - 24)) | (1 << (FortranParser.ID - 24)))) !== 0)) {
                this.state = 63;
                this._errHandler.sync(this);
                switch(this._input.LA(1)) {
                case FortranParser.SUBROUTINE:
                    this.state = 61;
                    this.subroutine_declaration();
                    break;
                case FortranParser.ELEMENTAL:
                case FortranParser.FUNCTION:
                case FortranParser.PURE:
                case FortranParser.RECURSIVE:
                case FortranParser.ID:
                    this.state = 62;
                    this.function_declaration();
                    break;
                default:
                    throw new antlr4.error.NoViableAltException(this);
                }
                this.state = 67;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            }
        }

        this.state = 70;
        this.match(FortranParser.END);
        this.state = 71;
        this.match(FortranParser.MODULE);
        this.state = 72;
        this.match(FortranParser.ID);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ModulesContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FortranParser.RULE_modules;
    return this;
}

ModulesContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ModulesContext.prototype.constructor = ModulesContext;

ModulesContext.prototype.module = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ModuleContext);
    } else {
        return this.getTypedRuleContext(ModuleContext,i);
    }
};




FortranParser.ModulesContext = ModulesContext;

FortranParser.prototype.modules = function() {

    var localctx = new ModulesContext(this, this._ctx, this.state);
    this.enterRule(localctx, 8, FortranParser.RULE_modules);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 75; 
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        do {
            this.state = 74;
            this.module();
            this.state = 77; 
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        } while(_la===FortranParser.MODULE);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ArgumentsContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FortranParser.RULE_arguments;
    return this;
}

ArgumentsContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ArgumentsContext.prototype.constructor = ArgumentsContext;

ArgumentsContext.prototype.ID = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(FortranParser.ID);
    } else {
        return this.getToken(FortranParser.ID, i);
    }
};


ArgumentsContext.prototype.COMMA = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(FortranParser.COMMA);
    } else {
        return this.getToken(FortranParser.COMMA, i);
    }
};





FortranParser.ArgumentsContext = ArgumentsContext;

FortranParser.prototype.arguments = function() {

    var localctx = new ArgumentsContext(this, this._ctx, this.state);
    this.enterRule(localctx, 10, FortranParser.RULE_arguments);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 79;
        this.match(FortranParser.ID);
        this.state = 84;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===FortranParser.COMMA) {
            this.state = 80;
            this.match(FortranParser.COMMA);
            this.state = 81;
            this.match(FortranParser.ID);
            this.state = 86;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Spec_partContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FortranParser.RULE_spec_part;
    return this;
}

Spec_partContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Spec_partContext.prototype.constructor = Spec_partContext;

Spec_partContext.prototype.block = function() {
    return this.getTypedRuleContext(BlockContext,0);
};




FortranParser.Spec_partContext = Spec_partContext;

FortranParser.prototype.spec_part = function() {

    var localctx = new Spec_partContext(this, this._ctx, this.state);
    this.enterRule(localctx, 12, FortranParser.RULE_spec_part);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 87;
        this.block();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Exec_partContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FortranParser.RULE_exec_part;
    return this;
}

Exec_partContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Exec_partContext.prototype.constructor = Exec_partContext;

Exec_partContext.prototype.block = function() {
    return this.getTypedRuleContext(BlockContext,0);
};




FortranParser.Exec_partContext = Exec_partContext;

FortranParser.prototype.exec_part = function() {

    var localctx = new Exec_partContext(this, this._ctx, this.state);
    this.enterRule(localctx, 14, FortranParser.RULE_exec_part);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 89;
        this.block();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Subp_partContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FortranParser.RULE_subp_part;
    return this;
}

Subp_partContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Subp_partContext.prototype.constructor = Subp_partContext;

Subp_partContext.prototype.CONTAINS = function() {
    return this.getToken(FortranParser.CONTAINS, 0);
};

Subp_partContext.prototype.subroutine_declaration = function() {
    return this.getTypedRuleContext(Subroutine_declarationContext,0);
};

Subp_partContext.prototype.function_declaration = function() {
    return this.getTypedRuleContext(Function_declarationContext,0);
};




FortranParser.Subp_partContext = Subp_partContext;

FortranParser.prototype.subp_part = function() {

    var localctx = new Subp_partContext(this, this._ctx, this.state);
    this.enterRule(localctx, 16, FortranParser.RULE_subp_part);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 96;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if(_la===FortranParser.CONTAINS) {
            this.state = 91;
            this.match(FortranParser.CONTAINS);
            this.state = 94;
            this._errHandler.sync(this);
            switch(this._input.LA(1)) {
            case FortranParser.SUBROUTINE:
                this.state = 92;
                this.subroutine_declaration();
                break;
            case FortranParser.ELEMENTAL:
            case FortranParser.FUNCTION:
            case FortranParser.PURE:
            case FortranParser.RECURSIVE:
            case FortranParser.ID:
                this.state = 93;
                this.function_declaration();
                break;
            default:
                throw new antlr4.error.NoViableAltException(this);
            }
        }

    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Subroutine_declarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FortranParser.RULE_subroutine_declaration;
    return this;
}

Subroutine_declarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Subroutine_declarationContext.prototype.constructor = Subroutine_declarationContext;

Subroutine_declarationContext.prototype.SUBROUTINE = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(FortranParser.SUBROUTINE);
    } else {
        return this.getToken(FortranParser.SUBROUTINE, i);
    }
};


Subroutine_declarationContext.prototype.ID = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(FortranParser.ID);
    } else {
        return this.getToken(FortranParser.ID, i);
    }
};


Subroutine_declarationContext.prototype.LP = function() {
    return this.getToken(FortranParser.LP, 0);
};

Subroutine_declarationContext.prototype.RP = function() {
    return this.getToken(FortranParser.RP, 0);
};

Subroutine_declarationContext.prototype.spec_part = function() {
    return this.getTypedRuleContext(Spec_partContext,0);
};

Subroutine_declarationContext.prototype.END = function() {
    return this.getToken(FortranParser.END, 0);
};

Subroutine_declarationContext.prototype.arguments = function() {
    return this.getTypedRuleContext(ArgumentsContext,0);
};




FortranParser.Subroutine_declarationContext = Subroutine_declarationContext;

FortranParser.prototype.subroutine_declaration = function() {

    var localctx = new Subroutine_declarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 18, FortranParser.RULE_subroutine_declaration);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 98;
        this.match(FortranParser.SUBROUTINE);
        this.state = 99;
        this.match(FortranParser.ID);
        this.state = 100;
        this.match(FortranParser.LP);
        this.state = 102;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if(_la===FortranParser.ID) {
            this.state = 101;
            this.arguments();
        }

        this.state = 104;
        this.match(FortranParser.RP);
        this.state = 105;
        this.spec_part();
        this.state = 106;
        this.match(FortranParser.END);
        this.state = 107;
        this.match(FortranParser.SUBROUTINE);
        this.state = 108;
        this.match(FortranParser.ID);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Function_modifiersContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FortranParser.RULE_function_modifiers;
    return this;
}

Function_modifiersContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Function_modifiersContext.prototype.constructor = Function_modifiersContext;

Function_modifiersContext.prototype.ELEMENTAL = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(FortranParser.ELEMENTAL);
    } else {
        return this.getToken(FortranParser.ELEMENTAL, i);
    }
};


Function_modifiersContext.prototype.PURE = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(FortranParser.PURE);
    } else {
        return this.getToken(FortranParser.PURE, i);
    }
};


Function_modifiersContext.prototype.RECURSIVE = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(FortranParser.RECURSIVE);
    } else {
        return this.getToken(FortranParser.RECURSIVE, i);
    }
};


Function_modifiersContext.prototype.ID = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(FortranParser.ID);
    } else {
        return this.getToken(FortranParser.ID, i);
    }
};





FortranParser.Function_modifiersContext = Function_modifiersContext;

FortranParser.prototype.function_modifiers = function() {

    var localctx = new Function_modifiersContext(this, this._ctx, this.state);
    this.enterRule(localctx, 20, FortranParser.RULE_function_modifiers);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 113;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(((((_la - 24)) & ~0x1f) == 0 && ((1 << (_la - 24)) & ((1 << (FortranParser.ELEMENTAL - 24)) | (1 << (FortranParser.PURE - 24)) | (1 << (FortranParser.RECURSIVE - 24)) | (1 << (FortranParser.ID - 24)))) !== 0)) {
            this.state = 110;
            _la = this._input.LA(1);
            if(!(((((_la - 24)) & ~0x1f) == 0 && ((1 << (_la - 24)) & ((1 << (FortranParser.ELEMENTAL - 24)) | (1 << (FortranParser.PURE - 24)) | (1 << (FortranParser.RECURSIVE - 24)) | (1 << (FortranParser.ID - 24)))) !== 0))) {
            this._errHandler.recoverInline(this);
            }
            else {
            	this._errHandler.reportMatch(this);
                this.consume();
            }
            this.state = 115;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Function_declarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FortranParser.RULE_function_declaration;
    return this;
}

Function_declarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Function_declarationContext.prototype.constructor = Function_declarationContext;

Function_declarationContext.prototype.function_modifiers = function() {
    return this.getTypedRuleContext(Function_modifiersContext,0);
};

Function_declarationContext.prototype.FUNCTION = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(FortranParser.FUNCTION);
    } else {
        return this.getToken(FortranParser.FUNCTION, i);
    }
};


Function_declarationContext.prototype.ID = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(FortranParser.ID);
    } else {
        return this.getToken(FortranParser.ID, i);
    }
};


Function_declarationContext.prototype.LP = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(FortranParser.LP);
    } else {
        return this.getToken(FortranParser.LP, i);
    }
};


Function_declarationContext.prototype.RP = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(FortranParser.RP);
    } else {
        return this.getToken(FortranParser.RP, i);
    }
};


Function_declarationContext.prototype.spec_part = function() {
    return this.getTypedRuleContext(Spec_partContext,0);
};

Function_declarationContext.prototype.END = function() {
    return this.getToken(FortranParser.END, 0);
};

Function_declarationContext.prototype.arguments = function() {
    return this.getTypedRuleContext(ArgumentsContext,0);
};

Function_declarationContext.prototype.RESULT = function() {
    return this.getToken(FortranParser.RESULT, 0);
};




FortranParser.Function_declarationContext = Function_declarationContext;

FortranParser.prototype.function_declaration = function() {

    var localctx = new Function_declarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 22, FortranParser.RULE_function_declaration);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 116;
        this.function_modifiers();
        this.state = 117;
        this.match(FortranParser.FUNCTION);
        this.state = 118;
        this.match(FortranParser.ID);
        this.state = 119;
        this.match(FortranParser.LP);
        this.state = 121;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if(_la===FortranParser.ID) {
            this.state = 120;
            this.arguments();
        }

        this.state = 123;
        this.match(FortranParser.RP);
        this.state = 128;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,15,this._ctx);
        if(la_===1) {
            this.state = 124;
            this.match(FortranParser.RESULT);
            this.state = 125;
            this.match(FortranParser.LP);
            this.state = 126;
            this.match(FortranParser.ID);
            this.state = 127;
            this.match(FortranParser.RP);

        }
        this.state = 130;
        this.spec_part();
        this.state = 131;
        this.match(FortranParser.END);
        this.state = 132;
        this.match(FortranParser.FUNCTION);
        this.state = 133;
        this.match(FortranParser.ID);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function SubroutinesContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FortranParser.RULE_subroutines;
    return this;
}

SubroutinesContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
SubroutinesContext.prototype.constructor = SubroutinesContext;

SubroutinesContext.prototype.subroutine_declaration = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Subroutine_declarationContext);
    } else {
        return this.getTypedRuleContext(Subroutine_declarationContext,i);
    }
};




FortranParser.SubroutinesContext = SubroutinesContext;

FortranParser.prototype.subroutines = function() {

    var localctx = new SubroutinesContext(this, this._ctx, this.state);
    this.enterRule(localctx, 24, FortranParser.RULE_subroutines);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 138;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===FortranParser.SUBROUTINE) {
            this.state = 135;
            this.subroutine_declaration();
            this.state = 140;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function FunctionsContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FortranParser.RULE_functions;
    return this;
}

FunctionsContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
FunctionsContext.prototype.constructor = FunctionsContext;

FunctionsContext.prototype.function_declaration = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Function_declarationContext);
    } else {
        return this.getTypedRuleContext(Function_declarationContext,i);
    }
};




FortranParser.FunctionsContext = FunctionsContext;

FortranParser.prototype.functions = function() {

    var localctx = new FunctionsContext(this, this._ctx, this.state);
    this.enterRule(localctx, 26, FortranParser.RULE_functions);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 144;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(((((_la - 24)) & ~0x1f) == 0 && ((1 << (_la - 24)) & ((1 << (FortranParser.ELEMENTAL - 24)) | (1 << (FortranParser.FUNCTION - 24)) | (1 << (FortranParser.PURE - 24)) | (1 << (FortranParser.RECURSIVE - 24)) | (1 << (FortranParser.ID - 24)))) !== 0)) {
            this.state = 141;
            this.function_declaration();
            this.state = 146;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


exports.FortranParser = FortranParser;
