import { Global, LoggerService, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, type RedisClientType } from 'redis';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { RedisClientLifecycle } from './redis-client.lifecycle';
import { REDIS_CLIENT } from './redis.constants';
import { CacheService } from './cache.service';
import { CacheController } from './cache.controller';

export function logRedisClientError(
  logger: LoggerService,
  error: unknown,
): void {
  logger.error(
    '[Redis] Client error',
    error instanceof Error ? error.stack : String(error),
    'Redis',
  );
}

export async function createRedisClient(
  configService: ConfigService,
  logger: LoggerService,
): Promise<RedisClientType | null> {
  const redisUrl = configService.get<string>('REDIS_URL');

  if (!redisUrl) {
    logger.warn(
      '[Redis] REDIS_URL is not configured. Redis will be disabled.',
      'Redis',
    );

    return null;
  }

  const client = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: false,
    },
  });

  client.on('error', (error) => {
    logRedisClientError(logger, error);
  });

  try {
    await client.connect();

    logger.log('[Redis] Connected successfully.', 'Redis');

    return client;
  } catch (error) {
    logger.warn(
      `[Redis] Connection failed. Redis will be disabled. ${
        error instanceof Error ? error.message : String(error)
      }`,
      'Redis',
    );

    if (client.isOpen) {
      await client.quit().catch(() => undefined);
    }

    return null;
  }
}

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [CacheController],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService, WINSTON_MODULE_NEST_PROVIDER],
      useFactory: createRedisClient,
    },
    CacheService,
    RedisClientLifecycle,
  ],
  exports: [CacheService],
})
export class CacheModule {}
