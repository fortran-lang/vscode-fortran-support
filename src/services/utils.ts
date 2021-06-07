export type EnvironmentVariables = Record<string, string | undefined>
export function errorToString(e: any): string {
  if (e.stack) {
    // e.stack has both the message and the stack in it.
    return `\n\t${e.stack}`
  }
  return `\n\t${e.toString()}`
}

export function replaceAll(str: string, needle: string, what: string) {
  const pattern = escapeStringForRegex(needle)
  const re = new RegExp(pattern, 'g')
  return str.replace(re, what)
}

/**
 * Escape a string so it can be used as a regular expression
 */
export function escapeStringForRegex(str: string): string {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1')
}

export function mergeEnvironment(
  ...env: EnvironmentVariables[]
): EnvironmentVariables {
  return env.reduce((acc, vars) => {
    if (process.platform === 'win32') {
      // Env vars on windows are case insensitive, so we take the ones from
      // active env and overwrite the ones in our current process env
      const norm_vars = Object.getOwnPropertyNames(
        vars
      ).reduce<EnvironmentVariables>((acc2, key: string) => {
        acc2[normalizeEnvironmentVarname(key)] = vars[key]
        return acc2
      }, {})
      return { ...acc, ...norm_vars }
    } else {
      return { ...acc, ...vars }
    }
  }, {})
}

export function normalizeEnvironmentVarname(varname: string) {
  return process.platform === 'win32' ? varname.toUpperCase() : varname
}

/**
 * Fix slashes in Windows paths for CMake
 * @param str The input string
 * @returns The modified string with fixed paths
 */
export function fixPaths(str: string) {
  const fix_paths = /[A-Z]:(\\((?![<>:\"\/\\|\?\*]).)+)*\\?(?!\\)/gi
  let pathmatch: RegExpMatchArray | null = null
  let newstr = str
  while ((pathmatch = fix_paths.exec(str))) {
    const pathfull = pathmatch[0]
    const fixslash = pathfull.replace(/\\/g, '/')
    newstr = newstr.replace(pathfull, fixslash)
  }
  return newstr
}
