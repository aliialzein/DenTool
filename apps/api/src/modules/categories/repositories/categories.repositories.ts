import { Injectable } from '@nestjs/common';
import { Prisma, Category } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(
    name: string,
    slug: string,
    description?: string,
    imagePublicId?: string,
    imageUrl?: string,
  ): Promise<Category> {
    return this.prisma.category.create({
      data: {
        name,
        slug,
        description,
        imagePublicId,
        imageUrl,
      },
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { slug },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  async findAllActive(): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async countProductsByCategoryId(id: string): Promise<number> {
    return this.prisma.product.count({
      where: { categoryId: id },
    });
  }

  async deleteCategory(id: string): Promise<Category> {
    return this.prisma.category.delete({
      where: { id },
    });
  }

  async updateCategory(
    id: string,
    data: Prisma.CategoryUpdateInput,
  ): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }
}
