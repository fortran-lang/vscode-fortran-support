import { execSync } from 'child_process';

import * as vscode from 'vscode';

interface LibraryConfig {
  name: string;
  moduleNames: string[];
  detectCommand?: string;
  includePaths?: string[];
}

const COMMON_LIBRARIES: LibraryConfig[] = [
  {
    name: 'OpenMPI',
    moduleNames: ['mpi', 'mpi_f08', 'mpi_ext'],
    detectCommand: 'mpifort --showme:incdirs',
  },
  {
    name: 'MPICH',
    moduleNames: ['mpi', 'mpi_f08'],
    detectCommand: 'mpif90 -show | grep -oP "(?<=-I)[^ ]+"',
  },
  {
    name: 'PETSc',
    moduleNames: ['petsc', 'petscsnes', 'petscvec', 'petscmat'],
    detectCommand: 'pkg-config --variable=includedir PETSc',
  },
  {
    name: 'HDF5',
    moduleNames: ['hdf5', 'h5fortran'],
    detectCommand: 'h5fc -show | grep -oP "(?<=-I)[^ ]+"',
  },
  {
    name: 'NetCDF',
    moduleNames: ['netcdf'],
    detectCommand: 'nf-config --includedir',
  },
  {
    name: 'LAPACK',
    moduleNames: ['lapack', 'blas'],
  },
  {
    name: 'ScaLAPACK',
    moduleNames: ['scalapack'],
  },
];

export async function detectLibraries(): Promise<LibraryConfig[]> {
  const detected: LibraryConfig[] = [];

  for (const lib of COMMON_LIBRARIES) {
    if (lib.detectCommand) {
      try {
        const output = execSync(lib.detectCommand, { encoding: 'utf-8' }).trim();
        if (output) {
          detected.push({
            ...lib,
            includePaths: output.split('\n').filter(p => p.length > 0),
          });
        }
      } catch (error) {
        // Library not installed or command failed
        continue;
      }
    }
  }

  return detected;
}

export async function configureLibrarySupport(): Promise<void> {
  const choice = await vscode.window.showQuickPick(
    [
      {
        label: 'Auto-detect libraries',
        description: 'Automatically detect MPI, PETSc, HDF5, etc.',
      },
      {
        label: 'Configure manually',
        description: 'Manually specify module names',
      },
    ],
    {
      placeHolder: 'How would you like to configure external library support?',
    }
  );

  if (!choice) return;

  if (choice.label === 'Auto-detect libraries') {
    await autoDetectAndConfigure();
  } else {
    await manualConfiguration();
  }
}

async function autoDetectAndConfigure(): Promise<void> {
  const detected = await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Detecting Fortran libraries...',
    },
    async () => await detectLibraries()
  );

  if (detected.length === 0) {
    vscode.window.showInformationMessage(
      'No external libraries detected. You can configure them manually.'
    );
    return;
  }

  const selected = await vscode.window.showQuickPick(
    detected.map(lib => ({
      label: lib.name,
      description: `Modules: ${lib.moduleNames.join(', ')}`,
      picked: true,
      lib,
    })),
    {
      canPickMany: true,
      placeHolder: 'Select libraries to configure',
    }
  );

  if (!selected || selected.length === 0) return;

  const config = vscode.workspace.getConfiguration('fortran.fortls');
  const currentModules = config.get<string[]>('externalModules', []);
  const currentPaths = config.get<string[]>('externalModulePaths', []);

  const newModules = Array.from(
    new Set([...currentModules, ...selected.flatMap((s: any) => s.lib.moduleNames)])
  );

  const newPaths = Array.from(
    new Set([...currentPaths, ...selected.flatMap((s: any) => s.lib.includePaths || [])])
  );

  await config.update('externalModules', newModules, vscode.ConfigurationTarget.Workspace);
  await config.update('externalModulePaths', newPaths, vscode.ConfigurationTarget.Workspace);

  vscode.window.showInformationMessage(
    `Configured ${selected.length} libraries. Added ${newModules.length - currentModules.length} modules.`
  );
}

async function manualConfiguration(): Promise<void> {
  const modules = await vscode.window.showInputBox({
    prompt: 'Enter module names separated by commas (e.g., mpi, petsc, hdf5)',
    placeHolder: 'mpi, petsc',
  });

  if (!modules) return;

  const moduleList = modules
    .split(',')
    .map(m => m.trim().toLowerCase())
    .filter(m => m.length > 0);

  const config = vscode.workspace.getConfiguration('fortran.fortls');
  const current = config.get<string[]>('externalModules', []);
  const updated = Array.from(new Set([...current, ...moduleList]));

  await config.update('externalModules', updated, vscode.ConfigurationTarget.Workspace);

  vscode.window.showInformationMessage(
    `Added ${moduleList.length} external modules to configuration.`
  );
}
