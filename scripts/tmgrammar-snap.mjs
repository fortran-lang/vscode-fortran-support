#!/usr/bin/env node

/**
 * @fileoverview
 * Generate/check TextMate token snapshots (`.snap`) for grammar tests.
 *
 * This script tokenizes input files line-by-line using a VS Code TextMate grammar,
 * then formats the tokens into a deterministic text snapshot.
 *
 * Usage:
 * - Check snapshots:
 *   node ./scripts/tmgrammar-snap.mjs -s <scopeName> -g <grammarPath> <glob...>
 * - Update snapshots:
 *   node ./scripts/tmgrammar-snap.mjs -u -s <scopeName> -g <grammarPath> <glob...>
 *
 * Snapshot format contract (must match existing repo snapshots):
 * - Always emit the source line prefixed with `>`.
 * - Do NOT emit token marker lines for whitespace-only source lines.
 * - No trailing newline is appended to the snapshot string.
 *
 * Exit codes:
 * - 0: success
 * - 1: CLI usage error OR snapshot missing/mismatch
 * - 2: fatal runtime error
 */

import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

import { Command } from 'commander';
import { globSync } from 'glob';
import textmate from 'vscode-textmate';
import oniguruma from 'vscode-oniguruma';

const { Registry, parseRawGrammar } = textmate;
const { loadWASM, OnigScanner, OnigString } = oniguruma;

const require = createRequire(import.meta.url);

const EXIT = {
  ok: 0,
  mismatch: 1,
  fatal: 2,
};

/**
 * Print an error (if provided) and terminate the process.
 * @param {string} message
 * @param {number} [code]
 * @returns {never}
 */
function die(message, code = EXIT.fatal) {
  if (message) console.error(message);
  process.exit(code);
}

/**
 * Parse CLI args and return normalized options.
 *
 * Notes:
 * - Commander prints its own help/errors.
 * - On parse errors this function terminates the process with `EXIT.mismatch`.
 *
 * @param {string[]} argv CLI args excluding `node` and script path
 * @returns {{scopeName: string, grammarPath: string, update: boolean, patterns: string[]}}
 */
function parseCliArgs(argv) {
  const program = new Command()
    .name('tmgrammar-snap')
    .usage('-s <scopeName> -g <grammarPath> <globPattern...> [-u|--update]')
    .requiredOption('-s, --scope <scopeName>', 'TextMate scope name')
    .requiredOption('-g, --grammar <grammarPath>', 'Path to grammar JSON')
    .option('-u, --update', 'Write snapshots instead of checking')
    .argument('<globPattern...>', 'File glob(s) to snapshot/check')
    .showHelpAfterError(true)
    .exitOverride();

  try {
    program.parse(argv, { from: 'user' });
  } catch (err) {
    // commander already printed an error/help message.
    if (err && typeof err === 'object' && err.code === 'commander.helpDisplayed') {
      process.exit(EXIT.ok);
    }
    process.exit(EXIT.mismatch);
  }

  const opts = program.opts();
  return {
    scopeName: opts.scope,
    grammarPath: opts.grammar,
    update: Boolean(opts.update),
    patterns: program.args,
  };
}

/**
 * Build lookup tables from VS Code extension contribution metadata.
 *
 * - `scopeNameToPath`: resolves grammar `include`s by mapping scope name -> file path.
 * - `injectToMap`: provides injection scopes for a target scope.
 *
 * @param {string} projectRoot workspace root (directory containing `package.json`)
 * @returns {Promise<{scopeNameToPath: Map<string, string>, injectToMap: Map<string, string[]>}>}
 */
async function buildGrammarMaps(projectRoot) {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

  const contributes = pkg?.contributes;
  const grammars = Array.isArray(contributes?.grammars) ? contributes.grammars : [];

  /** @type {Map<string, string>} */
  const scopeNameToPath = new Map();
  /** @type {Map<string, string[]>} */
  const injectToMap = new Map();

  for (const g of grammars) {
    if (!g?.scopeName || !g?.path) continue;
    scopeNameToPath.set(g.scopeName, path.resolve(projectRoot, g.path));

    const injectTo = Array.isArray(g.injectTo) ? g.injectTo : [];
    for (const targetScope of injectTo) {
      const current = injectToMap.get(targetScope) ?? [];
      current.push(g.scopeName);
      injectToMap.set(targetScope, current);
    }
  }

  return { scopeNameToPath, injectToMap };
}

