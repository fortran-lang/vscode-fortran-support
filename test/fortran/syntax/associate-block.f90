! Associate and block constructs
program test
  associate (y => x%component, z => arr(i))
    y = z + 1
  end associate

  block
    integer :: local_var
    local_var = 5
  end block

  critical
    shared_var = shared_var + 1
  end critical
end program
