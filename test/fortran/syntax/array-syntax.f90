! Array syntax
program test
  integer :: a(10)
  real :: b(1:5, 2:6)
  a(1) = 5
  b(:, 3) = 1.0
  c = a(1:5:2)
  d = b(i, j)
  e = arr(:)
end program
