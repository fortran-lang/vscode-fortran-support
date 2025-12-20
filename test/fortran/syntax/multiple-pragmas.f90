! Multiple OpenMP directives
program test
!$omp parallel
!$omp do
  do i = 1, 10
  end do
!$omp end do
!$omp end parallel

!$omp parallel do
  do i = 1, 10
  end do
!$omp end parallel do

  ! Nested regions
!$omp parallel
!$omp single
  x = 1
!$omp end single
!$omp end parallel
end program
