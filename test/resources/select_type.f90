
! ------------------------------------------------------------------------------
!
!  Tests the syntax highlighting of nested type select constructs is correct
!-------------------------------------------------------------------------------

program select_type_test
   implicit none


   type :: point
      real :: x, y
   end type point

   type, extends(point) :: point_3d
      real :: z
   end type point_3d

   type, extends(point) :: color_point
      integer :: color
   end type color_point

   type(point_3d), target :: p3
   type(color_point), target :: c
   class(point), pointer :: p_or_c
   class(point), pointer :: p

   p_or_c => c
   p => p3
   select type ( a => p_or_c )
   class is ( point )
      ! "class ( point ) :: a" implied here
      print *, a%x, a%y ! this block executes
      select type(a)
      type is (point_3d)
         print*, "type(point_3d)"
      type is (color_point)
         print*, "type(color_point)"
      class default
         print*, "no matching type"
      end select

   class is (color_point)  ! does not execute
      select type(p)
      class is (point_3d)
         print*, "class(point_3d)"
      class is (color_point)
         print*, "class(color_point)"
      class is (point)
         print*, "class(point)"
      class default
         print*, "no matching class"
      end select

   type is ( point_3d ) ! does not execute
      ! "type ( point_3d ) :: a" implied here
      print *, a%x, a%y, a%z
   class default
      print*, "no matching class"
   end select


end program select_type_test