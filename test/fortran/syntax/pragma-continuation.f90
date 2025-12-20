! Continuation within OpenMP/OpenACC directives
program test
!$omp parallel &
!$omp& private(i, j, k) &
!$omp& shared(x, y, z)
  x = 1
!$omp end parallel

!$acc kernels &
!$acc& copy(a, b, c) &
!$acc& copyin(d)
  a = b + c
!$acc end kernels
end program
