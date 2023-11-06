# Change Log

All notable changes to this extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

### Added

- Added syntax highlighting support for `sync` and `event` image control statements
  ([#874](https://github.com/fortran-lang/vscode-fortran-support/pull/874))
- Added schema support for fortls configuration files with autocopmletions
  ([#745](https://github.com/fortran-lang/vscode-fortran-support/issues/745))
- Added Nightly Release Channel for the extension that triggers every day at 00:00 UTC.
- Added new settings for disabling Linter initialization and display of initialization Diagnostics
  `fortran.linter.initialize` and `fortran.experimental.keepInitDiagnostics`
- Added commands for Initializing, Cleaning build artefacts and Clearing the Diagnostics from the Linter
- Added support for storing build artefacts in a separate cache directory
  ([#614](https://github.com/fortran-lang/vscode-fortran-support/issues/614))
- Added a naive initialization for Fortran source files present in the workspace.
  The implementation cannot deduce build order so it can partially work
  ([#680](https://github.com/fortran-lang/vscode-fortran-support/issues/680))
- Added User Interface tests for program installation
- Added option to disable Release Notes from being displayed
  ([#675](https://github.com/fortran-lang/vscode-fortran-support/issues/675))
- Added support for schema validation of `fpm.toml` files.
- Added local path resolution for `fortls`, `findent` and `fprettify` executables
  ([#667](https://github.com/fortran-lang/vscode-fortran-support/issues/667))
- Added support for variable resolution in `fortls`
  ([#664](https://github.com/fortran-lang/vscode-fortran-support/issues/664))
- Added Run and Debug buttons for single Fortran files based on linter settings
  ([#646](https://github.com/fortran-lang/vscode-fortran-support/issues/646))
- Added linter support for [LFortran](https://lfortran.org/)
  ([#589](https://github.com/fortran-lang/vscode-fortran-support/issues/589))
- Added coverage reporting using `c8`
  ([#613](https://github.com/fortran-lang/vscode-fortran-support/issues/613))
- Added support for enhanced `gfotran` v11+ diagnostics using `-fdiagnostics-plain-output`
  ([#523](https://github.com/fortran-lang/vscode-fortran-support/issues/523))
- Added language icons for Free and Fixed form Fortran
  ([#612](https://github.com/fortran-lang/vscode-fortran-support/issues/612))
- Added capability for linter options to update automatically when settings change
  ([#623](https://github.com/fortran-lang/vscode-fortran-support/pull/623))
- Added unittests for `spawnAsPromise` to increase test coverage
  ([#623](https://github.com/fortran-lang/vscode-fortran-support/pull/623))
- Added option to set the verbosity of the Output Channel
  ([#606](https://github.com/fortran-lang/vscode-fortran-support/pull/606))
- Added increased logging messages in various parts of the extension
  ([#606](https://github.com/fortran-lang/vscode-fortran-support/pull/606))

### Changed

- Changed the `npm vsce` package to `@vscode/vsce` for publishing
  ([#814](https://github.com/fortran-lang/vscode-fortran-support/issues/814))
- Changed logger to draw focus on certain error messages
  ([#744](https://github.com/fortran-lang/vscode-fortran-support/issues/744))
- Changed the way extension Release Notes are displayed
  ([#723](https://github.com/fortran-lang/vscode-fortran-support/issues/723))
- Changed the activation events of the extension to include the `onCommand` for all register commands
- Changed glob resolution module to `glob` from `fast-glob` due to bug #43
  ([#681](https://github.com/fortran-lang/vscode-fortran-support/issues/681))
- Changed how Python packages are installed for unittesting for performance
  ([#652](https://github.com/fortran-lang/vscode-fortran-support/issues/652))
- Changed the linter to be asynchronous, should imprpove performance
  ([#623](https://github.com/fortran-lang/vscode-fortran-support/pull/623))
- Changed native `SymbolProvider` to use non-deprecated constructor
  ([#623](https://github.com/fortran-lang/vscode-fortran-support/pull/623))
- Changed how caching is performed in the linter; generalised code and improved
  performance of the cache
  ([#611](https://github.com/fortran-lang/vscode-fortran-support/pull/611))
- Changed packaging download to use `vscode.Tasks`
  ([#608](https://github.com/fortran-lang/vscode-fortran-support/issues/608))
- Renamed the default repository branch from `master` to `main`
  ([#590](https://github.com/fortran-lang/vscode-fortran-support/issues/590))
- Changed the way messages are logged and added `log` syntax highlighting
  ([#606](https://github.com/fortran-lang/vscode-fortran-support/pull/606))
- Removes duplicate diagnostic messages from the linter
  ([#598](https://github.com/fortran-lang/vscode-fortran-support/issues/598))

### Fixed

- Fixed bug where specifying `-ffree-line-length-X` and `-ffixed-line-length-X`
  as `linter.extraArgs` would be overridden by the default behaviour of `fortls`
  ([#925](https://github.com/fortran-lang/vscode-fortran-support/issues/925))
- Fixed bug where linter would not use the correct Fortran file association
  if the extension was part of the default extensions of another Fortran lang ID
  ([#904](https://github.com/fortran-lang/vscode-fortran-support/issues/904))
- Fixed linter REGEX for GFortran 4.x.x
  ([#813](https://github.com/fortran-lang/vscode-fortran-support/issues/813))
- Fixed GFortran version regex to allow for semver + build metadata
  ([#813](https://github.com/fortran-lang/vscode-fortran-support/issues/813))
- Fixed broken badges and replaced them with shields.io
  ([#815](https://github.com/fortran-lang/vscode-fortran-support/issues/815))
- Fixed regular expression for parsing version of GFortran in linter
  ([#759](https://github.com/fortran-lang/vscode-fortran-support/issues/759))
- Fixed bug where diagnostic messages would linger from the previous state
  ([#706](https://github.com/fortran-lang/vscode-fortran-support/issues/706))
- Fixed activation bug on Windows causing the persistent cache to fail
  ([#700](https://github.com/fortran-lang/vscode-fortran-support/issues/700))
- Fixed bug where the linter's internal cache directory would not always exist
  ([#698](https://github.com/fortran-lang/vscode-fortran-support/issues/698))
- Fixed bugs in relative path resolution for `fortls`
  ([#693](https://github.com/fortran-lang/vscode-fortran-support/issues/693))
- Fixed issues with linter unittests running asynchronously
  ([#623](https://github.com/fortran-lang/vscode-fortran-support/pull/623))
- Fixed `npm run watch-dev` not syncing changes to spawned Extension Dev Host
  ([#602](https://github.com/fortran-lang/vscode-fortran-support/issues/602))

### Removed

- Dropped CI support for node.js 14.x
  ([#626](https://github.com/fortran-lang/vscode-fortran-support/issues/626))
- Removed unused tokenizer code
  ([#623](https://github.com/fortran-lang/vscode-fortran-support/pull/623))

## [3.2.0]

### Added

- Added NAG (`nagfor`) compiler support for linting
  ([#476](https://github.com/fortran-lang/vscode-fortran-support/issues/476))
- Added `Modern Fortran`, `fortls` and `fpm` as keywords to the extension
  ([#536](https://github.com/fortran-lang/vscode-fortran-support/issues/536))

### Changed

- Changed tests Fortran source code directory structures
  ([#563](https://github.com/fortran-lang/vscode-fortran-support/pull/563))
- Changed Free and Fixed Form language aliases. `Fortran` is now associated with `FortranFreeForm`
  ([#536](https://github.com/fortran-lang/vscode-fortran-support/issues/536))

### Fixed

- Fixed `linter.modOutput` not working with Intel Fortran Compilers
  ([#538](https://github.com/fortran-lang/vscode-fortran-support/issues/538))

## [3.1.0]

### Changed

- Version bumped to v3.1.0

## [3.0.0]

### Added

- Added `Whats New` page to be displayed upon update of the extension.
- Added `ifx` support Intel's LLVM based compiler `ifx`
- Added ability to rescan for linting include files.
- Added GitHub Actions support for pre-Release builds
  ([#459](https://github.com/fortran-lang/vscode-fortran-support/issues/459))
- Added unittest for `fortls` spawning and integration, checks for initialization values
  ([#422](https://github.com/fortran-lang/vscode-fortran-support/issues/422))
- Added warning notifications for extensions that interfere with Modern Fortran
  ([#458](https://github.com/fortran-lang/vscode-fortran-support/issues/458))
- Added single file and multiple workspace folder support for the Language Server
  ([#446](https://github.com/fortran-lang/vscode-fortran-support/issues/446))
- Added file synchronization with VS Code settings and `.fortls` against the Language Server
- Added unittests for the formatting providers
  ([#423](https://github.com/fortran-lang/vscode-fortran-support/issues/423))
- Added GitHub Actions environment to dependabot
- Adds support for Intel (ifort) and LLVM (flang) compilers
  ([#291](https://github.com/fortran-lang/vscode-fortran-support/issues/291))
- Adds native support for the fortran-language-server (`fortls`) making
  unnecessary the usage of Fortran Intellisense extension
  ([#290](https://github.com/fortran-lang/vscode-fortran-support/issues/290))
- Added command for restarting the Language Server
- Added more options for configuring the `fortls` settings through the UI

### Changed

- Prettified the format of the settings UI and added `fortls` options
- Changed images from SVG to PNG because `vsce` does not support SVG
  ([#510](https://github.com/fortran-lang/vscode-fortran-support/pull/510))
- Changed need for matching begin-end scope names, in the following constructs:
  Functions, Modules, Programs, Module Procedures, Subroutines, Submodules.
  For a more detailed explanation as to why see the issue
  ([#278](https://github.com/fortran-lang/vscode-fortran-support/issues/278))
- Rewrote README to include links to fortran-lang and other projects
  ([#485](https://github.com/fortran-lang/vscode-fortran-support/issues/485))
  ([#501](https://github.com/fortran-lang/vscode-fortran-support/issues/501))
- Changed `linter.compilerPath` to use the full path to the compiler instead of the root
  ([#500](https://github.com/fortran-lang/vscode-fortran-support/issues/500))
- Changed all instances of the publisher to `fortran-lang`
  ([#450](https://github.com/fortran-lang/vscode-fortran-support/issues/450))
- Updated grammar unittests to include scope injections
- Merged Language Server's log channel to Modern Fortran's log channel
- Merged all Fortran intrinsics into a single `json` file
  ([#424](https://github.com/fortran-lang/vscode-fortran-support/issues/424))
- Updates `README` text and animations, changes `SECURITY` and updates `package.json`
- Changes the interface of the extension to accommodate for the newest features
  ([#292](https://github.com/fortran-lang/vscode-fortran-support/issues/292))
- Changes main parts of the extension to being asynchronous
  ([#285](https://github.com/fortran-lang/vscode-fortran-support/issues/285))
- Changes Language Server prompt from `fortran-language-server` to `fortls`
- Updates VS Code engine to handle `vsce --pre-release`

### Removed

- Made redundant the use of FORTRAN Intellisense extension
  ([#290](https://github.com/fortran-lang/vscode-fortran-support/issues/290))
- Removed setting `includePaths` in favour of `linter.includePaths`
- Removed setting `gfortranExecutable` in favour of `linter.compilerPath`
- Removed setting `linterEnabled` in favour of `linter.compiler == Disabled`
- Removed setting `linterExtraArgs` in favour of `linter.extraArgs`
- Removed setting `linterModOutput` in favour of `linter.modOutput`
- Removed setting `ProvideSymbols` in favour of `provide.symbols`
- Removed setting `symbols`
- Removed setting `provideHover` in favour of `provide.hover`
- Removed setting `provideCompletion` in favour of `provide.autocomplete`

### Fixed

- Fixed formatter output mixes stdout and stderr
  ([#517](https://github.com/fortran-lang/vscode-fortran-support/issues/517))
- Fixed `error stop variable` syntax highlighting
  ([#486](https://github.com/fortran-lang/vscode-fortran-support/issues/486))
- Fixed issue with linter cache containing outdated folders
  ([#464](https://github.com/fortran-lang/vscode-fortran-support/issues/464))
- Fixed slow performance of very long lines by using a different solution for
  ([#207](https://github.com/fortran-lang/vscode-fortran-support/issues/207))
  ([#309](https://github.com/fortran-lang/vscode-fortran-support/issues/309))
- Fixed hovering over user defined types while debugging
  ([#426](https://github.com/fortran-lang/vscode-fortran-support/issues/426))
- Fixes linting regex to capture a wider spectrum of errors
  ([#295](https://github.com/fortran-lang/vscode-fortran-support/issues/295))
- Fixes linter activation from `Disabled` to some compiler `X` without having
  to restart the extension
  ([#296](https://github.com/fortran-lang/vscode-fortran-support/issues/296))
- Fixes nopass pointer erroneous syntax highlighting
  ([#318](https://github.com/fortran-lang/vscode-fortran-support/issues/318))
- Fixes `%` accessor highlighting for type-bound subroutines
  ([#325](https://github.com/fortran-lang/vscode-fortran-support/issues/325))
- Fixes `fortls` not spawning when `ignoreWarning` was set to true
  ([#365](https://github.com/fortran-lang/vscode-fortran-support/issues/365))
- Fixes formatting on Windows (needed .exe extension)
  ([#354](https://github.com/fortran-lang/vscode-fortran-support/issues/354))
- Fixes `onSave` formatting errors
  ([#364](https://github.com/fortran-lang/vscode-fortran-support/issues/364))

### Security

- Updated node dependencies to the latest version
- Update GitHub Actions workflows to the latest version

## [2.6.2]

### Added

- Adds Don't Show Again option when failing to spawn `fortls`, Fortran Intellisense
  pop-up has already been removed
  ([#303](https://github.com/fortran-lang/vscode-fortran-support/issues/303))

## [2.6.1]

### Fixed

- Fixes log channel not initialising when extension fails to activate
  ([#286](https://github.com/fortran-lang/vscode-fortran-support/issues/286))

## [2.6.0]

### Added

- Adds support for variable and path interpolation along with glob expressions
  ([#231](https://github.com/fortran-lang/vscode-fortran-support/issues/231))
  ([#86](https://github.com/fortran-lang/vscode-fortran-support/issues/86))
- Adds explicit option `linterModOutput` for module output
  ([#176](https://github.com/fortran-lang/vscode-fortran-support/issues/176))

## [2.5.0]

### Added

- Adds support for formatting with `findent` and `fprettify`
  ([#29](https://github.com/fortran-lang/vscode-fortran-support/issues/29))

## [2.4.3]

### Changed

- Changed from `tslint` to `eslint` and `prettier` to format ts, json, md files
  ([#260](https://github.com/fortran-lang/vscode-fortran-support/issues/260))

## [2.4.2]

### Fixed

- Extension now activates for `FortranFixedForm`
  ([#257](https://github.com/fortran-lang/vscode-fortran-support/issues/257))
- Linting is now operational for `FortranFixedForm`
  ([#258](https://github.com/fortran-lang/vscode-fortran-support/issues/258))
- Fixes dummy variable list erroneous syntax highlighting
  ([#264](https://github.com/fortran-lang/vscode-fortran-support/issues/264))

### Changed

- Renamed the Fixed Format Format language from `fortran_fixed-form` to
  `FortranFixedForm`, an alias has been added for backwards compatibility
  ([#259](https://github.com/fortran-lang/vscode-fortran-support/issues/259))

### Added

- Adds prompts for installing Fortran IntelliSense and fortran-language-server

### Removed

- Removes `paths.js` for detecting binaries in favour of `which`

## [2.4.1]

### Fixed

- Fixes dummy variable list erroneous syntax highlighting
  ([#264](https://github.com/fortran-lang/vscode-fortran-support/issues/264))

## [2.4.0]

### Changed

- Changes the syntax highlighting of preprocessor macros to match that of C++
- Changes npm `vscode` module to `@types/vscode` and `@vscode/test-electron`
  ([#263](https://github.com/fortran-lang/vscode-fortran-support/issues/263))

### Fixed

- Fixes OpenACC syntax highlighting not triggering
- Fixes internal hover documentation display
  ([#205](https://github.com/fortran-lang/vscode-fortran-support/issues/205))
- Fixes preprocessor syntax highlighting with line continuations
  ([#248](https://github.com/fortran-lang/vscode-fortran-support/issues/248))
- Fixes preprocessor syntax highlighting with derived type and conditionals
  ([#249](https://github.com/fortran-lang/vscode-fortran-support/issues/249))
- Fixes the general preprocessor syntax highlighting and adds testing
- Fixes using function/subroutine as parameter in functions/subroutines
  ([#207](https://github.com/fortran-lang/vscode-fortran-support/issues/207))
- Fixes labelled conditionals erroneous highlighting
  ([#204](https://github.com/fortran-lang/vscode-fortran-support/issues/204))
- Fixes labelled conditionals erroneous highlighting when followed by whitespace
  ([#205](https://github.com/fortran-lang/vscode-fortran-support/issues/205))
- Fixes labelled `stop` conditions
  ([#172](https://github.com/fortran-lang/vscode-fortran-support/issues/172))
- Fixes incorrect comment capture for type, abstract|extends types
  ([#262](https://github.com/fortran-lang/vscode-fortran-support/issues/262))

### Added

- Adds support for .f18 and .F18 file extensions
  ([#252](https://github.com/fortran-lang/vscode-fortran-support/pull/252))
- Adds workflow for automatic publishing to VS Marketplace
  ([#237](https://github.com/fortran-lang/vscode-fortran-support/issues/237))
- Adds basic support for pFUnit (.pf) highlighting
  ([#185](https://github.com/fortran-lang/vscode-fortran-support/issues/185))

## [2.3.0]

### Fixed

- Fixes line continuation syntax highlighting for OpenMP
  ([#225](https://github.com/fortran-lang/vscode-fortran-support/issues/225))

### Changed

- Fixes syntax highlighting for nested case-select constructs
  ([#181](https://github.com/fortran-lang/vscode-fortran-support/issues/181)) via
  ([#218](https://github.com/fortran-lang/vscode-fortran-support/pull/218))

### Added

- Added syntax highlight support for OpenACC
  ([#224](https://github.com/fortran-lang/vscode-fortran-support/pull/224))

## [2.2.2] - 2020-12-11

### Fixed

- Fixed fixed-form tab character at start syntax highlighting
  ([#191](https://github.com/fortran-lang/vscode-fortran-support/pull/191))
- Fixed `class` paranthesis erroneous syntax highlighting
  ([#196](https://github.com/fortran-lang/vscode-fortran-support/issues/196))
- Fixed multiline block interface syntax highlighting
  ([#202](https://github.com/fortran-lang/vscode-fortran-support/issues/202))

### Changed

- Updated `package.json`
  ([#192](https://github.com/fortran-lang/vscode-fortran-support/pull/192))
- Rewrote solution for `select` in variable name
  ([#203](https://github.com/fortran-lang/vscode-fortran-support/pull/203))

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

[unreleased]: https://github.com/fortran-lang/vscode-fortran-support/compare/v3.0....HEAD
[3.2.0]: https://github.com/fortran-lang/vscode-fortran-support/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/fortran-lang/vscode-fortran-support/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/fortran-lang/vscode-fortran-support/compare/v2.6.2...v3.0.0
[2.6.2]: https://github.com/fortran-lang/vscode-fortran-support/compare/v2.6.1...v2.6.2
[2.6.1]: https://github.com/fortran-lang/vscode-fortran-support/compare/v2.6.0...v2.6.1
[2.6.0]: https://github.com/fortran-lang/vscode-fortran-support/compare/v2.5.0...v2.6.0
[2.5.0]: https://github.com/fortran-lang/vscode-fortran-support/compare/v2.4.3...v2.5.0
[2.4.3]: https://github.com/fortran-lang/vscode-fortran-support/compare/v2.4.2...v2.4.3
[2.4.2]: https://github.com/fortran-lang/vscode-fortran-support/compare/v2.4.1...v2.4.2
[2.4.1]: https://github.com/fortran-lang/vscode-fortran-support/compare/v2.4.0...v2.4.1
[2.4.0]: https://github.com/fortran-lang/vscode-fortran-support/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/fortran-lang/vscode-fortran-support/compare/v2.2.2...v2.3.0
[2.2.2]: https://github.com/fortran-lang/vscode-fortran-support/compare/2.2.1...v2.2.1
[2.2.1]: https://github.com/fortran-lang/vscode-fortran-support/compare/2.2.0...v2.2.1
[2.2.0]: https://github.com/fortran-lang/vscode-fortran-support/compare/2.1.0...v2.2.0
[2.1.0]: https://github.com/fortran-lang/vscode-fortran-support/compare/2.0.2...2.1.0
[2.0.2]: https://github.com/fortran-lang/vscode-fortran-support/compare/2.0.0...2.0.2
[2.0.0]: https://github.com/fortran-lang/vscode-fortran-support/compare/v1.3.0...v2.0.0
[1.3.0]: https://github.com/fortran-lang/vscode-fortran-support/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/fortran-lang/vscode-fortran-support/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/fortran-lang/vscode-fortran-support/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/fortran-lang/vscode-fortran-support/compare/v0.6.3...v1.0.0
[0.6.3]: https://github.com/fortran-lang/vscode-fortran-support/compare/v0.6.1...v0.6.3
[0.6.1]: https://github.com/fortran-lang/vscode-fortran-support/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/fortran-lang/vscode-fortran-support/compare/v0.4.5...v0.6.0
[0.4.5]: https://github.com/fortran-lang/vscode-fortran-support/compare/v0.4.4...v0.4.5
[0.4.4]: https://github.com/fortran-lang/vscode-fortran-support/compare/tag/v0.4.4
