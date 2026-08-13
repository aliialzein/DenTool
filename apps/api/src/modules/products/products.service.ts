import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { ProductsRepository } from './repositories/products.repositories';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsDto } from './dto/find-products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async findMany(query: FindProductsDto) {
    const result = await this.productsRepository.findMany({
      ...query,
      isActive: true,
    });

    return {
      items: result.items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const product = await this.productsRepository.findBySlug(slug);

    if (!product || !product.isActive) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    return product;
  }

  async create(data: CreateProductDto) {
    const existingProduct = await this.productsRepository.findBySlug(data.slug);

    if (existingProduct) {
      throw new ConflictException({
        code: 'PRODUCT_SLUG_EXISTS',
        message: 'A product with this slug already exists.',
      });
    }

    const productData: Prisma.ProductCreateInput = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: data.price,
      stockQuantity: data.stockQuantity,
      isAvailable: data.isAvailable,
      isActive: data.isActive,
      useCases: data.useCases as Prisma.InputJsonValue,
      specifications: data.specifications as Prisma.InputJsonValue,
      category: {
        connect: {
          id: data.categoryId,
        },
      },
    };

    return this.productsRepository.create(productData);
  }

  async update(id: string, data: UpdateProductDto) {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    if (data.slug && data.slug !== product.slug) {
      const existingProduct = await this.productsRepository.findBySlug(
        data.slug,
      );

      if (existingProduct) {
        throw new ConflictException({
          code: 'PRODUCT_SLUG_EXISTS',
          message: 'A product with this slug already exists.',
        });
      }
    }

    const productData: Prisma.ProductUpdateInput = {
      ...(data.name !== undefined && {
        name: data.name,
      }),

      ...(data.slug !== undefined && {
        slug: data.slug,
      }),

      ...(data.description !== undefined && {
        description: data.description,
      }),

      ...(data.price !== undefined && {
        price: data.price,
      }),

      ...(data.stockQuantity !== undefined && {
        stockQuantity: data.stockQuantity,
      }),

      ...(data.isAvailable !== undefined && {
        isAvailable: data.isAvailable,
      }),

      ...(data.isActive !== undefined && {
        isActive: data.isActive,
      }),

      ...(data.useCases !== undefined && {
        useCases: data.useCases as Prisma.InputJsonValue,
      }),

      ...(data.specifications !== undefined && {
        specifications: data.specifications as Prisma.InputJsonValue,
      }),

      ...(data.categoryId !== undefined && {
        category: {
          connect: {
            id: data.categoryId,
          },
        },
      }),
    };

    return this.productsRepository.update(id, productData);
  }

  async delete(id: string) {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    return this.productsRepository.delete(id);
  }
}
