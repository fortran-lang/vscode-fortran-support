import * as vscode from "vscode";
import { getLocationsForTag } from "../lib/TagParser";

class FortranDefinitionProvider implements vscode.DefinitionProvider {
  public provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Thenable<vscode.Location[]> {
    if (token.isCancellationRequested) return;

    const range = document.getWordRangeAtPosition(position);
    if (!range) {
      console.log(
        "fortran-linter: Cannot provide definition without a valid tag (word range)"
      );
      return Promise.reject("invalid range");
    }
    const tagName = document.getText(range);
    if (!tagName) {
      console.log("fortran-linter: Not tag in range");
    }
    const locationsForTag = getLocationsForTag(tagName);
    return Promise.resolve(locationsForTag);
  }
}

export default FortranDefinitionProvider;
