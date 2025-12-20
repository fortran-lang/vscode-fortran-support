! Line continuation with &
program test
  x = 1 + 2 + &
      3 + 4
  str = "continued &
        &string"
  call myfunc(arg1, &
              arg2)
end program
