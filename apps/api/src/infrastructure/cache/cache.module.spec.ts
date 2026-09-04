import { logRedisClientError } from './cache.module';

describe('logRedisClientError', () => {
  it('routes Redis client errors through the application logger', () => {
    const logger = { error: jest.fn() };
    const error = new Error('connection refused');

    logRedisClientError(logger, error);

    expect(logger.error).toHaveBeenCalledWith(
      '[Redis] Client error',
      error.stack,
      'Redis',
    );
  });
});
