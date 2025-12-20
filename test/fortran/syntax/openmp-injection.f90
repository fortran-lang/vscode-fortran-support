! OpenMP injection
program test
!$omp parallel
  x = 1
!$omp end parallel
!$omp parallel do private(i)
  do i = 1, 10
  end do
end program
