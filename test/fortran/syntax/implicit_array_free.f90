!>
! This file demonstrates the syntax of "implicit arrays" (Implied-DO loops) 
! in Free Form Fortran.
! Covers: Array constructors, DATA statements, I/O lists.
!>
program implicit_arrays_free
  implicit none
  integer :: i, j, n
  integer, dimension(10) :: a
  integer, dimension(3,3) :: b
  integer, allocatable :: c(:)
  real, allocatable :: d(:)
  
  ! ==========================================
  ! 1. Modern Array Constructors [ ... ]
  ! ==========================================

  ! Basic implied-do
  a = [ (i, i=1, 10) ]

  ! With stride
  a = [ (i, i=1, 10, 2), (i, i=2, 11, 2) ]

  ! With expressions
  c = [ (i**2, i=1, 5) ]

  ! Nested implied-do
  c = [ ((i*j, i=1, 5), j=1, 2) ]

  ! Variable bounds
  n = 10
  c = [ (i, i=1, n) ]

  ! ==========================================
  ! 2. Legacy Array Constructors (/ ... /)
  ! ==========================================
  
  a = (/ (i, i=1, 10) /)
  
  ! Mixed simple values and implied-do
  c = (/ 0, (i, i=1, 5), 0 /)

  ! ==========================================
  ! 3. Type Specification (F2003+)
  ! ==========================================
  
  c = [ integer :: (i, i=1, 10) ]
  d = [ real(kind=4) :: (float(i), i=1, 5) ]
  
  ! ==========================================
  ! 4. DATA Statements
  ! ==========================================
  
  data (a(i), i=1, 5) / 1, 2, 3, 4, 5 /
  data (a(i), i=6, 10) / 5*0 /

  ! ==========================================
  ! 5. I/O Statement Lists
  ! ==========================================

  print *, "Simple:", (a(i), i=1, 10)
  
  ! Nested I/O list
  print *, "Matrix:", ((b(i,j), i=1, 3), j=1, 3)
  
  ! Mixed expressions
  write(*, '(10I5)') (a(i) * 2, i=1, 10)

  ! ==========================================
  ! 6. Formatting and Line Continuation
  ! ==========================================

  c = [ ( &
    i, &
    i = 1, &
    10 ) ]

  ! Whitespace variations
  c = [ ( i , i = 1 , 10 ) ]

  ! ==========================================
  ! 7. Implied-Shape Arrays (Named Constant)
  ! ==========================================
  
  integer, parameter :: p(*) = [ (i, i=1, 5) ]

  ! ==========================================
  ! 8. Continuation immediately after opening
  ! ==========================================
  c = [ &
      (i, i=1, 5) ]

  ! ==========================================
  ! 9. Continuation before closing
  ! ==========================================
  c = [ (i, i=1, 5) &
      ]

  ! ==========================================
  ! 10. Broken loop controls
  ! ==========================================
  c = [ (i, i &
         = 1, 5) ]

  c = [ (i, i = &
         1, 5) ]

  c = [ (i, i = 1 &
         , 5) ]

  ! ==========================================
  ! 11. Continuations with comments
  ! ==========================================
  ! Start of array
  c = [ ( &
      ! Value expression
      i, &
      ! Loop variable start
      i=1, &
      ! Loop limit
      5 &
      ) ]
  ! End of array

  ! ==========================================
  ! 12. Legacy constructor (extreme spacing)
  ! ==========================================
  c = (/ &
       ( &
       i &
       , &
       i &
       = &
       1 &
       , &
       5 &
       ) &
       /)

  ! ==========================================
  ! 13. Type spec with continuation
  ! ==========================================
  c = [ integer &
        :: &
        (i, i=1, 5) ]

  ! ==========================================
  ! 14. Type spec with inline comments
  ! ==========================================
  ! Type kind
  c = [ integer & 
        ! Separator
        :: &      
        (i, i=1, 5) ]

  ! ==========================================
  ! 15. Nested complex continuation
  ! ==========================================
  c = [ ( &
          (i*j, j=1, &
                   2) &
        , i=1, 2) ]

  ! ==========================================
  ! 16. Blank lines in continuation
  ! ==========================================
  c = [ (i, &

         i=1, 5) ]

end program implicit_arrays_free
