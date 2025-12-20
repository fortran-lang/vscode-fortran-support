! Pointer and allocatable
program test
  integer, pointer :: ptr
  integer, allocatable :: arr(:)
  integer, target :: tgt

  allocate(arr(10))
  allocate(ptr)

  ptr => tgt
  ptr => null()

  deallocate(arr)
  deallocate(ptr)

  if (allocated(arr)) then
  end if

  if (associated(ptr)) then
  end if
end program
