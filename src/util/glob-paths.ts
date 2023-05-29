'use strict';

// import * as fg from 'fast-glob';
import { glob } from 'glob';

import { resolveVariables } from './tools';

/**
 * A class meant to resolve glob patterns to absolute paths.
 * Glob resolution can be expensive, so this class can be used for caching
 */
export class GlobPaths {
  public globs: string[] = [];
  public paths: string[] = [];
  constructor(globs: string[] = []) {
    this.update(globs);
  }

  public update(globs: string[]): void {
    this.globs = globs;
    this.paths = this.globResolution(globs);
  }

  public add(globs: string[]): void {
    this.globs = this.globs.concat(globs);
    this.paths = this.paths.concat(this.globResolution(globs));
  }

  /**
   *
   * @param globPaths A list of glob paths to resolve
   * @returns A list of resolved paths
   */
  private globResolution(globPaths: string[]): string[] {
    if (globPaths.length === 0) return [];
    // Resolve internal variables and expand glob patterns
    const globPathsVars = globPaths.map(e => resolveVariables(e));
    // fast-glob cannot work with Windows paths
    globPaths = globPaths.map(e => e.replace('/\\/g', '/'));
    // This needs to be after the resolvevariables since {} are used in globs
    // try {
    //   const globIncPaths: string[] = fg.sync(globPathsVars, {
    //     onlyDirectories: true,
    //     suppressErrors: false,
    //   });
    //   return globIncPaths;
    //   // Try to recover from fast-glob failing due to EACCES using slower more
    //   // robust glob.
    // } catch (eacces) {
    try {
      const globIncPaths: string[] = [];
      for (const i of globPathsVars) {
        // use '/' to match only directories and not files
        globIncPaths.push(...glob.sync(i + '/'));
      }
      return globIncPaths;
      // if we failed again then our globs are somehow wrong. Abort
    } catch (error) {
      throw new TypeError(`Invalid glob syntax, error: ${error}`);
    }
    // }
  }
}
