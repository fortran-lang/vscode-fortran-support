# What's New (v3.0) <!-- omit in toc -->

🎉 We have migrated to **The Fortran Programming Language** Organization 🎉!

- [Linting](#linting)
  - [Intel OneAPI compilers](#intel-oneapi-compilers)
  - [Preprocessor warnings](#preprocessor-warnings)
- [Language Server `fortls`](#language-server-fortls)
  - [Multi Workspace and Single file support](#multi-workspace-and-single-file-support)
  - [Configuration file watcher](#configuration-file-watcher)
- [Commands](#commands)
- [Debug Hovering](#debug-hovering)
- [Deprecations](#deprecations)
  - [Visual Studio Code Extensions](#visual-studio-code-extensions)
  - [Visual Studio Code Settings](#visual-studio-code-settings)
- [Other](#other)

## Linting

The linting diagnostics have been improved, with supported being added for
the Intel's compilers, allowing custom compiler root paths and additional
diagnostic messages such as preprocessor warnings.

### Intel OneAPI compilers

Intel compilers are now supported set the following options in settings.json:

```json
{
  "fortran.linter.compiler": "ifort",
  "fortran.linter.compilerPath": "/path/to/intel/compilers/bin/ifort" // or ifx
}
```

![Intel Linting Diagnostics](https://raw.githubusercontent.com/fortran-lang/vscode-fortran-support/master/assets/docs/lint-intel-diagnostics.png)

### Preprocessor warnings

Preprocessor warnings and errors are now properly supported during linting

![Linting Diagnostics Preprocessor](https://raw.githubusercontent.com/fortran-lang/vscode-fortran-support/master/assets/docs/lint-intel-diagnostics-preproc.png)

## Language Server `fortls`

A lot of the higher level features like Hover, Go-To, Peeking definitions and
finding References are provided by Language Servers. _**Modern Fortran**_ now natively
supports the [`fortls`](https://gnikit.github.io/fortls) Language Server.

_**Modern Fortran**_ will prompt you to install `fortls` with `pip` upon initialization if
not detected in your system.

You can select a custom path to a `fortls` installation by setting the setting

```json
{
  "fortran.fortls.path": "/path/to/fortls"
}
```

Some options for `fortls` have explicit settings through _**Modern Fortran**_ settings,
like `fortran.fortls.notifyInit` and `fortran.fortls.incrementalSync`. You can
find a complete list of the explicit options in the `Feature Contributions` tab
of the _**Modern Fortran**_ extension.

In case there is no explicit setting for a `fortls` option, you can pass the
option to `fortls` through

```json
{
  "fortran.fortls.extraArgs": ["--nthreads=8", "--autocomplete_name_only"]
}
```

For more information about `fortls` configuration options see the
[`fortls` Documentation](https://gnikit.github.io/fortls/options.html#configuration-options)

### Multi Workspace and Single file support

It is now possible to have Language Server support with `fortls` for multiple
workspaces and single files. Simply open a standalone Fortran file and `fortls` or add a
folder to the workspace.

### Configuration file watcher

There are 2 ways of passing options to `fortls` either through the VS Code
`settings.json` or through the `fortls` configuration file.
`fortls` is listening for changes on both types of files and will pass them to the server
without having to restart.

> Warning: This feature is experimental if changes do not take effect you
> can always restart `fortls` through the Command Palette.

## Commands

Two convenience commands have been added, accessible from the Command Palette with
the prefix `Fortran:`

- Fortran: Restart the Fortran Language Server
- Fortran: Rescan Linter paths

## Debug Hovering

Debugging functionality was previously limited when it came to nested
user-defined types and hovering. This issue has been resolved and full
information about an object can be shown in the hover messages while debugging.

![Debugging Hover](https://raw.githubusercontent.com/fortran-lang/vscode-fortran-support/master/assets/gif/gdb_ani.gif)

## Deprecations

### Visual Studio Code Extensions

Due to the plethora of changes to the _**Modern Fortran**_ extension the following
VS Code extensions are redundant and no longer compatible with _**Modern Fortran**_:

- [FORTRAN IntelliSense](https://marketplace.visualstudio.com/items?itemName=hansec.fortran-ls): provided an interface for a now deprecated Language Server. It has been superseeded by `fortls` nad its native integration with _**Modern Fortran**_.
- [Fortran Breakpoint Support](https://marketplace.visualstudio.com/items?itemName=ekibun.fortranbreaker): is redundant and deprecated, _**Modern Fortran**_ has native breaking point support.
- [fortran](https://marketplace.visualstudio.com/items?itemName=Gimly81.fortran): is redundant and deprecated, _**Modern Fortran**_ has native support for Syntax Highlighting.
- External Formatters like [vscode-modern-fortran-formatter](https://marketplace.visualstudio.com/items?itemName=yukiuuh.vscode-modern-fortran-formatter) are redundant and deprecated, _**Modern Fortran**_ has native formatter support for `fprettify` and `findent`.

### Visual Studio Code Settings

The following settings have been deprecated are replaced by the following:

- `includePaths` in favour of `linter.includePaths`
- `gfortranExecutable` in favour of `linter.compilerPath`
- `linterEnabled` in favour of `linter.compiler == Disabled`
- `linterExtraArgs` in favour of `linter.extraArgs`
- `linterModOutput` in favour of `linter.modOutput`
- `ProvideSymbols` in favour of `provide.symbols`
- `symbols`
- `provideHover` in favour of `provide.hover`
- `provideCompletion` in favour of `provide.autocomplete`

## Other

There are a number of other bug fixes, feature enhancements and minor
improvements that have taken place in both the extension and the syntax highlighting. A brief list is shown below:

- Changed need for matching begin-end scope names, in the following constructs:
  Functions, Modules, Programs, Module Procedures, Subroutines, Submodules.
  For a more detailed explanation as to why see the issue
  ([#278](https://github.com/fortran-lang/vscode-fortran-support/issues/278))
- Changed `linter.compilerPath` to use the full path to the compiler instead of the root
  ([#500](https://github.com/fortran-lang/vscode-fortran-support/issues/500))
- Merged Language Server's log channel to Modern Fortran's log channel
- Fixed `error stop variable` syntax highlighting
  ([#486](https://github.com/fortran-lang/vscode-fortran-support/issues/486))
- Fixed issue with linter cache containing outdated folders
  ([#464](https://github.com/fortran-lang/vscode-fortran-support/issues/464))
- Fixed slow performance of very long lines by using a different solution for
  ([#207](https://github.com/fortran-lang/vscode-fortran-support/issues/207))
  ([#309](https://github.com/fortran-lang/vscode-fortran-support/issues/309))
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
