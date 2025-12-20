program openmp_test
  integer :: i, n
  real :: sum
  !$omp parallel do private(i) shared(n) reduction(+:sum) schedule(static,4)
  do i = 1, n
    sum = sum + i
  end do
  !$omp end parallel do
end program
