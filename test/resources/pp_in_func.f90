! Out of order nested function/subroutine definitions such as in the case
! of preprocessing directives, where the inner scope is not the scope that closes
! first, yield invalid.error syntax highlighting because we attempt to match
! the name from the begin REGEX to the end REGEX match i.e. \\1
! This can be circumvented by matching a word character instead [a-z_]\\w*
! Obviously this is not going to highlight when the wrong name is used to
! close a scope, but the linter should solve that

!
subroutine blasmul_mm()
   interface
#ifdef DOUBLEP
      SUBROUTINE DGEMM ( )
#else
      SUBROUTINE SGEMM (  )
#endif

#ifdef DOUBLEP
      END SUBROUTINE DGEMM
#else
      END SUBROUTINE SGEMM
#endif
   end interface

end subroutine blasmul_mm

! This would work with the previous definition of the end REGEX because the scopes
! close in the order that they open
subroutine blasmul_mm()
   interface
#ifdef DOUBLEP
      SUBROUTINE DGEMM ( )
#else
      SUBROUTINE SGEMM (  )
#endif

#ifndef DOUBLEP
      END SUBROUTINE SGEMM
#else
      END SUBROUTINE DGEMM
#endif
   end interface

end subroutine blasmul_mm

REAL FUNCTION blasmul_mm() RESULT(VAL)
   interface
#ifdef DOUBLEP
      FUNCTION DGEMM ( )
#else
      FUNCTION SGEMM (  )
#endif

#ifdef DOUBLEP
      END FUNCTION DGEMM
#else
      END FUNCTION SGEMM
#endif
   end interface

END FUNCTION blasmul_mm

MODULE blasmul_mm
#ifdef DOUBLEP
   MODULE DGEMM
#else
   MODULE SGEMM
#endif

#ifdef DOUBLEP
   END MODULE DGEMM
#else
   END MODULE SGEMM
#endif

end MODULE blasmul_mm

SUBMODULE (name) blasmul_mm
#ifdef DOUBLEP
   SUBMODULE (name) DGEMM
#else
   SUBMODULE (name) SGEMM
#endif

#ifdef DOUBLEP
   END SUBMODULE DGEMM
#else
   END SUBMODULE SGEMM
#endif

end SUBMODULE blasmul_mm

PROGRAM blasmul_mm
#ifdef DOUBLEP
   PROGRAM DGEMM
#else
   PROGRAM SGEMM
#endif

#ifdef DOUBLEP
   END PROGRAM DGEMM
#else
   END PROGRAM SGEMM
#endif

end PROGRAM blasmul_mm

MODULE PROCEDURE blasmul_mm
#ifdef DOUBLEP
MODULE PROCEDURE DGEMM
#else
MODULE PROCEDURE SGEMM
#endif

#ifdef DOUBLEP
END PROCEDURE DGEMM
#else
END PROCEDURE SGEMM
#endif

end PROCEDURE blasmul_mm
