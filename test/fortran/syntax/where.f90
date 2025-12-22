program where_test
  implicit none
  real :: a(10), b(10)

  ! where statement
  where (a > 0) a = a + 1

  ! where construct
  where (a > 0)
    a = a + 1
  end where

  ! where with elsewhere
  where (a > 0)
    a = a + 1
  elsewhere
    a = 0
  end where

  ! where with elsewhere mask
  where (a > 0)
    a = a + 1
  elsewhere (a < -1)
    a = a - 1
  elsewhere
    a = 0
  end where

  ! labelled where
  label1: where (a > 0)
    a = a + 1
  end where label1

  ! labelled where with elsewhere
  label2: where (a > 0)
    a = a + 1
  elsewhere label2
    a = 0
  end where label2

  ! labelled where with elsewhere mask
  label3: where (a > 0)
    a = a + 1
  elsewhere (a < -1) label3
    a = a - 1
  elsewhere label3
    a = 0
  end where label3

  ! nested where
  where (a > 0)
    where (b > 0)
      a = a + 1
    end where
  end where

  ! where with continuation
  where (a > &
        0)
    a = a + 1
  end where

  ! multiple elsewhere
  where (a > 0)
    a = a + 1
  elsewhere (a == 0)
    a = 0
  else  where (a < 0)
    a = a - 1
  elsewhere
    a = 0
  end where

  ! where with comments
  where (a > 0) ! comment
    a = a + 1
  elsewhere ! comment
    a = 0
  end where

  ! labelled where with whitespace
  label4: where (a > 0)
    a = a + 1
  end where  label4

  ! nested labels
  where (a > 0)
    label5: where (b > 0)
      a = a + 1
    end where label5
  elsewhere
    a = 0
  end where

end program where_test
