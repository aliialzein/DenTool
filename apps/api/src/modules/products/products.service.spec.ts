import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ProductsRepository } from './repositories/products.repositories';
import { ProductImagesRepository } from './repositories/product-images.repositories';
import { ImageKitService } from '../../integrations/ImageKit/imagekit.service';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const repository: any = {
    findMany: jest.fn(),
    findBySlug: jest.fn(),
    findById: jest.fn(),
  };

  const productImagesRepository = {
    countByProductId: jest.fn(),
  };

  const imageKitService = {
    generateUploadAuthParams: jest.fn(),
    getPublicKey: jest.fn(),
    getUrlEndpoint: jest.fn(),
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
});
