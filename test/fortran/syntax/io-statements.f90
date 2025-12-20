! I/O statements
program test
  read(*, *) x, y
  write(*, '(I5)') n
  print *, 'Hello'

  open(unit=10, file='data.txt', status='old', action='read')
  read(10, *) value
  close(10)

  write(unit=20, fmt=100, iostat=ios) x
100 format(F10.3)

  read(5, *, end=999, err=888) a, b
888 print *, 'Error'
999 continue
end program
