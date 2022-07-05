# What's New (v3.2) <!-- omit in toc -->

## 🎉 Modern Fortran Release of v3.2 🎉! <!-- omit in toc -->

- [Linting](#linting)
- [Other Changes](#other-changes)
  - [Added](#added)
  - [Changed](#changed)
  - [Fixed](#fixed)

## Linting

Added linting support for [NAG](https://www.nag.com/content/nag-fortran-compiler)'s
`nagfor` compiler. Compiler diagnostics should now be served via the _Modern Fortran_ linter.

## Other Changes

### Added

- Added `Modern Fortran`, `fortls` and `fpm` as keywords to the extension ([#536](https://github.com/fortran-lang/vscode-fortran-support/issues/536))

### Changed

- Changed Free and Fixed Form language aliases. `Fortran` is now associated with `FortranFreeForm` ([#536](https://github.com/fortran-lang/vscode-fortran-support/issues/536))

### Fixed

- Fixed `linter.modOutput` not working with Intel Fortran Compilers ([#538](https://github.com/fortran-lang/vscode-fortran-support/issues/538))
