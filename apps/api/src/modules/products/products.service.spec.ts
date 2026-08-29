/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ProductsRepository } from './repositories/products.repositories';
import { ProductImagesRepository } from './repositories/product-images.repositories';
import { ImageKitService } from '../../integrations/ImageKit/imagekit.service';
import { ProductsService } from './products.service';
import { CacheService } from '../../infrastructure/cache/cache.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const repository: any = {
    findMany: jest.fn(),
    findByIds: jest.fn(),
    findBySlug: jest.fn(),
    findById: jest.fn(),
  };

  const productImagesRepository = {
    countByProductId: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
  };

  const imageKitService = {
    generateUploadAuthParams: jest.fn(),
    getPublicKey: jest.fn(),
    getUrlEndpoint: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: repository },
        {
          provide: ProductImagesRepository,
          useValue: productImagesRepository,
        },
        { provide: ImageKitService, useValue: imageKitService },
        { provide: CacheService, useValue: { get: jest.fn(), set: jest.fn() } },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('maps a product list response and converts prices to numbers', async () => {
    repository.findMany.mockResolvedValue({
      items: [
        {
          id: 'product-1',
          name: 'Dental Mirror',
          slug: 'dental-mirror',
          price: '299.99',
          isActive: true,
          isAvailable: true,
          category: {
            id: 'category-1',
            name: 'Instruments',
            slug: 'instruments',
          },
          images: [
            {
              id: 'image-1',
              secureUrl: 'https://example.com/mirror.jpg',
              sortOrder: 1,
            },
          ],
        },
      ],
      total: 1,
    });

    await expect(
      service.findMany({
        page: 1,
        limit: 20,
      }),
    ).resolves.toEqual({
      items: [
        {
          id: 'product-1',
          name: 'Dental Mirror',
          slug: 'dental-mirror',
          price: 299.99,
          isActive: true,
          isAvailable: true,
          category: {
            id: 'category-1',
            name: 'Instruments',
            slug: 'instruments',
          },
          images: [
            {
              id: 'image-1',
              secureUrl: 'https://example.com/mirror.jpg',
              sortOrder: 1,
            },
          ],
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });
  });

  it('throws when a product slug is not found', async () => {
    repository.findBySlug.mockResolvedValue(null);

    await expect(service.findBySlug('missing-slug')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deduplicates IDs and maps prices for cart hydration', async () => {
    repository.findByIds.mockResolvedValue([
      {
        id: 'product-1',
        price: '12.50',
        isActive: true,
        isAvailable: true,
        images: [],
      },
    ]);

    await expect(
      service.findByIds({ ids: ['product-1', 'product-1'] }),
    ).resolves.toEqual([
      {
        id: 'product-1',
        price: 12.5,
        isActive: true,
        isAvailable: true,
        images: [],
      },
    ]);
    expect(repository.findByIds).toHaveBeenCalledWith(['product-1']);
  });

  it('returns no products without querying the repository for empty IDs', async () => {
    await expect(service.findByIds({ ids: [] })).resolves.toEqual([]);
    expect(repository.findByIds).not.toHaveBeenCalled();
  });

  it('deletes an owned image record before its ImageKit asset', async () => {
    repository.findById.mockResolvedValue({ id: 'product-1' });
    productImagesRepository.findById.mockResolvedValue({
      id: 'image-1',
      productId: 'product-1',
      publicId: 'imagekit-id',
    });

    await service.removeImage('product-1', 'image-1');

    expect(imageKitService.deleteFile).toHaveBeenCalledWith('imagekit-id');
    expect(productImagesRepository.delete).toHaveBeenCalledWith('image-1');
    expect(
      productImagesRepository.delete.mock.invocationCallOrder[0],
    ).toBeLessThan(imageKitService.deleteFile.mock.invocationCallOrder[0]);
  });

  it('rejects an image owned by another product', async () => {
    repository.findById.mockResolvedValue({ id: 'product-1' });
    productImagesRepository.findById.mockResolvedValue({
      id: 'image-1',
      productId: 'product-2',
      publicId: 'imagekit-id',
    });

    await expect(service.removeImage('product-1', 'image-1')).rejects.toThrow(
      'Image does not belong to this product.',
    );
    expect(imageKitService.deleteFile).not.toHaveBeenCalled();
  });

  it('keeps the database free of dangling records when ImageKit deletion fails', async () => {
    repository.findById.mockResolvedValue({ id: 'product-1' });
    productImagesRepository.findById.mockResolvedValue({
      id: 'image-1',
      productId: 'product-1',
      publicId: 'imagekit-id',
    });
    imageKitService.deleteFile.mockRejectedValue(new Error('ImageKit failed'));

    await expect(service.removeImage('product-1', 'image-1')).rejects.toThrow(
      'ImageKit failed',
    );
    expect(productImagesRepository.delete).toHaveBeenCalledWith('image-1');
  });
});
