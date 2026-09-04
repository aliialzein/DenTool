import winston from 'winston';

import { createLoggerOptions } from './logger.config';

describe('createLoggerOptions', () => {
  it('creates a Winston logger with a console transport', () => {
    const options = createLoggerOptions();
    const logger = winston.createLogger(options);

    expect(logger).toBeInstanceOf(winston.Logger);
    expect(logger.transports).toHaveLength(1);
    expect(logger.transports[0]).toBeInstanceOf(winston.transports.Console);

    logger.close();
  });
});
