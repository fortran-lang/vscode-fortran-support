module my_module
  implicit none
  private
  public :: public_var
  integer :: public_var
end module my_module

submodule (my_module) my_submodule
contains
  module procedure my_proc
    print *, 'submodule'
  end procedure
end submodule