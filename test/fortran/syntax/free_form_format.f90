program mwe
1002 format &
       (/,'At iterate',i5,4x,'f= ',1p,d12.5,4x,'|proj g|= ',1p,d12.5)

      1003 format &
       (/,'At iterate',i5,4x,'f= ',1p,d12.5,4x,'|proj g|= ',1p,d12.5)

        INTEGER I, J, A(2,5), B(2)
        OPEN (unit=2, access='sequential', file='FOR002.DAT')

        READ (2,100) (B(I), (A(I,J), J=1,5),I=1,2) 
 
  100   FORMAT (2 (I3, X, 5(I4,X), /) ) 
 
        WRITE (6,999) B, ((A(I,J),J=1,5),I=1,2) 

  999   FORMAT (' B is ', 2(I3, X), ';  A is', / (' ', 5 (I4, X)) )

        READ (2,200) (B(I), (A(I,J), J=1,5),I=1,2) 

  200   FORMAT (2 (I3, X, 5(I4,X), :/) )
        WRITE (6,999) B, ((A(I,J),J=1,5),I=1,2)  

        READ (2,300) (B(I), (A(I,J), J=1,5),I=1,2)  

  300   FORMAT ( (I3, X, 5(I4,X)) )

        WRITE (6,999) B, ((A(I,J),J=1,5),I=1,2) 

        READ (2,400) (B(I), (A(I,J), J=1,5),I=1,2) 

  400   FORMAT ( I3, X, 5(I4,X) )

        WRITE (6,999) B, ((A(I,J),J=1,5),I=1,2) 

end program mwe
