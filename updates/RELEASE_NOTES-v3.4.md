# What's New (PRE RELEASE) <!-- omit in toc -->

## 🎉 Modern Fortran Release of v3.3 🎉! <!-- omit in toc -->

- [Run and Debug individual files](#run-and-debug-individual-files)
- [LFortran Linter support](#lfortran-linter-support)
- [Log Channel improvements](#log-channel-improvements)
  - [Colourized Logs](#colourized-logs)
  - [Setting verbosity level](#setting-verbosity-level)
- [Improved Installation of dependencies using VS Code Tasks](#improved-installation-of-dependencies-using-vs-code-tasks)
- [`fypp` linting support](#fypp-linting-support)
- [Improved linter diagnostics](#improved-linter-diagnostics)
- [Performance Improvements](#performance-improvements)
  - [Improved performance of the linter](#improved-performance-of-the-linter)
- [Update native symbol provider](#update-native-symbol-provider)
- [Added options](#added-options)
  - [Hide Release Notes](#hide-release-notes)
- [Added Fortran Logo icon](#added-fortran-logo-icon)

## Run and Debug individual files

You can now run and debug individual files. This is useful for debugging small snippets of code. To do this, right-click on the file and select `Run File` or `Debug File` from the context menu.

## LFortran Linter support

The LFortran linter is now available in the extension. It can be enabled by setting the `fortran.linter.compiler` setting to `lfortran`.

## Log Channel improvements

The `Modern Fortran` log channel has had a small revamp.

### Colourized Logs

Logs are now colorised to make reading them easier

![image](https://user-images.githubusercontent.com/16143716/190214202-0cce3ee4-80da-4f4a-88bb-c36abd09c8f6.png)

### Setting verbosity level

You can now choose the verbosity level of the extension by setting the following option in the settings

```json
{
  "fortran.logging.level": "Error"
}
```

## Improved Installation of dependencies using VS Code Tasks

The extension dependencies are now installed using Visual Studio Code's Tasks. That means that the commands are run from within the VS Code terminal, inheriting any environment variables already present. Particularly useful when using Python virtual environments.

## `fypp` linting support

Adds some initial support for `fypp` when using `gfortran`. More compilers will follow soon!

![image](https://user-images.githubusercontent.com/16143716/190215420-085043a5-8250-4777-a0f0-7a94ec740987.png)

## Improved linter diagnostics

Add support for parsing plain text diagnostics from `gfortran` v11+
thus allowing the display of multiline diagnostics

```fortran
module err_mod
    private
    implicit none   ! <- Error here previously not shown
    contains
        subroutine foo(arg1, arg2)
            integer, intent(in) :: arg1, arg2
            print*, 'arg1:', arg1, 'arg2:', arg2
        end subroutine foo
        subroutine proc_with_err()
            call foo()
        end subroutine proc_with_err
end module err_mod
```

![image](https://user-images.githubusercontent.com/16143716/190216547-324a70c3-df57-4c13-800d-efbd57b52562.png)

## Performance Improvements

Some additional performance improvements have been made to the extension.

### Improved performance of the linter

Converted the linter into using asynchronous processes, which should improve the overall performance and responsiveness of the diagnostics.

## Update native symbol provider

The native symbol provider (one used when `fortls`) is not present) has been updated
to use the new VS Code API.

## Added options

### Hide Release Notes

Hide release notes when the extension in being installed or updated.

```json
"fortran.notifications.releaseNotes": true
```

## Added Fortran Logo icon

Added a new icon for the Fortran Language files

![image](https://user-images.githubusercontent.com/16143716/192509653-609b25c2-f1bb-4370-ba2d-2781d7505814.png)
