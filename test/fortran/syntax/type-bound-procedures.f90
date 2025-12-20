! Type-bound procedures
module test
  type :: mytype
    real :: x
  contains
    procedure :: init
    procedure :: destroy
    procedure, pass(this) :: compute
    procedure, nopass :: static_method
    final :: cleanup
  end type
contains
  subroutine init(this)
    class(mytype) :: this
    this%x = 0.0
  end subroutine

  subroutine cleanup(this)
    type(mytype) :: this
  end subroutine
end module
