import { strictEqual } from 'assert';
import * as path from 'path';

import * as vscode from 'vscode';

import { FortranFormattingProvider } from '../../src/format/provider';
import { Logger, LogLevel } from '../../src/services/logging';

const logger = new Logger(
  vscode.window.createOutputChannel('Modern Fortran', 'log'),
  LogLevel.DEBUG
);

suite('Formatting tests', () => {
  let doc: vscode.TextDocument;
  const fmt = new FortranFormattingProvider(logger);
  const fileUri = vscode.Uri.file(
    path.resolve(__dirname, '../../../test/fortran/format/formatting_test.f90')
  );

  suiteSetup(async function (): Promise<void> {
    doc = await vscode.workspace.openTextDocument(fileUri);
    await vscode.window.showTextDocument(doc);
  });

  test('Using findent', async () => {
    const fmt = new FortranFormattingProvider(logger);
    fmt['formatter'] = 'findent';
    const edits = await fmt['doFormatFindent'](doc);
    strictEqual(
      edits[0].newText.toString(),
      `program main
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
`
    );
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
    strictEqual(edits[0].newText.toString(), ref);
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
    const edits = await fmt['doFormatFprettify'](doc);
    const ref = `program demo

    write(*, "('Just a very long line. Just a very long line. Just a very long line. Just a very long line. Just a very long line. Just a very long line. ',i0)") 100

end program
`;
    strictEqual(edits[0].newText.toString(), ref);
  });
});
