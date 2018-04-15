
import * as fs from 'fs';
import * as vscode from 'vscode';



export const LANGUAGE_ID = 'fortran90';


export const intrinsics = [
    "ABORT", "ABS", "ACCESS", "ACHAR", "ACOS", "ACOSH", "ADJUSTL", "ADJUSTR", "AIMAG", "AINT", "ALARM", "ALL", "ALLOCATED", "AND", "ANINT", "ANY", "ASIN", "ASINH", "ASSOCIATED", "ATAN", "ATAN2",
    "ATANH", "ATOMIC_ADD", "ATOMIC_AND", "ATOMIC_CAS", "ATOMIC_DEFINE", "ATOMIC_FETCH_ADD", "ATOMIC_FETCH_AND", "ATOMIC_FETCH_OR", "ATOMIC_FETCH_XOR", "ATOMIC_OR", "ATOMIC_REF", "ATOMIC_XOR", "BACKTRACE", "BESSEL_J0", "BESSEL_J1", "BESSEL_JN", "BESSEL_Y0", "BESSEL_Y1", "BESSEL_YN", "BGE", "BGT",
    "BIT_SIZE", "BLE", "BLT", "BTEST", "C_ASSOCIATED", "C_F_POINTER", "C_F_PROCPOINTER", "C_FUNLOC", "C_LOC", "C_SIZEOF", "CEILING", "CHAR", "CHDIR", "CHMOD", "CMPLX", "CO_BROADCAST", "CO_MAX", "CO_MIN", "CO_REDUCE", "CO_SUM", "COMMAND_ARGUMENT_COUNT",
    "COMPILER_OPTIONS", "COMPILER_VERSION", "COMPLEX", "CONJG", "COS", "COSH", "COUNT", "CPU_TIME", "CSHIFT", "CTIME", "DATE_AND_TIME", "DBLE", "DCMPLX", "DIGITS", "DIM", "DOT_PRODUCT", "DPROD", "DREAL", "DSHIFTL", "DSHIFTR", "DTIME",
    "EOSHIFT", "EPSILON", "ERF", "ERFC", "ERFC_SCALED", "ETIME", "EVENT_QUERY", "EXECUTE_COMMAND_LINE", "EXIT", "EXP", "EXPONENT", "EXTENDS_TYPE_OF", "FDATE", "FGET", "FGETC", "FLOOR", "FLUSH", "FNUM", "FPUT", "FPUTC", "FRACTION",
    "FREE", "FSEEK", "FSTAT", "FTELL", "GAMMA", "GERROR", "GETARG", "GET_COMMAND", "GET_COMMAND_ARGUMENT", "GETCWD", "GETENV", "GET_ENVIRONMENT_VARIABLE", "GETGID", "GETLOG", "GETPID", "GETUID", "GMTIME", "HOSTNM", "HUGE", "HYPOT", "IACHAR",
    "IALL", "IAND", "IANY", "IARGC", "IBCLR", "IBITS", "IBSET", "ICHAR", "IDATE", "IEOR", "IERRNO", "IMAGE_INDEX", "INDEX", "INT", "INT2", "INT8", "IOR", "IPARITY", "IRAND", "IS_IOSTAT_END", "IS_IOSTAT_EOR",
    "ISATTY", "ISHFT", "ISHFTC", "ISNAN", "ITIME", "KILL", "KIND", "LBOUND", "LCOBOUND", "LEADZ", "LEN", "LEN_TRIM", "LGE", "LGT", "LINK", "LLE", "LLT", "LNBLNK", "LOC", "LOG", "LOG10",
    "LOG_GAMMA", "LOGICAL", "LONG", "LSHIFT", "LSTAT", "LTIME", "MALLOC", "MASKL", "MASKR", "MATMUL", "MAX", "MAXEXPONENT", "MAXLOC", "MAXVAL", "MCLOCK", "MCLOCK8", "MERGE", "MERGE_BITS", "MIN", "MINEXPONENT", "MINLOC",
    "MINVAL", "MOD", "MODULO", "MOVE_ALLOC", "MVBITS", "NEAREST", "NEW_LINE", "NINT", "NORM2", "NOT", "NULL", "NUM_IMAGES", "OR", "PACK", "PARITY", "PERROR", "POPCNT", "POPPAR", "PRECISION", "PRESENT", "PRODUCT",
    "RADIX", "RAN", "RAND", "RANDOM_NUMBER", "RANDOM_SEED", "RANGE", "RANK", "REAL", "RENAME", "REPEAT", "RESHAPE", "RRSPACING", "RSHIFT", "SAME_TYPE_AS", "SCALE", "SCAN", "SECNDS", "SECOND", "SELECTED_CHAR_KIND", "SELECTED_INT_KIND", "SELECTED_REAL_KIND",
    "SET_EXPONENT", "SHAPE", "SHIFTA", "SHIFTL", "SHIFTR", "SIGN", "SIGNAL", "SIN", "SINH", "SIZE", "SIZEOF", "SLEEP", "SPACING", "SPREAD", "SQRT", "SRAND", "STAT", "STORAGE_SIZE", "SUM", "SYMLNK", "SYSTEM",
    "SYSTEM_CLOCK", "TAN", "TANH", "THIS_IMAGE", "TIME", "TIME8", "TINY", "TRAILZ", "TRANSFER", "TRANSPOSE", "TRIM", "TTYNAM", "UBOUND", "UCOBOUND", "UMASK", "UNLINK", "UNPACK", "VERIFY", "XOR"];


