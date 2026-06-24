import * as vscode from 'vscode';

import { Logger } from '../services/logging';
import { EXTENSION_ID, isFortran } from '../util/tools';

interface PreprocessorBlockState {
  parentActive: boolean;
  hasTakenBranch: boolean;
  currentActive: boolean;
}

const INACTIVE_PREPROCESSOR_REGEX = /^\s*#[:]?\s*(if|ifdef|ifndef|elif|else|endif)\b(?:\s+(.*))?$/i;

/**
 * Evaluates the limited preprocessor conditions supported by inactive-region dimming.
 *
 * Supported forms are a bare macro identifier (`FOO`), `defined(FOO)`, and
 * integer literals where `0` is false and any non-zero value is true. Any other
 * expression shape is treated as unsupported and therefore false.
 *
 * @param conditionText Raw text following a `#if` or `#elif` directive.
 * @param definedMacros Set of macro names currently considered defined.
 * @returns `true` when the condition is supported and matches a defined macro.
 */
export function evaluatePreprocessorCondition(
  conditionText: string | undefined,
  definedMacros: ReadonlySet<string>
): boolean {
  if (!conditionText) {
    return false;
  }

  const trimmedCondition = conditionText.trim();
  const integerLiteral = trimmedCondition.match(/^[+-]?\d+$/);
  if (integerLiteral) {
    return Number.parseInt(trimmedCondition, 10) !== 0;
  }

  const definedMatch = trimmedCondition.match(/^defined\s*\(\s*([A-Za-z_]\w*)\s*\)$/i);
  if (definedMatch) {
    return definedMacros.has(definedMatch[1]);
  }

  const bareMacroMatch = trimmedCondition.match(/^([A-Za-z_]\w*)$/);
  if (bareMacroMatch) {
    return definedMacros.has(bareMacroMatch[1]);
  }

  return false;
}

/**
 * Converts configured preprocessor definitions into the macro-name set used by
 * the inactive-region evaluator.
 *
 * Values are intentionally ignored; for this feature a macro is either defined
 * or not defined.
 *
 * @param definitions `fortls.preprocessor.definitions` from workspace settings.
 * @returns Set of defined macro names.
 */
export function collectDefinedPreprocessorMacros(
  definitions: Record<string, string> | undefined
): Set<string> {
  if (!definitions) {
    return new Set<string>();
  }

  return new Set(Object.keys(definitions));
}

/**
 * Scans a Fortran document for preprocessor blocks and returns the code ranges
 * that belong to inactive branches.
 *
 * Directive lines themselves are excluded from the returned ranges so only the
 * inactive Fortran code is dimmed in the editor.
 *
 * @param document The document to inspect.
 * @param definedMacros Set of macro names currently considered defined.
 * @returns Editor ranges that should be rendered as inactive.
 */
export function computeInactivePreprocessorRanges(
  document: vscode.TextDocument,
  definedMacros: ReadonlySet<string>
): vscode.Range[] {
  const ranges: vscode.Range[] = [];
  const stack: PreprocessorBlockState[] = [];
  let inactiveStartLine: number | undefined;
  let currentActive = true;

  const closeInactiveRange = (endLine: number) => {
    if (inactiveStartLine === undefined || endLine < inactiveStartLine) {
      inactiveStartLine = undefined;
      return;
    }

    const endCharacter = document.lineAt(endLine).range.end.character;
    ranges.push(new vscode.Range(inactiveStartLine, 0, endLine, endCharacter));
    inactiveStartLine = undefined;
  };

  const updateCurrentActive = () => {
    currentActive = stack.length > 0 ? stack[stack.length - 1].currentActive : true;
  };

  for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
    const line = document.lineAt(lineNumber).text;
    const directiveMatch = line.match(INACTIVE_PREPROCESSOR_REGEX);

    if (directiveMatch) {
      closeInactiveRange(lineNumber - 1);

      const directive = directiveMatch[1].toLowerCase();
      const directiveArgument = directiveMatch[2];

      if (directive === 'if' || directive === 'ifdef' || directive === 'ifndef') {
        const parentActive = currentActive;
        let branchCondition = false;

        if (directive === 'if') {
          branchCondition = evaluatePreprocessorCondition(directiveArgument, definedMacros);
        } else {
          const macroNameMatch = directiveArgument?.match(/^\s*([A-Za-z_]\w*)\s*$/);
          const macroName = macroNameMatch?.[1];
          const isDefined = macroName ? definedMacros.has(macroName) : false;
          branchCondition = directive === 'ifdef' ? isDefined : !isDefined;
        }

        stack.push({
          parentActive,
          hasTakenBranch: branchCondition,
          currentActive: parentActive && branchCondition,
        });
        updateCurrentActive();
        continue;
      }

      if (directive === 'elif') {
        const currentBlock = stack[stack.length - 1];
        if (currentBlock) {
          const branchCondition =
            !currentBlock.hasTakenBranch &&
            evaluatePreprocessorCondition(directiveArgument, definedMacros);
          currentBlock.currentActive = currentBlock.parentActive && branchCondition;
          currentBlock.hasTakenBranch = currentBlock.hasTakenBranch || branchCondition;
          updateCurrentActive();
        }
        continue;
      }

      if (directive === 'else') {
        const currentBlock = stack[stack.length - 1];
        if (currentBlock) {
          currentBlock.currentActive = currentBlock.parentActive && !currentBlock.hasTakenBranch;
          currentBlock.hasTakenBranch = true;
          updateCurrentActive();
        }
        continue;
      }

      if (directive === 'endif') {
        if (stack.length > 0) {
          stack.pop();
          updateCurrentActive();
        }
      }

      continue;
    }

    if (!currentActive && inactiveStartLine === undefined) {
      inactiveStartLine = lineNumber;
      continue;
    }

    if (currentActive) {
      closeInactiveRange(lineNumber - 1);
    }
  }

  closeInactiveRange(document.lineCount - 1);
  return ranges;
}

