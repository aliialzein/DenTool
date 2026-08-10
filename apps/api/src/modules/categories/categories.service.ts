import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesRepository } from './repositories/categories.repositories';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const name = createCategoryDto.name.trim();
    const slug = this.toSlug(name);
    await this.ensureSlugAvailable(slug);

    return this.categoriesRepository.createCategory(
      name,
      slug,
      createCategoryDto.description,
      createCategoryDto.imagePublicId,
      createCategoryDto.imageUrl,
    );
  }

  async findAll() {
    return this.categoriesRepository.findAllActive();
  }

  async findBySlug(slug: string) {
    const category = await this.categoriesRepository.findBySlug(slug);

    if (!category || !category.isActive) {
      throw this.categoryNotFound();
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.getByIdOrThrow(id);
    const data: Prisma.CategoryUpdateInput = {
      ...updateCategoryDto,
    };

    const name = updateCategoryDto.name?.trim();
    if (name) {
      data.name = name;
    }

    if (name && name !== category.name) {
      const slug = this.toSlug(name);
      await this.ensureSlugAvailable(slug, category.id);
      data.slug = slug;
    }

    return this.categoriesRepository.updateCategory(id, data);
  }

  async remove(id: string) {
    await this.getByIdOrThrow(id);

    const productCount =
      await this.categoriesRepository.countProductsByCategoryId(id);

    if (productCount > 0) {
      throw new ConflictException({
        code: 'CATEGORY_NOT_EMPTY',
        message: 'Category cannot be deleted while it contains products.',
      });
    }

    await this.categoriesRepository.deleteCategory(id);
  }

  private async getByIdOrThrow(id: string) {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw this.categoryNotFound();
    }

    return category;
  }

  private async ensureSlugAvailable(slug: string, categoryId?: string) {
    const existing = await this.categoriesRepository.findBySlug(slug);

    if (existing && existing.id !== categoryId) {
      throw new ConflictException({
        code: 'CATEGORY_SLUG_CONFLICT',
        message: 'A category with this name already exists',
      });
    }
  }

  private toSlug(name: string): string {
    const slug = name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) {
      throw new ConflictException({
        code: 'CATEGORY_INVALID_NAME',
        message: 'Category name must contain letters or numbers',
      });
    }

    return slug;
  }

  private categoryNotFound(): NotFoundException {
    return new NotFoundException({
      code: 'CATEGORY_NOT_FOUND',
      message: 'Category not found',
    });
  }
}
