! Character with kind
subroutine test(s2)
  character(len=10) :: str
  character(kind=1, len=5) :: s1
  character(len=*) :: s2
  s1 = 1_"hello"
  s2 = "world"
end subroutine
