#if   defined(PETSC_USING_F90) && !defined(PETSC_USE_FORTRANKIND)
#define PetscObjectState 1
#elif defined(PETSC_USING_F90) || !defined(PETSC_USE_FORTRANKIND)
#define PetscObjectState 0
#endif /* a comment */

#define zoltan_mpi_id_datatype_name "MPI_UNSIGNED"
#define ZOLTAN_ID_CONSTANT(z)  z

! Testing C++ numeric literals
#if defined(__STDC_VERSION__)
#  if (__STDC_VERSION__ >= 199901L)
#    define ZOLTAN_GNO_SPEC   "%zd"
#  else
#    define ZOLTAN_GNO_SPEC   "%ld"
#  endif
#else
#  define ZOLTAN_GNO_SPEC   "%ld"
#endif

#if defined (__sun) || defined(MSOL2) || defined (ARCH_SOL2)
#define CHOLMOD_SOL2
#define CHOLMOD_ARCHITECTURE "Sun Solaris"

#elif defined (__linux) || defined(MGLNX86) || defined (ARCH_GLNX86)
#define CHOLMOD_LINUX
#define CHOLMOD_ARCHITECTURE "Linux"

#elif defined(__APPLE__)
#define CHOLMOD_MAC
#define CHOLMOD_ARCHITECTURE "Mac"

#else
! /* If the architecture is unknown, and you call the BLAS, you may need to */
! /* define BLAS_BY_VALUE, BLAS_NO_UNDERSCORE, and/or BLAS_CHAR_ARG yourself. */
#define CHOLMOD_ARCHITECTURE "unknown"
#endif

program main
   implicit none


   type logical_vector
#ifdef DEBUG
   logical, dimension(:), pointer :: ptr=>null()
#else
   logical, dimension(:), pointer :: ptr
#endif
   end type logical_vector

   real &
#ifdef DEBUG
   , target,
#endif
   :: val(3)

! Tests ifndef, include, endif, define
#ifndef Var1
#include "header.h"
#endif
#define Var2 2

! Test equality logical operators
#if   Var1 == Var2
#define OP 1
#elif Var1 != Var2
#define OP 2
#elif Var1 <= Var2
#define OP 3
#elif Var1 >= Var2
#define OP 4
#endif
#undef OP

! Test comparative logical operators
#if   Var1 <  Var2
#define OP 1
#elif Var1 <= Var2
#define OP 2
#endif
#undef OP

! Test arithmetic operators
#if   Var1 == Var1 + 1
#elif Var1 == Var1 - 1
#elif Var1 == Var1 * 1
#elif Var1 == Var1 / 1
#endif

! Test line continuation
#if !defined( \
   PETSC_USING_F90) \
&& \
!defined(PETSC_USE_FORTRANKIND)
#define Var3 \
   1
#undef \
   Var1
#endif

! --------------------!
! and   : &&  ! valid !
! bitand: &   ! valid !
! bitor : |   ! valid !
! not   : !   ! valid !
! not_eq: !=  ! valid !
! or    : ||  ! valid !
! xor   : ^   ! valid !
! compl : ~   ! valid !
! --------------------!
#if 2 | -3
print*, 'OR  (|) operator'
#endif

#if 2 ^ -3
print*, 'XOR (^) operator'
#endif

#if 2&2
print*, 'AND (&) operator'
#endif

#if !(2&-3)
print*, 'NOT (!) operator'
#endif

#if 2 != 3
print*, 'NOT EQUAL (!=) operator'
#endif

#if ~2 == -3
print*, 'complement (~) operator'
#endif

! and_eq , &=  ! not valid
! or_eq  , |=  ! not valid
! xor_eq , ^=  ! not valid

end program main