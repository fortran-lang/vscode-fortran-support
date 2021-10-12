! This is an example demonstrating abstraction and the benefit of using
! submodules. However for convenience of testing all files have been merged to 1

! base.f90
module BaseClass

   implicit none

   type, abstract :: Base     ! <-- the base class with subroutine "sub"
   contains
       procedure(sub_interface), nopass, deferred :: sub
   end type

   interface
       subroutine sub_interface(i)    ! <-- the interface is defined here
           implicit none
           integer, intent(in) :: i
       end subroutine sub_interface
   end interface

end module BaseClass

! child.f90
module ChildClass

   use BaseClass
   implicit none

   type, extends(Base) :: Child    ! <-- we extend the Base Class
   contains
       procedure, nopass :: sub
   end type

   interface
       module subroutine sub(i)    ! <-- the interface for the submodule (unfortunately we have to declare the entire thing again)
           implicit none
           integer, intent(in) :: i
       end subroutine sub
   end interface

end module ChildClass

! sub.f90
submodule (ChildClass) ChildSub

contains

    module procedure sub    ! <-- we finally get to define the subroutine
        print*, "The answer is :", i
    end procedure

end submodule

! main.f90
program test

   use ChildClass

   implicit none

   type(Child) :: c
   integer     :: i

   do i=1, 10
       call c%sub(i)
   end do

end program test