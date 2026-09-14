import { Inject, Injectable } from '@nestjs/common';
import type { RedisClientType } from 'redis';

import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class CacheService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: RedisClientType | null,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    if (!this.redisClient) {
      return null;
    }

    try {
      const value = await this.redisClient.get(key);

      if (value === null) {
        return null;
      }

      try {
        return JSON.parse(value) as T;
      } catch {
        await this.redisClient.del(key).catch(() => undefined);
        return null;
      }
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!this.redisClient) {
      return;
    }

    try {
      const serializedValue = JSON.stringify(value);

      if (ttlSeconds !== undefined) {
        await this.redisClient.set(key, serializedValue, {
          EX: ttlSeconds,
        });

        return;
      }

      await this.redisClient.set(key, serializedValue);
    } catch {
      // Redis is optional. Cache failures must never break the application.
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.redisClient) {
      return;
    }

    try {
      await this.redisClient.del(key);
    } catch {
      // Redis is optional. Cache failures must never break the application.
    }
  }

  async ping(): Promise<string> {
    if (!this.redisClient) {
      return 'DISABLED';
    }

    try {
      return await this.redisClient.ping();
    } catch {
      return 'UNAVAILABLE';
    }
  }
}
