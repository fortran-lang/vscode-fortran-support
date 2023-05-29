import { strictEqual, deepStrictEqual } from 'assert';
import * as path from 'path';

import { Diagnostic, DiagnosticSeverity, Range, Position, window, workspace, Uri } from 'vscode';

import {
  GNULinter,
  GNUModernLinter,
  IntelLinter,
  NAGLinter,
  LFortranLinter,
} from '../../src/lint/compilers';

// -----------------------------------------------------------------------------

suite('GNU (gfortran) lint single', () => {
  const linter = new GNULinter();
  const msg = `
C:\\Some\\random\\path\\sample.f90:4:18:

4 |   call say_hello()
  |                  1
Error: Missing actual argument for argument ‘a’ at (1)
`;
  suite('REGEX matches', () => {
    const matches = [...msg.matchAll(linter.regex)];
    const g = matches[0].groups;
    test('REGEX: filename', () => {
      strictEqual(g?.['fname'], 'C:\\Some\\random\\path\\sample.f90');
    });
    test('REGEX: line number', () => {
      strictEqual(g?.['ln'], '4');
    });
    test('REGEX: column number', () => {
      strictEqual(g?.['cn'], '18');
    });
    test('REGEX: severity <sev1>', () => {
      strictEqual(g?.['sev1'], 'Error');
    });
    test('REGEX: message <msg1>', () => {
      strictEqual(g?.['msg1'], 'Missing actual argument for argument ‘a’ at (1)');
    });
  });
  test('Diagnostics Array', () => {
    console.log(linter.parse(msg));
    const diags = linter.parse(msg);
    const ref = [
      new Diagnostic(
        new Range(new Position(3, 18), new Position(3, 18)),
        'Missing actual argument for argument ‘a’ at (1)',
        DiagnosticSeverity.Error
      ),
    ];
    deepStrictEqual(diags, ref);
  });
});
suite('GNU (gfortran) lint multiple', () => {
  const linter = new GNULinter();
  const msg = `
/fetch/main/FETCH.F90:1629:24:

1629 |          surf_glnodes = ele_nodes(fluid_surface_mesh, fele)
     |                        1
Warning: POINTER-valued function appears on right-hand side of assignment at (1) [-Wsurprising]
/fetch/main/FETCH.F90:1634:44:

1634 |       call scale(fluid_flux, scaling_factor)
     |                                            1
Error: There is no specific subroutine for the generic ‘scale’ at (1)
f951: some warnings being treated as errors
`;
  suite('REGEX matches', () => {
    const matches = [...msg.matchAll(linter.regex)];
    const g1 = matches[0].groups;
    test('REGEX: match 1 - filename', () => {
      strictEqual(g1?.['fname'], '/fetch/main/FETCH.F90');
    });
    test('REGEX: match 1 - line number', () => {
      strictEqual(g1?.['ln'], '1629');
    });
    test('REGEX: match 1 - column number', () => {
      strictEqual(g1?.['cn'], '24');
    });
    test('REGEX: match 1 - severity <sev1>', () => {
      strictEqual(g1?.['sev1'], 'Warning');
    });
    test('REGEX: match 1 - message <msg1>', () => {
      strictEqual(
        g1?.['msg1'],
        'POINTER-valued function appears on right-hand side of assignment at (1) [-Wsurprising]'
      );
    });
    const g2 = matches[1].groups;
    test('REGEX: match 2 - filename', () => {
      strictEqual(g2?.['fname'], '/fetch/main/FETCH.F90');
    });
    test('REGEX: match 2 - line number', () => {
      strictEqual(g2?.['ln'], '1634');
    });
    test('REGEX: match 2 - column number', () => {
      strictEqual(g2?.['cn'], '44');
    });
    test('REGEX: match 2 - severity <sev1>', () => {
      strictEqual(g2?.['sev1'], 'Error');
    });
    test('REGEX: match 2 - message <msg1>', () => {
      strictEqual(g2?.['msg1'], 'There is no specific subroutine for the generic ‘scale’ at (1)');
    });
  });
  test('Diagnostics Array', () => {
    const diags = linter.parse(msg);
    const ref = [
      new Diagnostic(
        new Range(new Position(1628, 24), new Position(1628, 24)),
        'POINTER-valued function appears on right-hand side of assignment at (1) [-Wsurprising]',
        DiagnosticSeverity.Warning
      ),
      new Diagnostic(
        new Range(new Position(1633, 44), new Position(1633, 44)),
        'There is no specific subroutine for the generic ‘scale’ at (1)',
        DiagnosticSeverity.Error
      ),
    ];
    deepStrictEqual(diags, ref);
  });
});
suite('GNU (gfortran) lint preprocessor', () => {
  const linter = new GNULinter();
  const msg = `
gfortran: fatal error: cannot execute '/usr/lib/gcc/x86_64-linux-gnu/9/f951': execv: Argument list too long\ncompilation terminated.
`;
  suite('REGEX matches', () => {
    const matches = [...msg.matchAll(linter.regex)];
    const g = matches[0].groups;
    test('REGEX: binary name <bin>', () => {
      strictEqual(g?.['bin'], 'gfortran');
    });
    test('REGEX: line number', () => {
      strictEqual(g?.['ln'], undefined);
    });
    test('REGEX: column number', () => {
      strictEqual(g?.['cn'], undefined);
    });
    test('REGEX: severity <sev2>', () => {
      strictEqual(g?.['sev2'], 'fatal error');
    });
    test('REGEX: message <msg2>', () => {
      strictEqual(
        g?.['msg2'],
        "cannot execute '/usr/lib/gcc/x86_64-linux-gnu/9/f951': execv: Argument list too long"
      );
    });
  });
  test('Diagnostics Array', () => {
    const diags = linter.parse(msg);
    const ref = [
      new Diagnostic(
        new Range(new Position(0, 1), new Position(0, 1)),
        "cannot execute '/usr/lib/gcc/x86_64-linux-gnu/9/f951': execv: Argument list too long",
        DiagnosticSeverity.Error
      ),
    ];
    deepStrictEqual(diags, ref);
  });
});
suite('GNU (gfortran) lint preprocessor multiple', () => {
  const linter = new GNULinter();
  const msg = `
f951: Warning: Nonexistent include directory '/Code/TypeScript/vscode-fortran-support/test/fortran/include' [-Wmissing-include-dirs]
/Code/TypeScript/vscode-fortran-support/test/fortran/sample.f90:4:18:

    4 |   call say_hello()
      |                  1
Error: Missing actual argument for argument 'a' at (1)
`;
  suite('REGEX matches', () => {
    const matches = [...msg.matchAll(linter.regex)];
    const g1 = matches[0].groups;
    test('REGEX: match 1 - binary <bin>', () => {
      strictEqual(g1?.['bin'], 'f951');
    });
    test('REGEX: match 1 - line number', () => {
      strictEqual(g1?.['ln'], undefined);
    });
    test('REGEX: match 1 - column number', () => {
      strictEqual(g1?.['cn'], undefined);
    });
    test('REGEX: match 1 - severity <sev2>', () => {
      strictEqual(g1?.['sev2'], 'Warning');
    });
    test('REGEX: match 1 - message <msg2>', () => {
      strictEqual(
        g1?.['msg2'],
        "Nonexistent include directory '/Code/TypeScript/vscode-fortran-support/test/fortran/include' [-Wmissing-include-dirs]"
      );
    });
    const g2 = matches[1].groups;
    test('REGEX: match 2 - filename', () => {
      strictEqual(g2?.['fname'], '/Code/TypeScript/vscode-fortran-support/test/fortran/sample.f90');
    });
    test('REGEX: match 2 - line number', () => {
      strictEqual(g2?.['ln'], '4');
    });
    test('REGEX: match 2 - column number', () => {
      strictEqual(g2?.['cn'], '18');
    });
    test('REGEX: match 2 - severity <sev1>', () => {
      strictEqual(g2?.['sev1'], 'Error');
    });
    test('REGEX: match 2 - message <msg1>', () => {
      strictEqual(g2?.['msg1'], "Missing actual argument for argument 'a' at (1)");
    });
  });
  test('Diagnostics Array', () => {
    const diags = linter.parse(msg);
    const ref = [
      new Diagnostic(
        new Range(new Position(0, 1), new Position(0, 1)),
        "Nonexistent include directory '/Code/TypeScript/vscode-fortran-support/test/fortran/include' [-Wmissing-include-dirs]",
        DiagnosticSeverity.Warning
      ),
      new Diagnostic(
        new Range(new Position(3, 18), new Position(3, 18)),
        "Missing actual argument for argument 'a' at (1)",
        DiagnosticSeverity.Error
      ),
    ];
    deepStrictEqual(diags, ref);
  });
});
suite('GNU (gfortran v11+) lint single plain output', () => {
  const linter = new GNUModernLinter();
  const msg = `err-mod.f90:3:17: Error: (1)`;
  suite('REGEX matches', () => {
    const matches = [...msg.matchAll(linter.regex)];
    const g = matches[0].groups;
    test('REGEX: filename', () => {
      strictEqual(g?.['fname'], 'err-mod.f90');
    });
    test('REGEX: line number', () => {
      strictEqual(g?.['ln'], '3');
    });
    test('REGEX: column number', () => {
      strictEqual(g?.['cn'], '17');
    });
    test('REGEX: severity <sev>', () => {
      strictEqual(g?.['sev'], 'Error');
    });
    test('REGEX: message <msg>', () => {
      strictEqual(g?.['msg'], '(1)');
    });
  });
  test('Diagnostics Array', () => {
    const diags = linter.parse(msg);
    const ref = [
      new Diagnostic(
        new Range(new Position(2, 17), new Position(2, 17)),
        '(1)',
        DiagnosticSeverity.Error
      ),
    ];
    deepStrictEqual(diags, ref);
  });
});
suite('GNU (gfortran v11+) lint multiple plain output', () => {
  const linter = new GNUModernLinter();
  const msg = `
err-mod.f90:3:17: Error: (1)
err-mod.f90:2:11: Error: IMPLICIT NONE statement at (1) cannot follow PRIVATE statement at (2)
err-mod.f90:10:22: Error: Missing actual argument for argument ‘arg1’ at (1)`;
  suite('REGEX matches', () => {
    const matches = [...msg.matchAll(linter.regex)];
    const g = matches[0].groups;
    test('REGEX: filename', () => {
      strictEqual(g?.['fname'], 'err-mod.f90');
    });
    test('REGEX: line number', () => {
      strictEqual(g?.['ln'], '3');
    });
    test('REGEX: column number', () => {
      strictEqual(g?.['cn'], '17');
    });
    test('REGEX: severity <sev>', () => {
      strictEqual(g?.['sev'], 'Error');
    });
    test('REGEX: message <msg>', () => {
      strictEqual(g?.['msg'], '(1)');
    });

    const g2 = matches[1].groups;
    test('REGEX: filename', () => {
      strictEqual(g2?.['fname'], 'err-mod.f90');
    });
    test('REGEX: line number', () => {
      strictEqual(g2?.['ln'], '2');
    });
    test('REGEX: column number', () => {
      strictEqual(g2?.['cn'], '11');
    });
    test('REGEX: severity <sev>', () => {
      strictEqual(g2?.['sev'], 'Error');
    });
    test('REGEX: message <msg>', () => {
      strictEqual(
        g2?.['msg'],
        'IMPLICIT NONE statement at (1) cannot follow PRIVATE statement at (2)'
      );
    });

    const g3 = matches[2].groups;
    test('REGEX: filename', () => {
      strictEqual(g3?.['fname'], 'err-mod.f90');
    });
    test('REGEX: line number', () => {
      strictEqual(g3?.['ln'], '10');
    });
    test('REGEX: column number', () => {
      strictEqual(g3?.['cn'], '22');
    });
    test('REGEX: severity <sev>', () => {
      strictEqual(g3?.['sev'], 'Error');
    });
    test('REGEX: message <msg>', () => {
      strictEqual(g3?.['msg'], 'Missing actual argument for argument ‘arg1’ at (1)');
    });
  });

  test('Diagnostics Array', () => {
    const diags = linter.parse(msg);
    const ref = [
      new Diagnostic(
        new Range(new Position(2, 17), new Position(2, 17)),
        '(1)',
        DiagnosticSeverity.Error
      ),
      new Diagnostic(
        new Range(new Position(1, 11), new Position(1, 11)),
        'IMPLICIT NONE statement at (1) cannot follow PRIVATE statement at (2)',
        DiagnosticSeverity.Error
      ),
      new Diagnostic(
        new Range(new Position(9, 22), new Position(9, 22)),
        'Missing actual argument for argument ‘arg1’ at (1)',
        DiagnosticSeverity.Error
      ),
    ];
    deepStrictEqual(diags, ref);
  });
});

