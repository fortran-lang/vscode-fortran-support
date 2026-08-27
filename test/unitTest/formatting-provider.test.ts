import { strictEqual } from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import * as vscode from 'vscode';

import { FortranFormattingProvider } from '../../src/format/provider';
import { Logger, LogLevel } from '../../src/services/logging';

const logger = new Logger(
  vscode.window.createOutputChannel('Modern Fortran', 'log'),
  LogLevel.DEBUG
);

function normalizeEOL(s: string): string {
  return s.replace(/\r\n/g, '\n');
}

declare const __dirname: string;

suite('Formatting tests', () => {
  let doc: vscode.TextDocument;
  const fmt = new FortranFormattingProvider(logger);
  const fileUri = vscode.Uri.file(
    path.resolve(__dirname, '../../../test/fortran/format/formatting_test.f90')
  );
  const forformatFileUri = vscode.Uri.file(
    path.resolve(__dirname, '../../../test/fortran/format/forformat/formatting_test.f90')
  );

  suiteSetup(async function (): Promise<void> {
    doc = await vscode.workspace.openTextDocument(fileUri);
    await vscode.window.showTextDocument(doc);
  });

  test('Using findent', async () => {
    const fmt = new FortranFormattingProvider(logger);
    fmt['formatter'] = 'findent';
    const edits = await fmt['doFormatFindent'](doc);
    const ref = `program main
   implicit none
   integer :: i, j
   do i = 1, 5
      do j = 1, 5
         if (i == j) then
            print *, i
         end if
      end do
   end do
end program main
`;
    strictEqual(normalizeEOL(edits[0].newText.toString()), ref);
  });

  test('Using fprettify', async () => {
    fmt['formatter'] = 'fprettify';
    const edits = await fmt['doFormatFprettify'](doc);
    const ref = `program main
   implicit none
   integer :: i, j
   do i = 1, 5
   do j = 1, 5
   if (i == j) then
      print *, i
   end if
   end do
   end do
end program main
`;
    strictEqual(normalizeEOL(edits[0].newText.toString()), ref);
  });

  test('Using forformat with project configuration', async () => {
    const forformatDoc = await vscode.workspace.openTextDocument(forformatFileUri);
    fmt['formatter'] = 'forformat';
    const edits = await fmt['doFormatForformat'](forformatDoc);
    const ref = `PROGRAM main
  IMPLICIT NONE
  INTEGER :: i
  IF (i == 1) THEN
    PRINT *, i
  END IF
END PROGRAM main
`;
    strictEqual(normalizeEOL(edits[0].newText.toString()), ref);
  });

  test('Using forformat outside a Git checkout', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'modern-fortran-forformat-'));
    try {
      fs.writeFileSync(
        path.join(tempDir, '.forformat.toml'),
        'indent = 2\nkeyword_case = "upper"\n'
      );
      const sourcePath = path.join(tempDir, 'standalone.f90');
      fs.writeFileSync(
        sourcePath,
        `program main
implicit none
integer :: i
if (i == 1) then
print *, i
end if
end program main
`
      );

      const standaloneDoc = await vscode.workspace.openTextDocument(vscode.Uri.file(sourcePath));
      fmt['formatter'] = 'forformat';
      const edits = await fmt['doFormatForformat'](standaloneDoc);
      const ref = `PROGRAM main
  IMPLICIT NONE
  INTEGER :: i
  IF (i == 1) THEN
    PRINT *, i
  END IF
END PROGRAM main
`;
      strictEqual(normalizeEOL(edits[0].newText.toString()), ref);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test(`Using fprettify with stderr`, async () => {
    doc = await vscode.workspace.openTextDocument(
      vscode.Uri.file(
        path.resolve(
          __dirname,
          '../../../test/fortran/format/formatting_test_fprettify_long_lines.f90'
        )
      )
    );
    fmt['formatter'] = 'fprettify';
    const edits = await fmt['doFormatFprettify'](doc);
    const ref = `program demo

    write(*, "('Just a very long line. Just a very long line. Just a very long line. Just a very long line. Just a very long line. Just a very long line. ',i0)") 100

end program
`;
    strictEqual(normalizeEOL(edits[0].newText.toString()), ref);
  });
});
