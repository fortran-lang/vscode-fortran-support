import { strictEqual } from 'assert';
import { FortranFormattingProvider } from '../src/features/formatting-provider';
import * as vscode from 'vscode';
import * as path from 'path';
import { Logger } from '../src/services/logging-service';
import { spawnSync } from 'child_process';

suite('Formatting tests', () => {
  let doc: vscode.TextDocument;
  const fmt = new FortranFormattingProvider(new Logger());
  const fileUri = vscode.Uri.file(
    path.resolve(__dirname, '../../test/fortran/format/formatting_test.f90')
  );

  suiteSetup(async function (): Promise<void> {
    spawnSync('pip', ['install', '--user', '--upgrade', 'findent']);
    spawnSync('pip', ['install', '--user', '--upgrade', 'fprettify']);
    doc = await vscode.workspace.openTextDocument(fileUri);
    await vscode.window.showTextDocument(doc);
    console.log('Open file: ' + fileUri.toString());
  });

  test('Using findent', async () => {
    const fmt = new FortranFormattingProvider(new Logger());
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
          '../../test/fortran/format/formatting_test_fprettify_long_lines.f90'
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