// -----------------------------------------------------------------------------

suite('Intel (ifort) lint single', () => {
  const linter = new IntelLinter();
  const msg = `
/fetch/radiant/RADIANT_Matrix_Free_Subgrid_Scale.F90(102): error #5082: Syntax error, found '::' when expecting one of: ( : % [ . = =>
      PetscInt :: ierr
---------------^
`;
  suite('REGEX matches', () => {
    const matches = [...msg.matchAll(linter.regex)];
    const g = matches[0].groups;
    test('REGEX: filename', () => {
      strictEqual(g?.['fname'], '/fetch/radiant/RADIANT_Matrix_Free_Subgrid_Scale.F90');
    });
    test('REGEX: line number', () => {
      strictEqual(g?.['ln'], '102');
    });
    test('REGEX: column number', () => {
      strictEqual(g?.['cn'], '---------------^');
    });
    test('REGEX: severity <sev1>', () => {
      strictEqual(g?.['sev1'], 'error');
    });
    test('REGEX: message <msg1>', () => {
      strictEqual(
        g?.['msg1'],
        "#5082: Syntax error, found '::' when expecting one of: ( : % [ . = =>"
      );
    });
  });
  test('Diagnostics Array', () => {
    const diags = linter.parse(msg);
    const ref = [
      new Diagnostic(
        new Range(new Position(101, 16), new Position(101, 16)),
        "#5082: Syntax error, found '::' when expecting one of: ( : % [ . = =>",
        DiagnosticSeverity.Error
      ),
    ];
    deepStrictEqual(diags, ref);
  });
});
suite('Intel (ifort) lint multiple', () => {
  const linter = new IntelLinter();
  const msg = `
sample.f90(4): error #6631: A non-optional actual argument must be present when invoking a procedure with an explicit interface.   [A]
  call say_hello()
-------^
sample.f90(4): error #6631: A non-optional actual argument must be present when invoking a procedure with an explicit interface.   [B]
  call say_hello()
-------^
sample.f90(8): remark #7712: This variable has not been used.   [A]
  subroutine say_hello(a,b)
-----------------------^
sample.f90(8): remark #7712: This variable has not been used.   [B]
  subroutine say_hello(a,b)
-------------------------^
compilation aborted for sample.f90 (code 1)
`;
  suite('REGEX matches', () => {
    const matches = [...msg.matchAll(linter.regex)];
    const g1 = matches[0].groups;
    test('REGEX: match 1 - filename', () => {
      strictEqual(g1?.['fname'], 'sample.f90');
    });
    test('REGEX: match 1 - line number', () => {
      strictEqual(g1?.['ln'], '4');
    });
    test('REGEX: match 1 - column number', () => {
      strictEqual(g1?.['cn'], '-------^');
    });
    test('REGEX: match 1 - severity <sev1>', () => {
      strictEqual(g1?.['sev1'], 'error');
    });
    test('REGEX: match 1 - message <msg1>', () => {
      strictEqual(
        g1?.['msg1'],
        '#6631: A non-optional actual argument must be present when invoking a procedure with an explicit interface.   [A]'
      );
    });
    const g2 = matches[1].groups;
    test('REGEX: match 2 - filename', () => {
      strictEqual(g2?.['fname'], 'sample.f90');
    });
    test('REGEX: match 2 - line number', () => {
      strictEqual(g2?.['ln'], '4');
    });
    test('REGEX: match 2 - column number', () => {
      strictEqual(g2?.['cn'], '-------^');
    });
    test('REGEX: match 2 - severity <sev1>', () => {
      strictEqual(g2?.['sev1'], 'error');
    });
    test('REGEX: match 2 - message <msg1>', () => {
      strictEqual(
        g2?.['msg1'],
        '#6631: A non-optional actual argument must be present when invoking a procedure with an explicit interface.   [B]'
      );
    });
    const g3 = matches[2].groups;
    test('REGEX: match 1 - filename', () => {
      strictEqual(g3?.['fname'], 'sample.f90');
    });
    test('REGEX: match 1 - line number', () => {
      strictEqual(g3?.['ln'], '8');
    });
    test('REGEX: match 1 - column number', () => {
      strictEqual(g3?.['cn'], '-----------------------^');
    });
    test('REGEX: match 1 - severity <sev1>', () => {
      strictEqual(g3?.['sev1'], 'remark');
    });
    test('REGEX: match 1 - message <msg1>', () => {
      strictEqual(g3?.['msg1'], '#7712: This variable has not been used.   [A]');
    });
    const g4 = matches[3].groups;
    test('REGEX: match 2 - filename', () => {
      strictEqual(g4?.['fname'], 'sample.f90');
    });
    test('REGEX: match 2 - line number', () => {
      strictEqual(g4?.['ln'], '8');
    });
    test('REGEX: match 2 - column number', () => {
      strictEqual(g4?.['cn'], '-------------------------^');
    });
    test('REGEX: match 2 - severity <sev1>', () => {
      strictEqual(g4?.['sev1'], 'remark');
    });
    test('REGEX: match 2 - message <msg1>', () => {
      strictEqual(g4?.['msg1'], '#7712: This variable has not been used.   [B]');
    });
  });
  test('Diagnostics Array', () => {
    const diags = linter.parse(msg);
    const ref = [
      new Diagnostic(
        new Range(new Position(3, 8), new Position(3, 8)),
        '#6631: A non-optional actual argument must be present when invoking a procedure with an explicit interface.   [A]',
        DiagnosticSeverity.Error
      ),
      new Diagnostic(
        new Range(new Position(3, 8), new Position(3, 8)),
        '#6631: A non-optional actual argument must be present when invoking a procedure with an explicit interface.   [B]',
        DiagnosticSeverity.Error
      ),
      new Diagnostic(
        new Range(new Position(7, 24), new Position(7, 24)),
        '#7712: This variable has not been used.   [A]',
        DiagnosticSeverity.Warning
      ),
      new Diagnostic(
        new Range(new Position(7, 26), new Position(7, 26)),
        '#7712: This variable has not been used.   [B]',
        DiagnosticSeverity.Warning
      ),
    ];
    deepStrictEqual(diags, ref);
  });
});
suite('Intel (ifort) lint preprocessor', () => {
  const linter = new IntelLinter();
  const msg = `
RADIANT_Matrix_Free_Subgrid_Scale.F90(1): #error: can't find include file: fdebug.h
`;
  suite('REGEX matches', () => {
    const matches = [...msg.matchAll(linter.regex)];
    const g = matches[0].groups;
    test('REGEX: filename', () => {
      strictEqual(g?.['fname'], 'RADIANT_Matrix_Free_Subgrid_Scale.F90');
    });
    test('REGEX: line number', () => {
      strictEqual(g?.['ln'], '1');
    });
    test('REGEX: column number', () => {
      strictEqual(g?.['cn'], undefined);
    });
    test('REGEX: severity <sev2>', () => {
      strictEqual(g?.['sev2'], 'error');
    });
    test('REGEX: message <msg2>', () => {
      strictEqual(g?.['msg2'], "can't find include file: fdebug.h");
    });
  });
  test('Diagnostics Array', () => {
    const diags = linter.parse(msg);
    const ref = [
      new Diagnostic(
        new Range(new Position(0, 1), new Position(0, 1)),
        "can't find include file: fdebug.h",
        DiagnosticSeverity.Error
      ),
    ];
    deepStrictEqual(diags, ref);
  });
});
suite('Intel (ifort) lint preprocessor multiple', () => {
  const linter = new IntelLinter();
  const msg = `
RADIANT_Matrix_Free_Subgrid_Scale.F90(1): #error: can't find include file: fdebug.h
RADIANT_Matrix_Free_Subgrid_Scale.F90(52): #error: can't find include file: petsc_legacy.h
C:\\Some\\random\\path\\sample.f90(4): error #6631: A non-optional actual argument must be present when invoking a procedure with an explicit interface.   [A]
  call say_hello()
-------^
`;
  suite('REGEX matches', () => {
    const matches = [...msg.matchAll(linter.regex)];
    const g1 = matches[0].groups;
    test('REGEX: match 1 - filename', () => {
      strictEqual(g1?.['fname'], 'RADIANT_Matrix_Free_Subgrid_Scale.F90');
    });
    test('REGEX: match 1 - line number', () => {
      strictEqual(g1?.['ln'], '1');
    });
    test('REGEX: match 1 - column number', () => {
      strictEqual(g1?.['cn'], undefined);
    });
    test('REGEX: match 1 - severity <sev2>', () => {
      strictEqual(g1?.['sev2'], 'error');
    });
    test('REGEX: match 1 - message <msg2>', () => {
      strictEqual(g1?.['msg2'], "can't find include file: fdebug.h");
    });
    const g2 = matches[1].groups;
    test('REGEX: match 2 - filename', () => {
      strictEqual(g2?.['fname'], 'RADIANT_Matrix_Free_Subgrid_Scale.F90');
    });
    test('REGEX: match 2 - line number', () => {
      strictEqual(g2?.['ln'], '52');
    });
    test('REGEX: match 2 - column number', () => {
      strictEqual(g2?.['cn'], undefined);
    });
    test('REGEX: match 2 - severity <sev2>', () => {
      strictEqual(g2?.['sev2'], 'error');
    });
    test('REGEX: match 2 - message <msg2>', () => {
      strictEqual(g2?.['msg2'], "can't find include file: petsc_legacy.h");
    });
    const g3 = matches[2].groups;
    test('REGEX: match 3 - filename', () => {
      strictEqual(g3?.['fname'], 'C:\\Some\\random\\path\\sample.f90');
    });
    test('REGEX: match 3 - line number', () => {
      strictEqual(g3?.['ln'], '4');
    });
    test('REGEX: match 3 - column number', () => {
      strictEqual(g3?.['cn'], '-------^');
    });
    test('REGEX: match 3 - severity <sev1>', () => {
      strictEqual(g3?.['sev1'], 'error');
    });
    test('REGEX: match 3 - message <msg1>', () => {
      strictEqual(
        g3?.['msg1'],
        '#6631: A non-optional actual argument must be present when invoking a procedure with an explicit interface.   [A]'
      );
    });
  });
  test('Diagnostics Array', () => {
    const diags = linter.parse(msg);
    const ref = [
      new Diagnostic(
        new Range(new Position(0, 1), new Position(0, 1)),
        "can't find include file: fdebug.h",
        DiagnosticSeverity.Error
      ),
      new Diagnostic(
        new Range(new Position(51, 1), new Position(51, 1)),
        "can't find include file: petsc_legacy.h",
        DiagnosticSeverity.Error
      ),
      new Diagnostic(
        new Range(new Position(3, 8), new Position(3, 8)),
        '#6631: A non-optional actual argument must be present when invoking a procedure with an explicit interface.   [A]',
        DiagnosticSeverity.Error
      ),
    ];
    deepStrictEqual(diags, ref);
  });
});

