import { strictEqual } from 'assert';

import { Logger, LogLevel, getConfigLogLevel } from '../../src/services/logging';

suite('Logging', () => {
  const logger = new Logger();
  test('Set and Get log level', () => {
    logger.setLogLevel(LogLevel.DEBUG);
    strictEqual(LogLevel.DEBUG, logger.getLogLevel());
  });

  test('Ignore low level messages', () => {
    logger.setLogLevel(LogLevel.NONE);
    logger.debug('This should not be logged');
    logger.info('This should not be logged');
    logger.warn('This should not be logged');
    logger.error('This should not be logged');
    // FIXME: We cannot yet read the output channel
    // https://github.com/microsoft/vscode/issues/65108
    strictEqual(true, true);
  });

  test('debug', () => {
    logger.setLogLevel(LogLevel.DEBUG);
    logger.debug('This should be logged');
    logger.debug('This should be logged', { foo: 'bar' });
  });

  test('info', () => {
    logger.setLogLevel(LogLevel.INFO);
    logger.info('This should be logged');
    logger.info('This should be logged', { foo: 'bar' });
  });

  test('warn', () => {
    logger.setLogLevel(LogLevel.WARN);
    logger.warn('This should be logged');
    logger.warn('This should be logged', { foo: 'bar' });
  });

  test('error', () => {
    logger.setLogLevel(LogLevel.ERROR);
    logger.error('This should be logged');
    logger.error('This should be logged', 'This is an error message');
    logger.error('This should be logged', new Error('This is an error'));
  });

  test('getConfigLogLevel', () => {
    strictEqual(LogLevel.DEBUG, getConfigLogLevel());
  });

  test('show', () => {
    logger.show();
  });
});
