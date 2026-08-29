import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

import { REDIS_CLIENT } from './redis.constants';
import { CacheService } from './cache.service';
import { CacheController } from './cache.controller';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [CacheController],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');

        if (!redisUrl) {
          throw new Error('REDIS_URL is not configured');
        }

        const client = createClient({
          url: redisUrl,
        });

        client.on('error', (error) => {
          console.error('[Redis] Client error:', error);
        });

        await client.connect();

        return client;
      },
    },
    CacheService,
  ],
  exports: [CacheService],
})
export class CacheModule {}
