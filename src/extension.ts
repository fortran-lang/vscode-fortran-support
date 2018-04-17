// src/extension.ts
import * as vscode from "vscode";

import FortranLintingProvider from "./features/linter-provider";
import FortranHoverProvider from "./features/hover-provider";
import { FortranCompletionProvider } from "./features/completion-provider";
import { FortranDocumentSymbolProvider } from "./features/document-symbol-provider";

const FORTRAN_FREE_FORM_ID = "fortran_free-form";

export function activate(context: vscode.ExtensionContext) {
  let hoverProvider = new FortranHoverProvider();
  let completionProvider = new FortranCompletionProvider();
  let symbolProvider = new FortranDocumentSymbolProvider();

  if (vscode.workspace.getConfiguration("fortran").get("linterEnabled", true)) {
    let linter = new FortranLintingProvider();
    linter.activate(context.subscriptions);
    vscode.languages.registerCodeActionsProvider(FORTRAN_FREE_FORM_ID, linter);
  }

  vscode.languages.registerCompletionItemProvider(
    FORTRAN_FREE_FORM_ID,
    completionProvider
  );
  vscode.languages.registerHoverProvider(FORTRAN_FREE_FORM_ID, hoverProvider);
  vscode.languages.registerDocumentSymbolProvider(
    FORTRAN_FREE_FORM_ID,
    symbolProvider
  );
}
