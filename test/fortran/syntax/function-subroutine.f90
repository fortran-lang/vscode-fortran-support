! Function and subroutine declarations
pure function add(a, b) result(c)
  integer, intent(in) :: a, b
  integer :: c
  c = a + b
end function

elemental real function square(x)
  real, intent(in) :: x
  square = x * x
end function

recursive subroutine factorial(n, result)
  integer, intent(in) :: n
  integer, intent(out) :: result
end subroutine

subroutine cfunc(x) bind(c, name="c_function")
  real(c_double), intent(in) :: x
end subroutine