export const FORTRAN_KEYWORDS = ["FUNCTION", "MODULE", "SUBROUTINE", "CONTAINS", "USE", "KIND", "DO", "IF", "ELIF", "END", "IMPLICIT"];

export const isIntrinsic = (keyword) => {
    return intrinsics.findIndex(intrinsic => intrinsic === keyword.toUpperCase()) !== -1;
};


interface Doc {
    keyword: string;
    docstr: string;
};


export const loadDocString = (keyword) => {
    keyword = keyword.toUpperCase();
    let filepath = __dirname + "/../docs/" + keyword + ".json";
    let docstr = fs.readFileSync(filepath).toString();
    let doc: Doc = JSON.parse(docstr);
    return doc.docstr;

};

export const _loadDocString = (keyword: string) => {

    keyword = keyword.toUpperCase();

    let docStringBuffer = fs.readFileSync(__dirname + "/../../../src/docs/" + keyword + ".html");
    let docText = docStringBuffer.toString();
    const codeRegex = /<code>(.+?)<\/code>\n?/g;
    const varRegex = /<var>(.+?)<\/var>/g;
    const spanRegex = /<samp><span class="command">(\w+)<\/span><\/samp>/g;
    const tableRegex = /<table\s*.*>([\s\w<>\/\W]+?)<\/table>/g;
    const codeExampleRegex = /<code class="smallexample"[\s\W\w]*?>([\s\W\w<>]*?)<\/code>/g;
    const headerRegex = /^ *<h(\d)>(.+?)<\/h\1>\n?/gm;
    const defListRegex = /<dt>([\w\W]+?)<\/dt><dd>([\w\W]+?)(<br>)?<\/dd>/g;

    docText = docText.replace(varRegex, (match, code: string) => {
        return "`" + code + "`";
    }).replace(spanRegex, (match, code) => `*${code}*`)
        .replace(defListRegex, (match, entry, def) => `**${entry}** ${def}\n`)
        .replace(codeExampleRegex, (match, code) => "```\n" + code + "\n\n```\n")
        .replace(/<td\s*.*?>([\s\w<>\/\W]+?)<\/td>/g, (match, code) => " | " + code)
        .replace(/<tr\s*.*?>([\s\w<>\/\W]+?)<\/tr>/g, (match, code) => code + "\n")
        .replace(/<tbody\s*.*?>([\s\w<>\/\W]+?)<\/tbody>/g, (match, code) => code)
        .replace(tableRegex, (match, code) => code)
        .replace(codeRegex, (match, code: string) => {
            return "`" + code + "`";
        }).replace(/<p>\s*?/g, "\n")
        .replace(/<\/p>\s*?/g, "\n")
        .replace(headerRegex, (match, h: string, code: string) => {
            let headerLevel: number = parseInt(h);
            let header = '#'.repeat(headerLevel);
            return `${header} ${code}\n`;
        });
    docText = docText.replace(/^ *<br>\n?/gm, '\n').replace(/<\?dl>/g, "");
    console.log(docText);
    return docText;
};

export const getIncludeParams = (paths: string[]) => {
    if (paths.length === 0) {
        return "";
    }
    return "-I " + paths.join(" ");
};



export function isPositionInString(document: vscode.TextDocument, position: vscode.Position): boolean {
    let lineText = document.lineAt(position.line).text;
    let lineTillCurrentPosition = lineText.substr(0, position.character);

    // Count the number of double quotes in the line till current position. Ignore escaped double quotes
    let doubleQuotesCnt = (lineTillCurrentPosition.match(/\"/g) || []).length;
    let escapedDoubleQuotesCnt = (lineTillCurrentPosition.match(/\\\"/g) || []).length;

    doubleQuotesCnt -= escapedDoubleQuotesCnt;
    return doubleQuotesCnt % 2 === 1;
}


let saveKeywordToJson = (keyword) => {
    let doc = _loadDocString(keyword);
    let docObject = JSON.stringify({ "keyword": keyword, "docstr": doc });
    fs.appendFile("src/docs/" + keyword + ".json", docObject, function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
};

