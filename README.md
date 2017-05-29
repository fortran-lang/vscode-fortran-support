# Modern Fortran language support for VSCode

This extension provides support for the Fortran programming language. It includes syntax highlighting, code snippets and a linting based on gfortran.

## Features

* Syntax highlighting
* Code Snippets
* Documentation on hover for intrisic functions
* Code linting based on `gfortran` to show errors swiggles in your code
## Snippets
This are some of the snippets included 

#### Program skeleton

![program snippet](https://media.giphy.com/media/OYdq9BKYMOOdy/giphy.gif )

#### Module skeleton
![module snippet](https://media.giphy.com/media/3ohzdUNRuio5FfyF1u/giphy.gif )
## Requirements
For the linter to work you need to have `gfortran` on your path, or wherever you configure it to be.
## Issues
Please report any issues and feature request on the github repo [here](https://github.com/krvajalmiguelangel/vscode-fortran-support/issues/new)
## Notice
The syntax highlight support was imported from [TextMate bundle](https://github.com/textmate/fortran.tmbundle)

The idea of using gfortran cames from this awesome [fortran plugin](https://github.com/315234/SublimeFortran) for Sublime Text.
## LICENSE 
MIT