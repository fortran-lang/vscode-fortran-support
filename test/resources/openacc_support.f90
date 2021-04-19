!Made-up directives to test OpenACC support
program main
  implicit none
       
  !The highlighting should continue on the second line
  !$acc data copy(A) copyin(B(:)) copyout(C(1:N)) present(D) &
  !$acc&     no_create(E) deviceptr(F)

  !$acc parallel loop private(foo) firstprivate(bar) tile(32,32)

  !$acc parallel
  !$acc loop collapse(2)
  !$acc end parallel

  !$acc end data

  !$acc kernels default(present)
  !$acc loop independent
  !$acc loop reduction(+:sum)
  !$acc loop reduction(max:the_max)
  !$acc loop gang worker vector
  !$acc loop gang(128) worker(4) vector(128)
  !$acc loop seq
  !$acc end kernels

  !$acc parallel loop num_gangs(1) num_workers(1) vector_length(1) default(none)

  !$acc enter data create(A(1:N)) attach(B)

  !$acc update device(A) async
  !$acc update host(A(1:N)) async(1)
  !$acc update self(A(:)) async(2) wait(1)
  !$acc wait(1)
  !$acc wait

  !$acc exit data delete(A) detach(B) finalize

  !$acc serial self(.TRUE.) if(.FALSE.)

  !$acc host_data use_device(A)
  !$acc end host_data

  !$acc declare device_resident(A)

  !$acc init device_type(foo) device_num(bar)
  !$acc shutdown device_type(foo) device_num(bar)
  !$acc set default_async(1)
  
  !$acc cache(A(:))

  ! Test all four forms of atomic
  !$acc atomic capture(A)
  !$acc end atomic
  !$acc atomic update(A)
  !$acc end atomic
  !$acc atomic read(A)
  !$acc end atomic
  !$acc atomic write(A)
  !$acc end atomic

  !The "do" should not highlight, if it does it's coming from OpenMP
  !$acc parallel do
  !The "do" here still should, since it is OpenMP
  !$omp parallel do

end program main