import * as vscode from 'vscode'
import { LoggingService } from './logging-service'
import {
  EnvironmentVariables,
  errorToString,
  fixPaths,
  mergeEnvironment,
  normalizeEnvironmentVarname,
  replaceAll,
} from './utils'

interface VariableExpansionOptions {
  envOverride?: Record<string, string>
  recursive: boolean
  vars: Record<string, string>
  doNotSupportCommands?: boolean
}

export class Config {
  constructor(
    private _config: vscode.WorkspaceConfiguration,
    private log: LoggingService
  ) {}
  get<T extends any>(
    section: string,
    defaultValue?: T
  ): Promise<T> | undefined {
    const value = this._config.get<T>(section, defaultValue)
    if (Array.isArray(value)) {
      // @ts-ignore
      return Promise.all(
        value.map((value) =>
          expandValue(value, this.log, this.getExpandOptions())
        )
      )
    }
    return expandValue(value, this.log, this.getExpandOptions())
  }

  getExpandOptions(): VariableExpansionOptions {
    const [rootFolder] = vscode.workspace.workspaceFolders ?? []
    return {
      envOverride: {},
      recursive: false,
      doNotSupportCommands: false,
      vars: {
        workspaceFolder: rootFolder?.uri.fsPath,
      },
    }
  }
}

export async function expandValue(
  value: any,
  log: LoggingService,
  opts: VariableExpansionOptions
) {
  if (typeof value === 'string') {
    return expandString(value, log, opts)
  }
  return value
}

/**
 * Replace ${variable} references in the given string with their corresponding
 * values.
 * @param instr The input string
 * @param opts Options for the expansion process
 * @returns A string with the variable references replaced
 */
export async function expandString(
  tmpl: string,
  log: LoggingService,
  opts: VariableExpansionOptions
) {
  if (!tmpl) {
    return tmpl
  }

  const MAX_RECURSION = 10
  let result = tmpl
  let didReplacement = false

  let i = 0
  do {
    // TODO: consider a full circular reference check?
    const expansion = await expandStringHelper(result, log, opts)
    result = expansion.result
    didReplacement = expansion.didReplacement
    i++
  } while (i < MAX_RECURSION && opts.recursive && didReplacement)

  if (i === MAX_RECURSION) {
    log.logInfo(
      'Reached max string expansion recursion. Possible circular reference.'
    )
  }

  return replaceAll(result, '${dollar}', '$')
}

export async function expandStringHelper(
  tmpl: string,
  log: LoggingService,
  opts: VariableExpansionOptions
) {
  const envPreNormalize = opts.envOverride
    ? opts.envOverride
    : (process.env as EnvironmentVariables)
  const env = mergeEnvironment(envPreNormalize)
  const repls = opts.vars

  // We accumulate a list of substitutions that we need to make, preventing
  // recursively expanding or looping forever on bad replacements
  const subs = new Map<string, string>()

  const var_re = /\$\{(\w+)\}/g
  let mat: RegExpMatchArray | null = null
  while ((mat = var_re.exec(tmpl))) {
    const full = mat[0]
    const key = mat[1]
    if (key !== 'dollar') {
      // Replace dollar sign at the very end of the expanding process
      const repl = repls[key]
      if (!repl) {
        log.logWarning(`Invalid variable reference ${full} in string: ${tmpl}`)
      } else {
        subs.set(full, repl)
      }
    }
  }

  // Regular expression for variable value (between the variable suffix and the next ending curly bracket):
  // .+? matches any character (except line terminators) between one and unlimited times,
  // as few times as possible, expanding as needed (lazy)
  const varValueRegexp = '.+?'
  const env_re = RegExp(`\\$\\{env:(${varValueRegexp})\\}`, 'g')
  while ((mat = env_re.exec(tmpl))) {
    const full = mat[0]
    const varname = mat[1]
    const repl = fixPaths(env[normalizeEnvironmentVarname(varname)]) || ''
    subs.set(full, repl)
  }

  const env_re2 = RegExp(`\\$\\{env\\.(${varValueRegexp})\\}`, 'g')
  while ((mat = env_re2.exec(tmpl))) {
    const full = mat[0]
    const varname = mat[1]
    const repl = fixPaths(env[normalizeEnvironmentVarname(varname)]) || ''
    subs.set(full, repl)
  }

  const env_re3 = RegExp(`\\$env\\{(${varValueRegexp})\\}`, 'g')
  while ((mat = env_re3.exec(tmpl))) {
    const full = mat[0]
    const varname = mat[1]
    const repl = fixPaths(env[normalizeEnvironmentVarname(varname)]) || ''
    subs.set(full, repl)
  }

  const penv_re = RegExp(`\\$penv\\{(${varValueRegexp})\\}`, 'g')
  while ((mat = penv_re.exec(tmpl))) {
    const full = mat[0]
    const varname = mat[1]
    const repl =
      fixPaths(process.env[normalizeEnvironmentVarname(varname)] || '') || ''
    subs.set(full, repl)
  }

  const vendor_re = RegExp(`\\$vendor\\{(${varValueRegexp})\\}`, 'g')
  while ((mat = vendor_re.exec(tmpl))) {
    const full = mat[0]
    const varname = mat[1]
    const repl =
      fixPaths(process.env[normalizeEnvironmentVarname(varname)] || '') || ''
    subs.set(full, repl)
  }

  if (
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
  ) {
    const folder_re = RegExp(
      `\\$\\{workspaceFolder:(${varValueRegexp})\\}`,
      'g'
    )

    mat = folder_re.exec(tmpl)
    while (mat) {
      const full = mat[0]
      const folderName = mat[1]
      const f = vscode.workspace.workspaceFolders.find(
        (folder) =>
          folder.name.toLocaleLowerCase() === folderName.toLocaleLowerCase()
      )
      if (f) {
        subs.set(full, f.uri.fsPath)
      } else {
        log.logWarning(`workspace folder ${folderName} not found`)
      }
      mat = folder_re.exec(tmpl)
    }
  }

  const command_re = RegExp(`\\$\\{command:(${varValueRegexp})\\}`, 'g')
  while ((mat = command_re.exec(tmpl))) {
    if (opts.doNotSupportCommands) {
      log.logWarning(`Commands are not supported for string: ${tmpl}`)
      break
    }
    const full = mat[0]
    const command = mat[1]
    if (subs.has(full)) {
      continue // Don't execute commands more than once per string
    }
    try {
      const command_ret = await vscode.commands.executeCommand(
        command,
        opts.vars.workspaceFolder
      )
      subs.set(full, `${command_ret}`)
    } catch (e) {
      log.logWarning(
        `Exception while executing command ${command} for string: ${tmpl} ${errorToString(
          e
        )}`
      )
    }
  }

  let final_str = tmpl
  let didReplacement = false
  subs.forEach((value, key) => {
    if (value !== key) {
      final_str = replaceAll(final_str, key, value)
      didReplacement = true
    }
  })
  return { result: final_str, didReplacement }
}
