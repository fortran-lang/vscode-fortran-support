! Do loop variations
program test
  do i = 1, 10
    x = i
  end do

  do i = 1, 10, 2
  end do

  do while (x > 0)
    x = x - 1
  end do

  do concurrent (i = 1:n)
    a(i) = i
  end do

  outer: do i = 1, 5
    inner: do j = 1, 3
      if (j == 2) cycle inner
      if (i == 3) exit outer
    end do inner
  end do outer
end program
