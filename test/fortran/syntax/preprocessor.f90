! Preprocessor directives
#define MAX 100
program test
#ifdef DEBUG
  print *, "debug"
#else
  print *, "release"
#endif
#include "header.h"
  x = MAX
end program
