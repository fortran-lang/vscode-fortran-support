MODULE nopass_test
   TYPE :: vector
      INTEGER(4) :: n
      REAL(8), POINTER, DIMENSION(:) :: v => NULL()
      PROCEDURE(fort_wrap), NOPASS, POINTER :: bound_nopass => NULL()
      CONTAINS
      PROCEDURE :: create => vector_create !< Doc 1
      PROCEDURE :: norm => vector_norm !< Doc 2
      PROCEDURE, PASS(self) :: bound_pass => bound_pass
   END TYPE vector
END MODULE nopass_test
