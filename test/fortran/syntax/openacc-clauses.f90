! OpenACC with various clauses
program test
!$acc kernels copy(a) copyin(b) copyout(c)
  c = a + b
!$acc end kernels

!$acc parallel loop gang vector reduction(+:sum)
  do i = 1, n
    sum = sum + a(i)
  end do
!$acc end parallel loop

!$acc data create(tmp) present(x)
!$acc end data
end program
