! if
if (1 > 2) then
end if

! if-else
if (1 > 2) then
else
end if

! if-else-if-else
if (1 > 2) then
else if (2 < 1) then
else
end if

! labelled if
label1: if (1 > 2) then
end if label1

! labelled if-else
label2: if (1 > 2) then
else label2
end if label2

! labelled if-else-if-else
label3: if (1 > 2) then  ! comment1
else if (2 < 1) then label3 ! comment2
else label3  ! comment3
end if label3  ! comment4

! labelled if with whitespace after end label
label4: if (1 > 2) then
end if  label4   ! bug continuous to new line

! nested labels with whitespaces
if (1 > 2) then
   label5: if (1) then
   end if label5 !
else
! whitespace in the "end if label5 " causes else to be incorrect
end if

! stop
if (1) stop
if (1) stop label6
if (1) stop "label"//"7"

! do loop
do i = 1, 10
end do

! labelled do loop
label8: do i = 1, 10
end do label8

