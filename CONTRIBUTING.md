# Contributing

👍🎉 Thank you for taking the time to contribute! 🎉👍

In this file you will find all the steps necessary to guide you through your first contribution to the project.

Please note our [Code of Conduct](https://github.com/fortran-lang/.github/blob/main/CODE_OF_CONDUCT.md) and adhere to it in all your interactions with this project.

## 📚 Getting Started

### Downloading ⬇️

Firstly, fork the repository from <https://github.com/fortran-lang/vscode-fortran-support>.

Then clone the repository into your local machine.

```sh
git@github.com:<YOUR-USERNAME>/vscode-fortran-support.git
```

Where `<YOUR-USERNAME>` should be your GitHub username.

### Dependencies

To build this project you will need [NodeJS](https://nodejs.org/) `>= 16.13.1`.
Open a terminal and run for a quick dependency installation:

```sh
npm ci
```

or for a full dependency installation:

```sh
npm install
```

### Compiling 🏗️

During development, you can run a watcher to continuously check for changes and compile the extension:

```sh
npm run watch-dev
```

or do a standalone compilation via:

```sh
npm run compile-dev
```

👉 **Tip!** You can press <kbd>CTRL+SHIFT+B</kbd> (<kbd>CMD+SHIFT+B</kbd> on Mac) to start the watch task.

### Developing & Debugging 🐞️

You can now start writing code, the `watcher` task, if not running, will automatically start when debugging.
You can actively debug the extension by pressing <kbd>F5</kbd> with `Launch Extension` selected.

👉 **Tip!** You don't need to stop and restart the development version of VS Code after each change. You can just execute `Reload Window` from the command palette in the
VS Code window prefixed with `[Extension Development Host]`.

https://user-images.githubusercontent.com/16143716/167411072-58a25378-13ad-41c5-bb20-2dacc8ad004a.mp4