// -----------------------------------------------------------------------------
suite('NAG (nagfor) lint single', () => {
  const linter = new NAGLinter();
  const msg = `
Sequence Error: lint/err-mod.f90, line 3: The IMPLICIT statement cannot occur here
`;
  suite('REGEX matches', () => {
    const matches = [...msg.matchAll(linter.regex)];
    const g = matches[0].groups;
    test('REGEX: filename', () => {
      strictEqual(g?.['fname'], 'lint/err-mod.f90');
    });
    test('REGEX: line number', () => {
      strictEqual(g?.['ln'], '3');
    });
    test('REGEX: severity <sev1>', () => {
      strictEqual(g?.['sev1'], 'Sequence Error');
    });
    test('REGEX: message <msg1>', () => {
      strictEqual(g?.['msg1'], 'The IMPLICIT statement cannot occur here');
    });
  });
  test('Diagnostics Array', async () => {
    const fileUri = Uri.file(path.resolve(__dirname, '../../../test/fortran/lint/err-mod.f90'));
    const doc = await workspace.openTextDocument(fileUri);
    await window.showTextDocument(doc);
    const diags = linter.parse(msg);
    const ref = [
      new Diagnostic(
        new Range(new Position(2, 0), new Position(2, 17)),
        'The IMPLICIT statement cannot occur here',
        DiagnosticSeverity.Error
      ),
    ];
    deepStrictEqual(diags, ref);
  });
});

