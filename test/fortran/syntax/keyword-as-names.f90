! Keywords as variable/type names (valid when not in keyword context)
module test
  type my_if
    integer :: value
  end type my_if
contains
  subroutine sub()
    integer :: if, do, end, type
    real :: function, subroutine
    type(my_if) :: x

    if = 5
    do = 10
    end = if + do
  end subroutine
end module
