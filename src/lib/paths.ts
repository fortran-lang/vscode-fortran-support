import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

let binPathCache: { [tool: string]: string } = {}

export const envPath =
  process.env['PATH'] ||
  (process.platform === 'win32' ? process.env['Path'] : null)

// checks in the PATH defined in the PATH env variables
// for the specified tools and returns its complete path
export default function getBinPath(tool: string): string | null {
  if (binPathCache[tool]) return binPathCache[tool]
  const binDirPaths = envPath.split(path.delimiter)
  const binName = getBinName(tool)
  const possiblePaths = binDirPaths.map(binDirPath =>
    path.join(binDirPath, binName)
  )
  for (let p of possiblePaths) {
    if (fileExists(p)) {
      return p
    }
  }
  return null
}

function getBinName(tool: string): string {
  return toolBinNames[tool]
}

const toolBinNames = {
  'fortran-langserver': 'fortls',
}

function fileExists(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile()
  } catch (e) {
    return false
  }
}
