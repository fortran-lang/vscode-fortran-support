// src/extension.ts
import * as vscode from "vscode";

import FortranLintingProvider from "./features/linter-provider";
import FortranHoverProvider from "./features/hover-provider";
import { FortranCompletionProvider } from "./features/completion-provider";
import { FortranDocumentSymbolProvider } from "./features/document-symbol-provider";
import FortranDefinitionProvider from "./features/definition-provider";
import { TextDocument, DocumentHighlight } from "vscode";
import { parseDoc } from "./lib/TagParser";
const FORTRAN_MODE = "fortran90";
export function activate(ctx: vscode.ExtensionContext) {
  let hoverProvider = new FortranHoverProvider();
  let completionProvider = new FortranCompletionProvider();
  let symbolProvider = new FortranDocumentSymbolProvider();
  if (vscode.workspace.getConfiguration("fortran").get("linterEnabled", true)) {
    let linter = new FortranLintingProvider();
    linter.activate(ctx.subscriptions);
    vscode.languages.registerCodeActionsProvider("fortran90", linter);
  }

  vscode.languages.registerCompletionItemProvider(
    "fortran90",
    completionProvider
  );
  vscode.languages.registerHoverProvider("fortran90", hoverProvider);
  vscode.languages.registerDocumentSymbolProvider("fortran90", symbolProvider);

  ctx.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      FORTRAN_MODE,
      new FortranDefinitionProvider()
    )
  );
  ctx.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(tagsParserListener)
  );
  ctx.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(tagsParserListener)
  );
}
function tagsParserListener(textDocument: TextDocument) {
  if (textDocument.languageId === FORTRAN_MODE) {
    parseDoc(textDocument);
  }
}
