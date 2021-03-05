

! ------------------------------------------------------------------------------
!
!  Tests the syntax highlighting of nested rank select constructs is correct
!  @note requires GCC 10.0+ to compile or ifort 2019.1+
!-------------------------------------------------------------------------------

program select_rank_test
   implicit none

   real, dimension(2, 2) :: a, b

   a = -666.0; b = -666.0
   call initialize(a)
   call nested_initialise(a, b)

   print*, a
   print*, b

   contains

   subroutine initialize (arg)
      real :: arg(..)
      select rank (arg)
        rank (0)   ! scalar
          arg = 0.0
        rank (1)
          arg(:) = 0.0
        rank (2)
          arg(:, :) = 0.0
        rank default
          print *, "Subroutine initialize called with unexpected rank argument"
      end select
      return
   end subroutine

   subroutine nested_initialise(arg1, arg2)
      !< @note this is meant to test the syntax highlighting, nothing else!
      real :: arg1(..), arg2(..)
      select rank (arg1)
      rank (0)   ! scalar
         arg1 = 0.0
         select rank (arg2)
         rank (0)   ! scalar
            arg2 = 0.0
         rank (1)
            arg2(:) = 0.0
         rank (2)
            arg2(:, :) = 0.0
         rank default
            print *, "Subroutine initialize called with unexpected rank argument"
         end select
      rank (1)
         arg1(:) = 0.0
         select rank (arg2)
         rank (0)   ! scalar
            arg2 = 0.0
         rank (1)
            arg2(:) = 0.0
         rank (2)
            arg2(:, :) = 0.0
         rank default
            print *, "Subroutine initialize called with unexpected rank argument"
         end select
      rank (2)
         arg1(:, :) = 0.0
         select rank (arg2)
         rank (0)   ! scalar
            arg2 = 0.0
         rank (1)
            arg2(:) = 0.0
         rank (2)
            arg2(:, :) = 0.0
         rank default
            print *, "Subroutine initialize called with unexpected rank argument"
         end select
      rank default
          print *, "Subroutine initialize called with unexpected rank argument"
      end select
      return

   end subroutine nested_initialise

end program select_rank_test