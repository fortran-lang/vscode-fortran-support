'use strict';

import * as vscode from 'vscode';

interface LinterSeverityKeywords {
  errors: string[];
  warnings: string[];
  infos: string[];
  hints: string[];
}

abstract class Linter {
  constructor(
    /**
     * Linter name
     */
    public readonly name: string,
    /**
     * Regular expression to match compiler messages
     */
    public readonly regex: RegExp,
    /**
     * Keywords used to identify message severity
     */
    public readonly severity: LinterSeverityKeywords,
    /**
     * Mandatory linter arguments. These are always present
     */
    public readonly args: string[],
    /**
     * Command line arguments to pass to the linter, these get overwritten in
     * case the user has set arguments in the settings
     */
    public readonly argsDefault?: string[],
    /**
     * Compiler flag used to change the directory output for modules
     */
    public readonly modFlag?: string,
    /**
     * Compiler flag used to force free-form compilation
     */
    public readonly freeFlag?: string,
    /**
     * Compiler flag used to force fixed-form compilation
     */
    public readonly fixedFlag?: string
  ) {}

  public getSeverityLevel(msg_type: string): vscode.DiagnosticSeverity {
    if (this.severity.errors.includes(msg_type)) return vscode.DiagnosticSeverity.Error;
    if (this.severity.warnings.includes(msg_type)) return vscode.DiagnosticSeverity.Warning;
    if (this.severity.infos.includes(msg_type)) return vscode.DiagnosticSeverity.Information;
    if (this.severity.hints.includes(msg_type)) return vscode.DiagnosticSeverity.Hint;
    return vscode.DiagnosticSeverity.Error;
  }

  public abstract parse(msg: string): vscode.Diagnostic[];
}

export class GNULinter extends Linter {
  constructor() {
    super(
      'gfortran',
      /(?:^(?<fname>(?:\w:\\)?.*):(?<ln>\d+):(?<cn>\d+)[:.](?:\s+.*\s+.*?\s+)(?<sev1>Error|Warning|Fatal Error):\s(?<msg1>.*)$)|(?:^(?<bin>\w+):\s*(?<sev2>\w+\s*\w*):\s*(?<msg2>.*)$)/gm,
      {
        errors: ['error', 'fatal error'],
        warnings: ['warning'],
        infos: ['info'],
        hints: ['hint'],
      },
      ['-fsyntax-only', '-cpp'],
      ['-Wall'],
      '-J',
      '-ffree-form',
      '-ffixed-form'
    );
  }
  /**
   * ---------------------------------------------------------------------------
   * COMPILER MESSAGE ANATOMY:
   * filename:line:column:
   *
   *   line |  failing line of code
   *       |
   * severity: message
   * ---------------------------------------------------------------------------
   * ALTERNATIVE COMPILER MESSAGE ANATOMY: (for includes, failed args and C++)
   * compiler-bin: severity: message
   * ---------------------------------------------------------------------------
   * see https://regex101.com/r/hZtk3f/1
   * @param msg linter output
   * @returns array of vscode.Diagnostic
   */
  public parse(msg: string): vscode.Diagnostic[] {
    const matches = [...msg.matchAll(this.regex)];
    const diagnostics: vscode.Diagnostic[] = [];
    for (const m of matches) {
      const g = m.groups;
      // m[0] is the entire match and then the captured groups follow
      const fname: string = g['fname'] !== undefined ? g['fname'] : g['bin'];
      const lineNo: number = g['ln'] !== undefined ? parseInt(g['ln']) : 1;
      const colNo: number = g['cn'] !== undefined ? parseInt(g['cn']) : 1;
      const msg_type: string = g['sev1'] !== undefined ? g['sev1'] : g['sev2'];
      const msg: string = g['msg1'] !== undefined ? g['msg1'] : g['msg2'];
      const range = new vscode.Range(
        new vscode.Position(lineNo - 1, colNo),
        new vscode.Position(lineNo - 1, colNo)
      );
      const severity = this.getSeverityLevel(msg_type.toLowerCase());
      diagnostics.push(new vscode.Diagnostic(range, msg, severity));
    }
    return diagnostics;
  }
}

export class GNUModernLinter extends Linter {
  constructor() {
    super(
      'gfortran',
      /(?<fname>(?:\w:\\)?.*):(?<ln>\d+):(?<cn>\d+): (?<sev>Error|Warning|Fatal Error): (?<msg>.*)/g,
      {
        errors: ['error', 'fatal error'],
        warnings: ['warning'],
        infos: ['info'],
        hints: ['hint'],
      },
      ['-fsyntax-only', '-cpp', '-fdiagnostics-plain-output'],
      ['-Wall'],
      '-J',
      '-ffree-form',
      '-ffixed-form'
    );
  }

  /**
   * ---------------------------------------------------------------------------
   *  COMPILER: MESSAGE ANATOMY:
   *  file:line:column: Severity: msg
   * ---------------------------------------------------------------------------
   * see https://regex101.com/r/73TZQn/1
   * @param msg linter output
   * @returns array of vscode.Diagnostic
   */
  public parse(msg: string): vscode.Diagnostic[] {
    const matches = [...msg.matchAll(this.regex)];
    const diagnostics: vscode.Diagnostic[] = [];
    for (const m of matches) {
      const g = m.groups;
      // m[0] is the entire match and then the captured groups follow
      const lineNo: number = parseInt(g['ln']);
      const colNo: number = parseInt(g['cn']);
      const msg_type: string = g['sev'];
      const msg: string = g['msg'];
      const range = new vscode.Range(
        new vscode.Position(lineNo - 1, colNo),
        new vscode.Position(lineNo - 1, colNo)
      );
      const severity = this.getSeverityLevel(msg_type.toLowerCase());
      diagnostics.push(new vscode.Diagnostic(range, msg, severity));
    }
    return diagnostics;
  }
}

