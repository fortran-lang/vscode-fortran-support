# Change Log

All notable changes to this extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [2.0.0] - 2018-10-14

### Added

- Syntax highlight for `forall` construct (#82)
- Add experimental support for the [Fortran Language Server](https://github.com/hansec/fortran-language-server)
- Added the option to specify the casing to use when providing autocompletion options (Fixes #35)

### Changed

- Updated the minimum supported version of VS Code to 1.22.0
- Internal changes and cleanup

## [1.3.1] - 2018-06-26

### Fixed

- Subroutine and function on symbol list were failing with more than one line arguments (#71)
- Minor syntax highlighting issues (#62, #73)

### Added

- Implementation of OpenMP directives highlighting (#17)
- Syntax highlight on multiple line of dummy arguments

## [1.2.0] - 2018-05-25

### Fixed

- Linter was broken in previous version (#55)
- Symbol listing was failing for subroutine without brackets (#61)

### Added

- Improved indentation rules (#57)
- Better syntax highlighting of module names (#51)

## [1.1.0] - 2018-04-16

### Fixed

- Regression bug in the last release (#44)

### Added

- Improvements on preprocessor directives highlighting

## [1.0.1] - 2018-03-19

### Fixed

- Syntax highlighting issues (#32, #34, #36, #37, #38, #39, #41 )

## [0.6.3] - 2018-01-27

### Added

- Configuration option to set types of symbols shown

### Fixed

- Implementation of the symbol provider now returns a promise (Fixes #21)
- Symbol provider now ignores case when searching for subroutines

## [0.6.2] - 2018-01-01

### Added

- Auto indentation rules for code blocks (thx @graceyangfan for the feature request)

### Fixed

- Fixed some highlighting issues by @pedro-ricardo

## [0.5.2] - 2017-07-14

### Fixed

- A bug in the regex to parse output errors from `gfortran`
- Now the spawn command uses the directory of the file `gfortran` is analyzing

## [0.5.1] - 2017-07-06

### Added

- Add `Go -> Go to symbol in file` command support for functions

## [0.5.0] - 2017-07-06

### Added

- Add code autocompletion for intrinsic and in document declared functions

## [0.4.6] - 2017-07-04

### Added

- Add support for user configuration settings

## [0.4.5] - 2017-07-04

### Fixed

- Fix intrinsic functions docs not loading

## [0.4.4] - 2017-07-03

### Added

- Add support for old fortran languague
  ### Fixed
- Fix bug #1

## [0.4.0] - 2017-05-29

### Added

- Show docs for intrinsic functions on hover
  ### Changed
- Updated icon for the extension
- Fix bug on linter not working

## [Unreleased]

- Initial release
