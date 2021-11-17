# Change Log

All notable changes to this extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [2.6.1]

### Fixed

- Fixes log channel not initialising when extension fails to activate
  ([#286](https://github.com/krvajal/vscode-fortran-support/issues/286))

## [2.6.0]

### Added

- Adds support for variable and path interpolation along with glob expressions
  ([#231](https://github.com/krvajal/vscode-fortran-support/issues/231))
  ([#86](https://github.com/krvajal/vscode-fortran-support/issues/86))
- Adds explicit option `linterModOutput` for module output
  ([#176](https://github.com/krvajal/vscode-fortran-support/issues/176))

## [2.5.0]

### Added

- Adds support for formatting with `findent` and `fprettify`
  ([#29](https://github.com/krvajal/vscode-fortran-support/issues/29))

## [2.4.3]

### Changed

- Changed from `tslint` to `eslint` and `prettier` to format ts, json, md files
  ([#260](https://github.com/krvajal/vscode-fortran-support/issues/260))

## [2.4.2]

### Fixed

- Extension now activates for `FortranFixedForm`
  ([#257](https://github.com/krvajal/vscode-fortran-support/issues/257))
- Linting is now operational for `FortranFixedForm`
  ([#258](https://github.com/krvajal/vscode-fortran-support/issues/258))
- Fixes dummy variable list erroneous syntax highlighting
  ([#264](https://github.com/krvajal/vscode-fortran-support/issues/264))

### Changed

- Renamed the Fixed Format Format language from `fortran_fixed-form` to
  `FortranFixedForm`, an alias has been added for backwards compatibility
  ([#259](https://github.com/krvajal/vscode-fortran-support/issues/259))

### Added

- Adds prompts for installing Fortran IntelliSense and fortran-language-server

### Removed

- Removes `paths.js` for detecting binaries in favour of `which`

## [2.4.1]

### Fixed

- Fixes dummy variable list erroneous syntax highlighting
  ([#264](https://github.com/krvajal/vscode-fortran-support/issues/264))

## [2.4.0]

### Changed

- Changes the syntax highlighting of preprocessor macros to match that of C++
- Changes npm `vscode` module to `@types/vscode` and `@vscode/test-electron`
  ([#263](https://github.com/krvajal/vscode-fortran-support/issues/263))

### Fixed

- Fixes OpenACC syntax highlighting not triggering
- Fixes internal hover documentation display
  ([#205](https://github.com/krvajal/vscode-fortran-support/issues/205))
- Fixes preprocessor syntax highlighting with line continuations
  ([#248](https://github.com/krvajal/vscode-fortran-support/issues/248))
- Fixes preprocessor syntax highlighting with derived type and conditionals
  ([#249](https://github.com/krvajal/vscode-fortran-support/issues/249))
- Fixes the general preprocessor syntax highlighting and adds testing
- Fixes using function/subroutine as parameter in functions/subroutines
  ([#207](https://github.com/krvajal/vscode-fortran-support/issues/207))
- Fixes labelled conditionals erroneous highlighting
  ([#204](https://github.com/krvajal/vscode-fortran-support/issues/204))
- Fixes labelled conditionals erroneous highlighting when followed by whitespace
  ([#205](https://github.com/krvajal/vscode-fortran-support/issues/205))
- Fixes labelled `stop` conditions
  ([#172](https://github.com/krvajal/vscode-fortran-support/issues/172))
- Fixes incorrect comment capture for type, abstract|extends types
  ([#262](https://github.com/krvajal/vscode-fortran-support/issues/262))

### Added

- Adds support for .f18 and .F18 file extensions
  ([#252](https://github.com/krvajal/vscode-fortran-support/pull/252))
- Adds workflow for automatic publishing to VS Marketplace
  ([#237](https://github.com/krvajal/vscode-fortran-support/issues/237))
- Adds basic support for pFUnit (.pf) highlighting
  ([#185](https://github.com/krvajal/vscode-fortran-support/issues/185))

## [2.3.0]

### Fixed

- Fixes line continuation syntax highlighting for OpenMP
  ([#225](https://github.com/krvajal/vscode-fortran-support/issues/225))

### Changed

- Fixes syntax highlighting for nested case-select constructs
  ([#181](https://github.com/krvajal/vscode-fortran-support/issues/181)) via
  ([#218](https://github.com/krvajal/vscode-fortran-support/pull/218))

### Added

- Added syntax highlight support for OpenACC
  ([#224](https://github.com/krvajal/vscode-fortran-support/pull/224))

## [2.2.2] - 2020-12-11

### Fixed

- Fixed fixed-form tab character at start syntax highlighting
  ([#191](https://github.com/krvajal/vscode-fortran-support/pull/191))
- Fixed `class` paranthesis erroneous syntax highlighting
  ([#196](https://github.com/krvajal/vscode-fortran-support/issues/196))
- Fixed multiline block interface syntax highlighting
  ([#202](https://github.com/krvajal/vscode-fortran-support/issues/202))

### Changed

- Updated `package.json`
  ([#192](https://github.com/krvajal/vscode-fortran-support/pull/192))
- Rewrote solution for `select` in variable name
  ([#203](https://github.com/krvajal/vscode-fortran-support/pull/203))

## [2.2.1] - 2020-04-11

### Fixed

- Add capability to set breakpoints (#89)

## [2.2.0] - 2020-04-11

### Changed

- Improve syntax highlight (#149, #166, #169)
- Fix Symbols in VSCode ^1.4x (#154, #140, #151)
- Dependencies Update (#144, #146, #155)
- Improve code completion (#148)

### Added

- More custom settings (#152)
- Breakpoints support (#150)

## [2.1.1] - 2019-06-03

### Changed

- Improve syntax highlight (#128, #127)
- Improve Paths to linter (#124)
- Improve environment processing (#126)

### Added

- New snippets (#104)

## [2.1.0] - 2019-03-26

### Changed

- Improve usage of Linter on Windows 10 (#116)
- Improve identation (#115)
- Improve highlight (#110)
- Temporary remove configuration for experimental support of Fortran Language Server (#105)

### Added

- New intrinsics from [GFortran docs](https://gcc.gnu.org/onlinedocs/gfortran/Intrinsic-Procedures.html#Intrinsic-Procedures) (#113)

## [2.0.2] - 2018-11-28

### Changed

- Fixed wrong language on gfortran messages (#101)

### Added

- Extensions `.for`, `.FOR` and `.fpp` added to fixed-form highlight (#97)
- Extend syntax highlighting (#106,#109)
- Comments enable on fixed-form (#100)

## [2.0.1] - 2018-10-18

### Changed

- Changed default configuration of LanguageServer to `false`
- Update vscode minimal engine

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

## [0.1.0]

- Initial release

[unreleased]: https://github.com/krvajal/vscode-fortran-support/compare/v2.6.1...HEAD
[2.6.1]: https://github.com/krvajal/vscode-fortran-support/compare/v2.6.0...v2.6.1
[2.6.0]: https://github.com/krvajal/vscode-fortran-support/compare/v2.5.0...v2.6.0
[2.5.0]: https://github.com/krvajal/vscode-fortran-support/compare/v2.4.3...v2.5.0
[2.4.3]: https://github.com/krvajal/vscode-fortran-support/compare/v2.4.2...v2.4.3
[2.4.2]: https://github.com/krvajal/vscode-fortran-support/compare/v2.4.1...v2.4.2
[2.4.1]: https://github.com/krvajal/vscode-fortran-support/compare/v2.4.0...v2.4.1
[2.4.0]: https://github.com/krvajal/vscode-fortran-support/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/krvajal/vscode-fortran-support/compare/v2.2.2...v2.3.0
[2.2.2]: https://github.com/krvajal/vscode-fortran-support/compare/2.2.1...v2.2.1
[2.2.1]: https://github.com/krvajal/vscode-fortran-support/compare/2.2.0...v2.2.1
[2.2.0]: https://github.com/krvajal/vscode-fortran-support/compare/2.1.0...v2.2.0
[2.1.0]: https://github.com/krvajal/vscode-fortran-support/compare/2.0.2...2.1.0
[2.0.2]: https://github.com/krvajal/vscode-fortran-support/compare/2.0.0...2.0.2
[2.0.0]: https://github.com/krvajal/vscode-fortran-support/compare/v1.3.0...v2.0.0
[1.3.0]: https://github.com/krvajal/vscode-fortran-support/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/krvajal/vscode-fortran-support/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/krvajal/vscode-fortran-support/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/krvajal/vscode-fortran-support/compare/v0.6.3...v1.0.0
[0.6.3]: https://github.com/krvajal/vscode-fortran-support/compare/v0.6.1...v0.6.3
[0.6.1]: https://github.com/krvajal/vscode-fortran-support/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/krvajal/vscode-fortran-support/compare/v0.4.5...v0.6.0
[0.4.5]: https://github.com/krvajal/vscode-fortran-support/compare/v0.4.4...v0.4.5
[0.4.4]: https://github.com/krvajal/vscode-fortran-support/compare/tag/v0.4.4
