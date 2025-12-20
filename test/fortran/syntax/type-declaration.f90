! Type declarations with attributes
subroutine test(x, str)
  integer, parameter :: n = 10
  real, dimension(5) :: arr
  integer, intent(in) :: x
  character(len=*), parameter :: str
  real(8), allocatable :: y(:)
end subroutine
