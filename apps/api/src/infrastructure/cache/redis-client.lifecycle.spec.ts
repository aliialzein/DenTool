import type { RedisClientType } from 'redis';

import { RedisClientLifecycle } from './redis-client.lifecycle';

describe('RedisClientLifecycle', () => {
  it('should quit Redis when the client is open', async () => {
    const quit = jest.fn().mockResolvedValue(undefined);

    const redisClient = {
      isOpen: true,
      quit,
    } as unknown as RedisClientType;

    const lifecycle = new RedisClientLifecycle(redisClient);

    await lifecycle.onModuleDestroy();

    expect(quit).toHaveBeenCalledTimes(1);
  });

  it('should not quit Redis when the client is already closed', async () => {
    const quit = jest.fn().mockResolvedValue(undefined);

    const redisClient = {
      isOpen: false,
      quit,
    } as unknown as RedisClientType;

    const lifecycle = new RedisClientLifecycle(redisClient);

    await lifecycle.onModuleDestroy();

    expect(quit).not.toHaveBeenCalled();
  });
});
