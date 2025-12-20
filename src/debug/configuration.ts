import * as vscode from 'vscode';

export const DebugType = {
  CppDbg: 'cppdbg',
  CppVsDbg: 'cppvsdbg',
  Gdb: 'gdb',
  Lldb: 'lldb',
} as const;
export type DebugAdapterType = (typeof DebugType)[keyof typeof DebugType];

export const DebuggerExtensionId = {
  CppTools: 'ms-vscode.cpptools',
  CdtGdb: 'eclipse-cdt.cdt-gdb-vscode',
  CodeLLDB: 'vadimcn.vscode-lldb',
} as const;
export type DebuggerExtensionId = (typeof DebuggerExtensionId)[keyof typeof DebuggerExtensionId];

export type AdapterSpec = Readonly<{
  extensionId: DebuggerExtensionId;
  debugType: (platform: NodeJS.Platform) => DebugAdapterType;
  /**
   * Use to override or add default configuration values.
   * @param config VS Code debug configuration, see API docs for details.
   */
  applyDefaults?: (config: vscode.DebugConfiguration) => void;
}>;

const ADAPTERS: readonly AdapterSpec[] = [
  {
    extensionId: DebuggerExtensionId.CppTools,
    debugType: platform => (platform === 'win32' ? DebugType.CppVsDbg : DebugType.CppDbg),
  },
  {
    extensionId: DebuggerExtensionId.CdtGdb,
    debugType: () => DebugType.Gdb,
  },
  {
    extensionId: DebuggerExtensionId.CodeLLDB,
    debugType: () => DebugType.Lldb,
  },
];

export function selectDebugAdapter(
  getExtension: (id: string) => vscode.Extension<unknown> | undefined = vscode.extensions
    .getExtension
) {
  const spec = ADAPTERS.find(a => !!getExtension(a.extensionId));
  if (!spec) {
    const ids = ADAPTERS.map(a => a.extensionId).join(', ');
    throw new Error(`No supported debugger extension found. Install one of: ${ids}`);
  }
  return spec;
}

export function createDebugConfiguration(args: {
  name: string;
  adapter: AdapterSpec;
  program: string;
  cwd: string;
  request?: 'launch' | 'attach';
}): vscode.DebugConfiguration {
  const config: vscode.DebugConfiguration = {
    name: args.name,
    type: args.adapter.debugType(process.platform),
    request: args.request ?? 'launch',
    program: args.program,
    cwd: args.cwd,
  };

  args.adapter.applyDefaults?.(config);
  return config;
}
