program main
  call say_hello(1,2)
contains
  subroutine say_hello(a,b)
    integer :: a,b
    print *, "Hello, World!"
  end subroutine say_hello
end program main