/**
 * Keeps inactive preprocessor regions dimmed in visible Fortran editors by
 * recomputing decorations when documents, editors, or relevant settings change.
 */
export class InactivePreprocessorProvider implements vscode.Disposable {
  private readonly decorationType = vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    opacity: '0.4',
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
  });

  private readonly disposables: vscode.Disposable[] = [];

  /**
   * @param logger Extension logger used for debug tracing during refreshes.
   */
  constructor(private readonly logger: Logger) {}

  /**
   * Registers editor/document/configuration listeners and performs the initial
   * refresh for all visible editors.
   *
   * @returns The provider instance so it can be tracked by the extension lifecycle.
   */
  public activate(): vscode.Disposable[] {
    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
          this.refreshEditor(editor);
        }
      }),
      vscode.window.onDidChangeVisibleTextEditors(editors => {
        editors.forEach(editor => this.refreshEditor(editor));
      }),
      vscode.workspace.onDidOpenTextDocument(document => {
        this.refreshVisibleEditors(document);
      }),
      vscode.workspace.onDidChangeTextDocument(event => {
        this.refreshVisibleEditors(event.document);
      }),
      vscode.workspace.onDidCloseTextDocument(document => {
        this.refreshVisibleEditors(document);
      }),
      vscode.workspace.onDidChangeConfiguration(event => {
        if (
          event.affectsConfiguration(`${EXTENSION_ID}.preprocessor.dimInactiveRegions`) ||
          event.affectsConfiguration(`${EXTENSION_ID}.fortls.preprocessor.definitions`)
        ) {
          this.refreshAllVisibleEditors();
        }
      })
    );

    this.refreshAllVisibleEditors();
    return [this];
  }

  /**
   * Releases the decoration type and all event subscriptions owned by the provider.
   */
  public dispose() {
    this.decorationType.dispose();
    this.disposables.forEach(disposable => disposable.dispose());
  }

  private refreshAllVisibleEditors() {
    vscode.window.visibleTextEditors.forEach(editor => this.refreshEditor(editor));
  }

  private refreshVisibleEditors(document: vscode.TextDocument) {
    vscode.window.visibleTextEditors
      .filter(editor => editor.document.uri.toString() === document.uri.toString())
      .forEach(editor => this.refreshEditor(editor));
  }

  /**
   * Recomputes inactive ranges for a single editor and updates its decorations.
   *
   * @param editor The editor to refresh.
   */
  private refreshEditor(editor: vscode.TextEditor) {
    if (!isFortran(editor.document) || !this.isEnabled()) {
      editor.setDecorations(this.decorationType, []);
      return;
    }

    const macroDefinitions =
      vscode.workspace
        .getConfiguration(`${EXTENSION_ID}.fortls.preprocessor`)
        .get<Record<string, string>>('definitions') ?? {};
    const definedMacros = collectDefinedPreprocessorMacros(macroDefinitions);
    const ranges = computeInactivePreprocessorRanges(editor.document, definedMacros);

    this.logger.debug('[inactive-preprocessor] Refreshing inactive preprocessor regions', {
      uri: editor.document.uri.toString(),
      ranges: ranges.length,
    });
    editor.setDecorations(this.decorationType, ranges);
  }

  private isEnabled(): boolean {
    return vscode.workspace
      .getConfiguration(EXTENSION_ID)
      .get<boolean>('preprocessor.dimInactiveRegions', true);
  }
}
