# Modern Fortran language support for VSCode

[![Build Status](https://travis-ci.org/krvajal/vscode-fortran-support.svg?branch=master)](https://travis-ci.org/krvajal/vscode-fortran-support)
[![codecov](https://codecov.io/gh/krvajal/vscode-fortran-support/branch/master/graph/badge.svg)](https://codecov.io/gh/krvajal/vscode-fortran-support)
[![MIT License](https://img.shields.io/npm/l/stack-overflow-copy-paste.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/krvajalm.linter-gfortran.svg)](https://marketplace.visualstudio.com/items?itemName=krvajalm.linter-gfortran)
[![GitHub release](https://img.shields.io/github/release/krvajal/vscode-fortran-support.svg)](https://GitHub.com/krvajal/vscode-fortran-support/releases/)

> This extension provides support for the Fortran programming language. It includes syntax highlighting, code snippets and a linting based on gfortran.

## Features

* Syntax highlighting
* Code Snippets
* Documentation on hover for intrisic functions
* Code linting based on `gfortran` to show errors swiggles in your code
* Code autocompletion (beta)
* Symbols provider

![symbol_nav](./doc/symbol_nav.png)

## Settings

You can control the include paths to be used by the linter with the `fortran.includePaths` setting.

```
{
    "fortran.includePaths": [
        "/usr/local/include",
         "/usr/local"
    ]
}
```

By default the `gfortran` executable is assumed to be found in the path. In order to use a different one or if it can't be found in the path you can point the extension to use a custom one with the `fortran.gfortranExecutable` setting.

```
{
    "fortran.gfortranExecutable": '/usr/local/bin/gfortran-4.7',
}
```

If you want to pass extra options to the `gfortran` executable or override the default one, you can use the setting `fortran.linterExtraArgs`. By default `-Wall` is the only option.

```
{
    "fortran.linterExtraArgs": ['-Wall'],
}
```

You can configure what kind of symbols will appear in the symbol list by using

```
{
    "fortran.symbols": [ "function", "subroutine"]
}
```

The available options are

* "function"
* "subroutine"
* "variable"
* "module" (not supported yet)
* "program" (not supported yet)

and by default only functions and subroutines are shown

## Snippets

This is a list of some of the snippets included, if you like to include some additionals snippets please let me know and I will add them.

#### Program skeleton

![program snippet](https://media.giphy.com/media/OYdq9BKYMOOdy/giphy.gif)

#### Module skeleton

![module snippet](https://media.giphy.com/media/3ohzdUNRuio5FfyF1u/giphy.gif)

## Error swiggles

To trigger code validations you must save the file first.

## Requirements

For the linter to work you need to have `gfortran` on your path, or wherever you configure it to be.

## Issues

Please report any issues and feature request on the github repo [here](https://github.com/krvajalmiguelangel/vscode-fortran-support/issues/new)

## Notice

The syntax highlight support was imported from [TextMate bundle](https://github.com/textmate/fortran.tmbundle)

The idea of using gfortran cames from this awesome [fortran plugin](https://github.com/315234/SublimeFortran) for Sublime Text.

## LICENSE

MIT
