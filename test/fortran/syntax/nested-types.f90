module nested_types
  implicit none
  type :: A
    integer :: x
  contains
    procedure :: foo
    procedure :: bar
  end type A

  type :: B
    type(A) :: a
  end type B

  type :: C
    type(B) :: b
  end type C

contains
  subroutine foo(this)
    class(A), intent(inout) :: this
    print *, "Value of x is:", this%x
  end subroutine foo

  subroutine bar(this, some_value)
    class(A), intent(inout) :: this
    integer, intent(in) :: some_value
    this%x = this%x + some_value
    print *, "Value of x after bar is:", this%x
  end subroutine bar

end module nested_types

program mwe
  use nested_types
  implicit none
  type(A) :: a_inst
  type(C) :: c_inst
  c_inst%b%a%x = 42
  call a_inst%foo()
  call c_inst%b%a%foo()
  call &
    c_inst%b%a%bar(&
    ! some comment
     8 + c_inst%b%a%x &
       )
end program mwe