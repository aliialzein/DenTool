import { Inject, Injectable } from '@nestjs/common';
import type { RedisClientType } from 'redis';

import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class CacheService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: RedisClientType,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);

    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      await this.redisClient.del(key);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);

    if (ttlSeconds !== undefined) {
      await this.redisClient.set(key, serializedValue, {
        EX: ttlSeconds,
      });

      return;
    }

    await this.redisClient.set(key, serializedValue);
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async ping(): Promise<string> {
    return this.redisClient.ping();
  }
}