// -----------------------------------------------------------------------------

suite('LFortran (lfortran) lint single', () => {
  const linter = new LFortranLinter();
  const msg = `
lint/err-mod.f90:3-3:5-12: syntax error: Token 'implicit' is unexpected here
`;
  suite('REGEX matches', () => {
    const matches = [...msg.matchAll(linter.regex)];
    const g = matches[0].groups;
    test('REGEX: filename', () => {
      strictEqual(g?.['fname'], 'lint/err-mod.f90');
    });
    test('REGEX: line number start <ls>', () => {
      strictEqual(g?.['ls'], '3');
    });
    test('REGEX: line number end <le>', () => {
      strictEqual(g?.['le'], '3');
    });
    test('REGEX: column number start <cs>', () => {
      strictEqual(g?.['cs'], '5');
    });
    test('REGEX: column number end <ce>', () => {
      strictEqual(g?.['ce'], '12');
    });
    test('REGEX: severity <sev>', () => {
      strictEqual(g?.['sev'], 'syntax error');
    });
    test('REGEX: message <msg>', () => {
      strictEqual(g?.['msg'], `Token 'implicit' is unexpected here`);
    });
  });
  test('Diagnostics Array', () => {
    const diags = linter.parse(msg);
    const ref = [
      new Diagnostic(
        new Range(new Position(2, 4), new Position(2, 12)),
        `Token 'implicit' is unexpected here`,
        DiagnosticSeverity.Error
      ),
    ];
    deepStrictEqual(diags, ref);
  });
});
