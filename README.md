# Modern Fortran language support for VSCode

This extension provides support for the Fortran programming language. It includes syntax highlighting, code snippets and a linting based on gfortran.

## Features

* Syntax highlighting
* Code Snippets
* Documentation on hover for intrisic functions
* Code linting based on `gfortran` to show errors swiggles in your code
## Settings

You can control the include paths to be used by the linter with the `fortran.includePaths` setting.
```
{
    "fortran.includePath": [
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


## Snippets
This is a list of some of the snippets included, if you like to include some additionals snippets please let me know and I will add them.
#### Program skeleton
![program snippet](https://media.giphy.com/media/OYdq9BKYMOOdy/giphy.gif )
#### Module skeleton
![module snippet](https://media.giphy.com/media/3ohzdUNRuio5FfyF1u/giphy.gif )

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