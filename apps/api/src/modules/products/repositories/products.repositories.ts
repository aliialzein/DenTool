import { Injectable } from '@nestjs/common';
import { Prisma, Product } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';

export interface FindManyProductsParams {
  search?: string;
  categoryId?: string;
  isAvailable?: boolean;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface FindManyProductsResult {
  items: ProductWithRelations[];
  total: number;
}

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: {
      select: {
        id: true;
        name: true;
        slug: true;
      };
    };
    images: {
      orderBy: {
        sortOrder: 'asc';
      };
    };
  };
}>;

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ProductWithRelations | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({
      data,
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Product> {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async findMany(
    params: FindManyProductsParams,
  ): Promise<FindManyProductsResult> {
    const {
      search,
      categoryId,
      isAvailable,
      isActive,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page,
      limit,
    } = params;

    const where: Prisma.ProductWhereInput = {
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      }),

      ...(categoryId && {
        categoryId,
      }),

      ...(isAvailable !== undefined && {
        isAvailable,
      }),

      ...(isActive !== undefined && {
        isActive,
      }),

      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && {
            gte: minPrice,
          }),
          ...(maxPrice !== undefined && {
            lte: maxPrice,
          }),
        },
      }),
    };

    const skip = (page - 1) * limit;

    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      }),

      this.prisma.product.count({
        where,
      }),
    ]);

    return {
      items,
      total,
    };
  }
}
