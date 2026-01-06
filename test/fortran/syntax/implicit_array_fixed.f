C     This file demonstrates the syntax of "implicit arrays" (Implied-DO)
C     in Fixed Form Fortran.
C     Covers: DATA statements, I/O lists, and Array Constructors.

      program implicit_arrays_fixed
      implicit none
      integer i, j, k
      integer a(10)
      integer b(3,3)
      integer c(20)

C     ==========================================
C     1. DATA Statements (Implied-DO)
C     ==========================================

      data (a(i), i=1, 5) /1, 2, 3, 4, 5/

C     Continuation in DATA implied-do
      data (a(i),
     +      i=6, 10) /6, 7, 8, 9, 10/

C     ==========================================
C     2. I/O Lists
C     ==========================================

      print *, (a(i), i=1, 10)

C     Nested implied-do in I/O
      write(*,*) ((b(i,j), i=1, 3), j=1, 3)

C     Complex continuation in I/O list
      print *, (a(i),
     +          i=1,
     +          5)

      write(*, 100) (a(i), i=1, 10)
 100  format(10I5)

C     With expressions in bounds
      print *, (a(i), i=1, 2*5)

C     ==========================================
C     3. Array Constructors (Supported in F90 fixed form)
C     ==========================================

C     Old style (/ /)
      a = (/ (i, i=1, 10) /)

C     Split across lines
      a = (/ (i,
     +        i=1, 10) /)

C     Nested
      a = (/ ((i+j, i=1, 2), j=1, 2), 0, 0, 0, 0, 0, 0 /)

C     ==========================================
C     4. Whitespace stress test
C     ==========================================

      a = (/ (  i  ,  i  =  1  ,  10  ) /)

      end
