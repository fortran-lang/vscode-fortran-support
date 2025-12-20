module test_implicit
  implicit none (type, external)
contains
  subroutine sub1
    implicit none
  end subroutine
  
  function func1() result(r)
    implicit none (type)
    real :: r
  end function
end module
