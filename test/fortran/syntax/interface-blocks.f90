module test
  interface operator(+)
    module procedure add_int
  end interface

  interface assignment(=)
    module procedure assign_custom
  end interface

  abstract interface
    subroutine callback(x)
      real, intent(in) :: x
    end subroutine
  end interface
end module
