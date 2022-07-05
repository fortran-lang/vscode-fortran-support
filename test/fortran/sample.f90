program main
 ! execution
  
  call say_hello()

contains

  subroutine say_hello(a,b)
    integer :: a,b

    print *, "Hello, World!"
  end subroutine say_hello
  
  
end program main