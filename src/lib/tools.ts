export const LANG_SERVER_TOOL_ID = 'fortran-language-server';
export const FORMATTERS = ['Disabled', 'findent', 'fprettify'];

import * as cp from 'child_process';
import { LoggingService } from '../services/logging-service';

export function installPythonTool(pyPackage: string, logger?: LoggingService) {

  const installProcess = cp.spawn(
    'pip',
    'install --user --upgrade '.concat(pyPackage).split(' ')
  );
  installProcess.stdout.on('data', (data) => { logger.logInfo(`pip install: ${data}`) });
  installProcess.on('exit', (code, signal) => {
    if (code !== 0) {
      logger.logError(`Python package ${pyPackage} failed to install with code: ${code}, signal: ${signal}`);
    }
  });
  installProcess.on('error', err => {
    logger.logError(`${err}`);
  });
}
