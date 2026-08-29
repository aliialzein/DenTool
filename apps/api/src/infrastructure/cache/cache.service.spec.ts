import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, beforeEach, jest } from '@jest/globals';

import { CacheService } from './cache.service';
import { REDIS_CLIENT } from './redis.constants';

describe('CacheService', () => {
  let service: CacheService;

  const redisClient = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    ping: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: REDIS_CLIENT,
          useValue: redisClient,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  describe('get', () => {
    it('returns null when the cache key does not exist', async () => {
      redisClient.get.mockResolvedValue(null);

      await expect(service.get('missing-key')).resolves.toBeNull();

      expect(redisClient.get).toHaveBeenCalledWith('missing-key');
    });

    it('parses and returns cached JSON data', async () => {
      const cachedProduct = {
        id: 'product-1',
        name: 'Dental Mirror',
        price: 12.5,
      };

      redisClient.get.mockResolvedValue(JSON.stringify(cachedProduct));

      await expect(
        service.get<typeof cachedProduct>('products:slug:dental-mirror'),
      ).resolves.toEqual(cachedProduct);

      expect(redisClient.get).toHaveBeenCalledWith(
        'products:slug:dental-mirror',
      );
    });

    it('deletes corrupted cache data and returns null', async () => {
      redisClient.get.mockResolvedValue('invalid-json');
      redisClient.del.mockResolvedValue(1);

      await expect(service.get('corrupted-key')).resolves.toBeNull();

      expect(redisClient.del).toHaveBeenCalledWith('corrupted-key');
    });

    it('does not delete a cache key when valid JSON is returned', async () => {
      redisClient.get.mockResolvedValue(
        JSON.stringify({
          id: 'product-1',
        }),
      );

      await service.get('valid-key');

      expect(redisClient.del).not.toHaveBeenCalled();
    });
  });

  describe('set', () => {
    it('stores serialized data with a TTL', async () => {
      const product = {
        id: 'product-1',
        name: 'Dental Mirror',
      };

      redisClient.set.mockResolvedValue('OK');

      await service.set('products:slug:dental-mirror', product, 300);

      expect(redisClient.set).toHaveBeenCalledWith(
        'products:slug:dental-mirror',
        JSON.stringify(product),
        {
          EX: 300,
        },
      );
    });

    it('stores serialized data without a TTL when none is provided', async () => {
      const product = {
        id: 'product-1',
        name: 'Dental Mirror',
      };

      redisClient.set.mockResolvedValue('OK');

      await service.set('products:slug:dental-mirror', product);

      expect(redisClient.set).toHaveBeenCalledWith(
        'products:slug:dental-mirror',
        JSON.stringify(product),
      );
    });
  });

  describe('delete', () => {
    it('deletes a cache key', async () => {
      redisClient.del.mockResolvedValue(1);

      await service.delete('products:slug:dental-mirror');

      expect(redisClient.del).toHaveBeenCalledWith(
        'products:slug:dental-mirror',
      );
    });
  });

  describe('ping', () => {
    it('returns the Redis ping response', async () => {
      redisClient.ping.mockResolvedValue('PONG');

      await expect(service.ping()).resolves.toBe('PONG');

      expect(redisClient.ping).toHaveBeenCalledTimes(1);
    });
  });
});
