module main

   use iso_fortran_env, only: real64
   implicit none
   private

  type, public :: test_t
      real(real64) :: a, b
  contains
      procedure, private :: init_sub
      generic :: init => init_sub
  end type test_t

   type :: node
      private
      type(node), pointer :: next => null()
      class(*), allocatable :: item

      contains
         final :: node_finalizer

   end type node

  contains

   subroutine init_sub(this, a, b)

      class( test_t ) :: this
      real(real64),intent(in) :: a, b

      this%a = a
      this%b = b

   end subroutine init_sub

   subroutine node_finalizer(a)
      type(node) :: a

   end subroutine node_finalizer

end module main