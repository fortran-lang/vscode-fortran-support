interface function_subroutine_definitions

  ! Normal subroutine
  subroutine sub( arg )
    integer, intent(inout) :: arg
  end subroutine

  ! Normal functions
  integer function fun_integer( arg ) result(val)
    integer, intent(inout) :: arg
  end function fun_integer

  real function fun_real( arg ) result(val)
    integer, intent(inout) :: arg
  end function fun_real

  logical function fun_logical( arg ) result(val)
    integer, intent(inout) :: arg
  end function fun_logical

  character(kind=1, len=100) function fun_character( arg ) result(val)
    integer, intent(inout) :: arg
  end function fun_character

  double precision function fun_double_precision( arg ) result(val)
    integer, intent(inout) :: arg
  end function fun_double_precision

  double complex function fun_double_complex( arg ) result(val)
    integer, intent(inout) :: arg
  end function fun_double_complex

  ! Weird edge cases where the keyword function/subroutine is also used as arguments
  function fun_with_fun(   function )
    integer, intent(inout) :: function
  end function fun_with_fun

  function fun_with_sub( subroutine )
    integer, intent(inout) :: subroutine
  end function fun_with_sub

  subroutine sub_with_sub(   subroutine  )
    integer, intent(inout) :: subroutine
  end subroutine sub_with_sub

  subroutine sub_with_fun( function )
    integer, intent(inout) :: function
  end subroutine sub_with_fun

end interface function_subroutine_definitions