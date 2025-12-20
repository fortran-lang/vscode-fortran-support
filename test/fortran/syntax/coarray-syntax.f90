! Coarray syntax
program test
  integer :: scalar[*]
  real :: arr(10)[*]
  integer :: img[2, 3, *]

  scalar[5] = 42
  arr(3)[2] = 1.5

  sync all
  sync images([1, 2, 3])
  sync memory

  if (this_image() == 1) then
    x = scalar[num_images()]
  end if
end program