/**
 * Generate snapshot text for a source file.
 *
 * Each source line is emitted as `>...`.
 * For non-blank lines, token ranges are rendered beneath using `#` + carets.
 *
 * @param {string} text file contents
 * @param {any} grammar loaded TextMate grammar
 * @returns {string} snapshot text (no trailing newline)
 */
function generateSnapshotForFile(text, grammar) {
  const lines = text.split(/\r?\n/);

  // Preserve rule stack between lines for multi-line constructs.
  let ruleStack = null;

  /** @type {string[]} */
  const out = [];

  for (const line of lines) {
    out.push(`>${line}`);

    if (line.trim().length === 0) {
      // Existing repo snapshots skip token lines for blank/whitespace-only lines.
      continue;
    }

    const r = grammar.tokenizeLine(line, ruleStack);
    ruleStack = r.ruleStack;

    for (const tok of r.tokens) {
      const start = tok.startIndex;
      const end = tok.endIndex;
      if (end <= start) continue;

      const carets = '^'.repeat(Math.max(1, end - start));
      const spaces = start > 0 ? ' '.repeat(start) : '';
      out.push(`#${spaces}${carets} ${tok.scopes.join(' ')}`);
    }
  }

  return out.join('\n');
}

/**
 * Resolve the installed oniguruma WASM path.
 * @returns {string}
 */
function resolveOnigWasmPath() {
  try {
    return require.resolve('vscode-oniguruma/release/onig.wasm');
  } catch {
    die('Unable to resolve vscode-oniguruma WASM. Did you run npm install?', EXIT.fatal);
  }
}

/**
 * Read a UTF-8 file, returning `null` when the file does not exist.
 * @param {string} filePath
 * @returns {Promise<string|null>}
 */
async function readTextFileOrNull(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (err) {
    if (err && typeof err === 'object' && err.code === 'ENOENT') return null;
    throw err;
  }
}

/**
 * Program entrypoint.
 * @returns {Promise<void>}
 */
async function main() {
  const { scopeName, grammarPath, update, patterns } = parseCliArgs(process.argv.slice(2));

  const projectRoot = process.cwd();
  const resolvedPrimaryGrammarPath = path.resolve(projectRoot, grammarPath);

  const { scopeNameToPath, injectToMap } = await buildGrammarMaps(projectRoot);
  scopeNameToPath.set(scopeName, resolvedPrimaryGrammarPath);

  const wasmBin = await fs.readFile(resolveOnigWasmPath());
  await loadWASM(wasmBin.buffer);

  const onigLib = Promise.resolve({
    createOnigScanner: sources => new OnigScanner(sources),
    createOnigString: str => new OnigString(str),
  });

  /** @type {Map<string, any>} */
  const grammarCache = new Map();

  const registry = new Registry({
    onigLib,
    loadGrammar: async requestedScopeName => {
      const grammarFile = scopeNameToPath.get(requestedScopeName);
      if (!grammarFile) return null;

      const cached = grammarCache.get(requestedScopeName);
      if (cached) return cached;

      const content = await fs.readFile(grammarFile, 'utf8');
      const parsed = parseRawGrammar(content, grammarFile);
      grammarCache.set(requestedScopeName, parsed);
      return parsed;
    },
    getInjections: targetScopeName => injectToMap.get(targetScopeName) ?? [],
  });

  const grammar = await registry.loadGrammar(scopeName);
  if (!grammar) {
    die(`Unable to load grammar for scope '${scopeName}'.`, EXIT.fatal);
  }

  const files = patterns
    .flatMap(pattern => globSync(pattern, { nodir: true, absolute: true, cwd: projectRoot }))
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    die(`No files matched: ${patterns.join(' ')}`, EXIT.fatal);
  }

  let mismatches = 0;

  for (const filePath of files) {
    const text = await fs.readFile(filePath, 'utf8');
    const snapshot = generateSnapshotForFile(text, grammar);

    const snapPath = `${filePath}.snap`;

    if (update) {
      await fs.writeFile(snapPath, snapshot, 'utf8');
      continue;
    }

    const expected = await readTextFileOrNull(snapPath);
    if (expected === null) {
      console.error(`Missing snapshot: ${path.relative(projectRoot, snapPath)}`);
      mismatches++;
      continue;
    }
    if (expected !== snapshot) {
      console.error(`Snapshot mismatch: ${path.relative(projectRoot, filePath)}`);
      mismatches++;
    }
  }

  if (mismatches > 0) {
    console.error(`\n${mismatches} snapshot(s) differed. Re-run with -u to update.`);
    process.exit(EXIT.mismatch);
  }
}

main().catch(err => {
  console.error(err?.stack || String(err));
  process.exit(EXIT.fatal);
});
