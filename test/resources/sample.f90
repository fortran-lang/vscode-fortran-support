program main
 ! execution
  
  call say_hello()

contains
  function sum(a, b)
    integer :: a,b
    integer :: sum
    sum = a + b
  end function sum

  integer function mul(a, b)
    integer :: a,b
    sum = a * b
  end function mul
  
  function sub(a, b) result(s)
    integer :: a,b
    integer :: s
    s = a - b
  end function sub

  subroutine say_hello(a,b)
    integer :: a,b

    print *, "Hello, World!"
  end subroutine say_hello

  pure integer function div(a, b)
    integer :: a,b
    div = a / b
  end function div

  pure function pow(a, b) result(e)
    integer :: a,b
    integer :: e
    e = a**b
  end function pow
end program main