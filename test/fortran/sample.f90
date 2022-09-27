program main
  integer :: var
  var = foo(1)
  call say_hello(1, 2)
  ! comment
#define PREPROC

contains

  subroutine say_hello(a,b)
    integer :: a,b

    print *, "Hello, World!"
  end subroutine say_hello

  function foo(val) result(res)
    integer, intent(in) :: val
    integer :: res
    res = val + 1
  end function foo

end program main