module err_mod
    private
    implicit none
    contains
        subroutine foo(arg1, arg2)
            integer, intent(in) :: arg1, arg2
            print*, 'arg1:', arg1, 'arg2:', arg2
        end subroutine foo
        subroutine proc_with_err()
            call foo()
        end subroutine proc_with_err
end module err_mod
