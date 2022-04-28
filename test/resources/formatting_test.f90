program main
implicit none
integer :: i, j
do i = 1, 5
do j = 1, 5
if (i == j) then
print *, i
end if
end do
end do
end program main