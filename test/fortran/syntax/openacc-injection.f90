! OpenACC injection
program test
!$acc kernels
  x = 1
!$acc end kernels
!$acc parallel loop
  do i = 1, 10
  end do
end program
