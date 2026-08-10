import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CategoriesRepository } from './repositories/categories.repositories';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const repository = {
    createCategory: jest.fn(),
    findAllActive: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    updateCategory: jest.fn(),
    countProductsByCategoryId: jest.fn(),
    deleteCategory: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: CategoriesRepository, useValue: repository },
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
});
