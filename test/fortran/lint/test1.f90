module test
    intrinsic :: size
end module test

program test_literals
    use iso_c_binding
    use test, only: fsize => size

    implicit none
    integer(c_int) :: ierr
    integer :: i, j
    integer, allocatable :: a(:,:)
    a = reshape([1, 2, 3, 4, 5, 6], [2, 3])
    print*, size(a), size(a, 1), size(a, 2)
    print*, "loop over array ranks"
    do i = 1, size(a, 2)
        print*, a(:, i)
    end do
    print*, "end looping over array ranks"

    call foo(a, )
    contains
    subroutine foo(pair)
        integer, dimension(*), intent(in) :: pair
        print*, pair(1:6)
    end subroutine foo
end program test_literals
