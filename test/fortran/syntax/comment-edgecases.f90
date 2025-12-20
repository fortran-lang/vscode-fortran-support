! Comment edge cases
program test
  x = 5 ! inline comment
  ! full line comment
  str = "! not a comment"
  y = 10 & ! comment after continuation
      + 20
end program
