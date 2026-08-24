/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CategoriesRepository } from './repositories/categories.repositories';
import { CategoriesService } from './categories.service';
import { ImageKitService } from '../../integrations/ImageKit/imagekit.service';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const repository: any = {
    createCategory: jest.fn(),
    findAllActive: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    updateCategory: jest.fn(),
    countProductsByCategoryId: jest.fn(),
    deleteCategory: jest.fn(),
  };

  const imageKitService = {
    generateUploadAuthParams: jest.fn(),
    getPublicKey: jest.fn(),
    getUrlEndpoint: jest.fn(),
    getFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: CategoriesRepository, useValue: repository },
        { provide: ImageKitService, useValue: imageKitService },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('creates a normalized unique slug from the category name', async () => {
    repository.findBySlug.mockResolvedValue(null);
    repository.createCategory.mockResolvedValue({ id: 'category-id' });

    await service.create({
      name: '  Dental Instruments  ',
      description: 'Hand instruments',
      imagePublicId: 'categories/instruments',
      imageUrl: 'https://res.cloudinary.com/example/image.jpg',
    });

    expect(repository.findBySlug).toHaveBeenCalledWith('dental-instruments');
    expect(repository.createCategory).toHaveBeenCalledWith(
      'Dental Instruments',
      'dental-instruments',
      'Hand instruments',
      'categories/instruments',
      'https://res.cloudinary.com/example/image.jpg',
      undefined,
    );
  });

  it('does not expose inactive categories publicly', async () => {
    repository.findAllActive.mockResolvedValue([{ id: 'active-category' }]);

    await expect(service.findAll()).resolves.toEqual([
      { id: 'active-category' },
    ]);

    repository.findBySlug.mockResolvedValue({
      id: 'inactive-category',
      isActive: false,
    });
    await expect(service.findBySlug('inactive')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns inactive categories through the admin listing', async () => {
    repository.findAll.mockResolvedValue([
      { id: 'active-category', isActive: true },
      { id: 'inactive-category', isActive: false },
    ]);

    await expect(service.findAllAdmin()).resolves.toHaveLength(2);
  });

  it('prevents deletion while products belong to the category', async () => {
    repository.findById.mockResolvedValue({ id: 'category-id' });
    repository.countProductsByCategoryId.mockResolvedValue(1);

    await expect(service.remove('category-id')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repository.deleteCategory).not.toHaveBeenCalled();
  });

  it('deletes an empty category', async () => {
    repository.findById.mockResolvedValue({ id: 'category-id' });
    repository.countProductsByCategoryId.mockResolvedValue(0);

    await service.remove('category-id');

    expect(repository.deleteCategory).toHaveBeenCalledWith('category-id');
  });

  it('creates signed upload parameters and only attaches category-owned images', async () => {
    repository.findById.mockResolvedValue({ id: 'category-id' });
    imageKitService.generateUploadAuthParams.mockReturnValue({
      token: 'token',
      expire: 1,
      signature: 'signature',
    });
    imageKitService.getPublicKey.mockReturnValue('public-key');
    imageKitService.getUrlEndpoint.mockReturnValue('https://ik.example');

    await expect(
      service.generateImageUploadSignature('category-id', {
        fileName: 'image.png',
        mimeType: 'image/png',
        fileSize: 100,
      }),
    ).resolves.toMatchObject({ folder: 'dentool/categories/category-id' });

    imageKitService.getFile.mockResolvedValue({
      fileId: 'file-id',
      url: 'https://ik.example/image.png',
      filePath: '/dentool/categories/category-id/image.png',
    });
    await service.attachImage('category-id', { fileId: 'file-id' });

    expect(repository.updateCategory).toHaveBeenCalledWith('category-id', {
      imagePublicId: 'file-id',
      imageUrl: 'https://ik.example/image.png',
    });
  });
});