export class IntelLinter extends Linter {
  constructor() {
    super(
      'ifort',
      /^(?<fname>(?:\w:\\)?.*)\((?<ln>\d+)\):\s*(?:#(?:(?<sev2>\w*):\s*(?<msg2>.*$))|(?<sev1>\w*)\s*(?<msg1>.*$)(?:\s*.*\s*)(?<cn>-*\^))/gm,
      {
        errors: ['error', 'fatal error'],
        warnings: ['warning', 'remark'],
        infos: ['info', 'note'],
        hints: ['hint'],
      },
      ['-syntax-only', '-fpp'],
      ['-warn', 'all'],
      '-module',
      '-free',
      '-fixed'
    );
  }
  /**
   * see https://regex101.com/r/GZ0Lzz/2
   * @param msg linter output
   * @returns array of vscode.Diagnostic
   */
  public parse(msg: string): vscode.Diagnostic[] {
    const matches = [...msg.matchAll(this.regex)];
    const diagnostics: vscode.Diagnostic[] = [];
    for (const m of matches) {
      const g = m.groups;
      // m[0] is the entire match and then the captured groups follow
      const fname: string = g['fname'];
      const lineNo: number = parseInt(g['ln']);
      const msg_type: string = g['sev1'] !== undefined ? g['sev1'] : g['sev2'];
      const msg: string = g['msg1'] !== undefined ? g['msg1'] : g['msg2'];
      const colNo: number = g['cn'] !== undefined ? g['cn'].length : 1;
      const range = new vscode.Range(
        new vscode.Position(lineNo - 1, colNo),
        new vscode.Position(lineNo - 1, colNo)
      );
      const severity = this.getSeverityLevel(msg_type.toLowerCase());
      diagnostics.push(new vscode.Diagnostic(range, msg, severity));
    }
    return diagnostics;
  }
}

export class NAGLinter extends Linter {
  constructor() {
    super(
      'nagfor',
      /^(?<sev1>Remark|Info|Note|Warning|Questionable|Extension|Obsolescent|Deleted feature used|(?:[\w]+ )?Error|Fatal|Panic)(\(\w+\))?: (?<fname>[\S ]+), line (?<ln>\d+): (?<msg1>.+)$/gm,
      {
        errors: ['panic', 'fatal', 'error'],
        warnings: ['extension', 'questionable', 'deleted feature used', 'warning'],
        infos: ['remark', 'note', 'info'],
        hints: [],
      },
      ['-M', '-quiet'],
      [],
      '-mdir',
      '-free',
      '-fixed'
    );
  }

  /**
   * See Section 7 of the NAGFOR manual, although it is not accurate with regards
   * to all the possible messages.
   * severity: filename, line No.: message
   * @param msg linter results
   * @returns array of vscode.Diagnostic
   */
  public parse(msg: string): vscode.Diagnostic[] {
    const matches = [...msg.matchAll(this.regex)];
    const diagnostics: vscode.Diagnostic[] = [];
    for (const m of matches) {
      const g = m.groups;
      const fname: string = g['fname'];
      const lineNo: number = parseInt(g['ln']);
      const msg_type: string = g['sev1'];
      const msg: string = g['msg1'];
      // NAGFOR does not have a column number, so get the entire line
      const range = vscode.window.activeTextEditor.document.lineAt(lineNo - 1).range;
      const severity = this.getSeverityLevel(msg_type.toLowerCase());
      diagnostics.push(new vscode.Diagnostic(range, msg, severity));
    }
    return diagnostics;
  }
}

export class LFortranLinter extends Linter {
  constructor() {
    super(
      'lfortran',
      /(?<fname>(?:\w:\\)?.*):(?<ls>\d+)-(?<le>\d+):(?<cs>\d+)-(?<ce>\d+): (?<sev>.+): (?<msg>.+)/g,
      {
        errors: [
          'C preprocessor error',
          'prescanner error',
          'tokenizer error',
          'syntax error',
          'semantic error',
          'ASR pass error',
          'code generation error',
        ],
        warnings: ['warning'],
        infos: ['note'],
        hints: ['help', 'style suggestion'],
      },
      ['--error-format=short'],
      [],
      '-J',
      '',
      '--fixed-form'
    );
  }

  /**
   * <filename>:<line start>-<end>:<column start>-<end>: <severity>: <message>
   * @param msg linter results
   * @returns array of vscode.Diagnostic
   */
  public parse(msg: string): vscode.Diagnostic[] {
    const matches = [...msg.matchAll(this.regex)];
    const diagnostics: vscode.Diagnostic[] = [];
    for (const m of matches) {
      const g = m.groups;
      const [_, name, ls, le, cs, ce, msg_type, msg] = m;
      const range = new vscode.Range(
        new vscode.Position(parseInt(ls) - 1, parseInt(cs) - 1),
        new vscode.Position(parseInt(le) - 1, parseInt(ce))
      );
      const severity = this.getSeverityLevel(msg_type.toLowerCase());
      diagnostics.push(new vscode.Diagnostic(range, msg, severity));
    }
    return diagnostics;
  }
}
