
! ------------------------------------------------------------------------------
!
!  Tests the syntax highlighting of nested case select constructs is correct
!-------------------------------------------------------------------------------

program select_case_test
   implicit none

   integer :: i, j, k


   select case(i)
   case(1)
      select case(j)
      case(1)
         print*, i, j
      case(2)
         print*, i, j
      case default
         print*, i, j
      end select

   case(2)
      select case(k)
      case(1)
         print*, i, j
      case(2)
         print*, i, j
      case default
         print*, i, j
      end select

   case default
      print*, i, j
   end select

end program select_case_test