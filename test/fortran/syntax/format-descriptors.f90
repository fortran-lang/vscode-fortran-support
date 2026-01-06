program format_descriptors_test
  ! 1. Integers (I, B, O, Z)
  100 format(I5, I10.5, B32.32, O20, Z16.16)
  
  ! 2. Reals (F, E, EN, ES, D, G)
  ! Note: EX is F2018. If your compiler supports it:
  ! 103 format(EX10.3) 
  101 format(F10.2, E12.4, EN12.4, ES12.4E3)
  102 format(D14.7, G15.5, G0, G0.8)

  ! 3. Logicals & Characters (L, A)
  104 format(L1, 2L5, A, A20)

  ! 4. Positioning & Control (T, TL, TR, X)
  105 format(T15, TL5, TR2, 1X, 4X)
  
  ! 5. Scale Factors (P)
  ! P can stand alone or precede a descriptor
  106 format(1P, -1P, 2P, 0P) 
  107 format(1PE12.4, -2PF10.5, 3PG15.5)
  ! Test Adjacency: Scale + Repeat + Descriptor
  108 format(1P2E12.4)     ! 1P (Scale) 2 (Repeat) E12.4 (Desc)

  ! 6. Sign, Blank, Rounding, Decimal Control
  109 format(S, SP, SS, BN, BZ)
  110 format(RU, RD, RZ, RN, RC, RP)
  111 format(DC, DP)

  ! 7. Derived Types (DT)
  112 format(DT, DT'type', DT"string"(10,5))

  ! 8. Separators & Terminators
  113 format(:, /, //)
  ! Extensions: $ (Suppress Newline)
  114 format($) 

  ! 9. Legacy / Edge Cases
  ! ---------------------------------
  ! Hollerith Constants (Legacy)
  ! " HELLO WORLD" is 12 chars
  201 format(12H HELLO WORLD, 1H1)
  
  ! False Positives / Ambiguity Strings
  ! These should highlight as strings, NOT descriptors
  203 format('EXP', 'END', 'Q') 
  
  ! Spacing robustness
  206 format( I 10, 1 P E 12. 4 )

end program format_descriptors_test
