import { Global, LoggerService, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
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
) {
  const redisUrl = configService.get<string>('REDIS_URL');

  if (!redisUrl) {
    throw new Error('REDIS_URL is not configured');
  }

  const client = createClient({
    url: redisUrl,
  });

  client.on('error', (error) => {
    logRedisClientError(logger, error);
  });

  await client.connect();

  return client;
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
