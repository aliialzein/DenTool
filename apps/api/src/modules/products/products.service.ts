import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import ImageKit from '@imagekit/nodejs';
import { ProductsRepository } from './repositories/products.repositories';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsDto } from './dto/find-products.dto';
import { FindProductsByIdsDto } from './dto/find-products-by-ids.dto';
import { ImageKitService } from '../../integrations/ImageKit/imagekit.service';
import { ProductImagesRepository } from './repositories/product-images.repositories';
import { CreateImageSignatureDto } from './dto/create-image-signature.dto';
import { AttachProductImageDto } from './dto/attach-product-image.dto';
import { CacheService } from '../../infrastructure/cache/cache.service';
import {
  getProductBySlugCacheKey,
  PRODUCT_CACHE_TTL_SECONDS,
} from './products.cache';
import { ProductResponse } from './products.types';
import { ProductOptionGroupDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly productImagesRepository: ProductImagesRepository,
    private readonly imageKitService: ImageKitService,
    private readonly cacheService: CacheService,
  ) {}

  async findMany(query: FindProductsDto) {
    const result = await this.productsRepository.findMany({
      ...query,
      isActive: true,
    });

    return {
      items: result.items.map((product) => ({
        ...product,
        ...this.normalizeProduct(product),
      })),

      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  }

  async findManyAdmin(query: FindProductsDto) {
    const result = await this.productsRepository.findMany(query);

    return {
      items: result.items.map((product) => ({
        ...product,
        ...this.normalizeProduct(product),
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  }

  async findByIds(query: FindProductsByIdsDto) {
    const ids = [...new Set(query.ids)];

    if (ids.length === 0) {
      return [];
    }

    const products = await this.productsRepository.findByIds(ids);

    return products.map((product) => ({
      ...product,
      ...this.normalizeProduct(product),
    }));
  }

  async findById(id: string) {
    const product = await this.productsRepository.findById(id);

    if (!product || !product.isActive) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    return {
      ...product,
      ...this.normalizeProduct(product),
    };
  }

  async findByIdAdmin(id: string) {
    const product = await this.productsRepository.findByIdAdmin(id);

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    return this.normalizeProduct(product);
  }

  async findBySlug(slug: string): Promise<ProductResponse> {
    const cacheKey = getProductBySlugCacheKey(slug);

    const cachedProduct =
      await this.cacheService.get<ProductResponse>(cacheKey);

    if (cachedProduct) {
      return cachedProduct;
    }

    const product = await this.productsRepository.findBySlug(slug);

    if (!product || !product.isActive) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    const result: ProductResponse = this.normalizeProduct(product);

    await this.cacheService.set(cacheKey, result, PRODUCT_CACHE_TTL_SECONDS);

    return result;
  }

  async create(data: CreateProductDto) {
    this.validateSale(data.price, data.salePrice, data.isOnSale);
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
      salePrice: data.isOnSale ? data.salePrice : null,
      isOnSale: data.isOnSale,
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
      optionGroups: {
        create: this.buildOptionGroups(data.optionGroups),
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

    this.validateSale(
      data.price ?? Number(product.price),
      data.salePrice === undefined
        ? product.salePrice === null
          ? undefined
          : Number(product.salePrice)
        : (data.salePrice ?? undefined),
      data.isOnSale ?? product.isOnSale,
    );

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

      ...(data.salePrice !== undefined && {
        salePrice: data.isOnSale === false ? null : data.salePrice,
      }),

      ...(data.isOnSale !== undefined && {
        isOnSale: data.isOnSale,
        ...(data.isOnSale === false && { salePrice: null }),
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

      ...(data.optionGroups !== undefined && {
        optionGroups: {
          deleteMany: {},
          create: this.buildOptionGroups(data.optionGroups),
        },
      }),
    };

    const updatedProduct = await this.productsRepository.update(
      id,
      productData,
    );

    await this.cacheService.delete(getProductBySlugCacheKey(product.slug));

    return updatedProduct;
  }

  private validateSale(
    price: number,
    salePrice: number | null | undefined,
    isOnSale: boolean,
  ) {
    if (salePrice !== undefined && salePrice !== null && salePrice >= price) {
      throw new BadRequestException({
        code: 'INVALID_SALE_PRICE',
        message: 'Sale price must be lower than the regular price.',
      });
    }

    if (isOnSale && (salePrice === undefined || salePrice === null)) {
      throw new BadRequestException({
        code: 'SALE_PRICE_REQUIRED',
        message: 'An active sale requires a sale price.',
      });
    }
  }

  private buildOptionGroups(groups: ProductOptionGroupDto[]) {
    return groups.map((group, groupIndex) => ({
      name: group.name.trim(),
      isRequired: group.isRequired,
      isActive: group.isActive,
      sortOrder: groupIndex,
      values: {
        create: group.values.map((value, valueIndex) => ({
          label: value.label.trim(),
          priceAdjustment: value.priceAdjustment,
          colorHex: value.colorHex,
          isActive: value.isActive,
          sortOrder: valueIndex,
        })),
      },
    }));
  }

  private normalizeProduct<T extends { price: unknown; salePrice?: unknown }>(
    product: T,
  ) {
    return {
      ...product,
      price: Number(product.price),
      salePrice:
        product.salePrice === null || product.salePrice === undefined
          ? product.salePrice
          : Number(product.salePrice),
      optionGroups:
        'optionGroups' in product
          ? (
              product as T & {
                optionGroups: Array<{
                  values: Array<{ priceAdjustment: unknown }>;
                }>;
              }
            ).optionGroups.map((group) => ({
              ...group,
              values: group.values.map((value) => ({
                ...value,
                priceAdjustment: Number(value.priceAdjustment),
              })),
            }))
          : undefined,
    };
  }

  async delete(id: string) {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    await this.productsRepository.delete(id);

    await this.cacheService.delete(getProductBySlugCacheKey(product.slug));
  }

  async generateImageUploadSignature(
    productId: string,
    data: CreateImageSignatureDto,
  ) {
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    if (!['image/jpeg', 'image/png'].includes(data.mimeType)) {
      throw new BadRequestException({
        code: 'INVALID_IMAGE_TYPE',
        message: 'Only JPEG and PNG images are allowed.',
      });
    }

    if (data.fileSize > 5 * 1024 * 1024) {
      throw new BadRequestException({
        code: 'IMAGE_TOO_LARGE',
        message: 'Image size cannot exceed 5 MB.',
      });
    }

    const imageCount =
      await this.productImagesRepository.countByProductId(productId);

    if (imageCount >= 5) {
      throw new ConflictException({
        code: 'PRODUCT_IMAGE_LIMIT_REACHED',
        message: 'A product cannot have more than 5 images.',
      });
    }

    const authenticationParameters =
      this.imageKitService.generateUploadAuthParams();

    return {
      ...authenticationParameters,
      publicKey: this.imageKitService.getPublicKey(),
      urlEndpoint: this.imageKitService.getUrlEndpoint(),
      folder: `dentool/products/${productId}`,
    };
  }

  async attachImage(productId: string, data: AttachProductImageDto) {
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    const imageCount =
      await this.productImagesRepository.countByProductId(productId);

    if (imageCount >= 5) {
      throw new ConflictException({
        code: 'PRODUCT_IMAGE_LIMIT_REACHED',
        message: 'A product cannot have more than 5 images.',
      });
    }

    const expectedFolder = `/dentool/products/${productId}/`;

    let file: ImageKit.File;

    try {
      file = await this.imageKitService.getFile(data.fileId);
    } catch {
      throw new NotFoundException({
        code: 'IMAGE_NOT_FOUND',
        message: 'Image not found.',
      });
    }

    if (!file.filePath) {
      throw new BadRequestException({
        code: 'INVALID_IMAGE',
        message: 'Image file path is missing.',
      });
    }

    if (!file.fileId || !file.url) {
      throw new BadRequestException({
        code: 'INVALID_IMAGE',
        message: 'Image metadata is incomplete.',
      });
    }

    if (!file.filePath.startsWith(expectedFolder)) {
      throw new BadRequestException({
        code: 'INVALID_IMAGE_OWNERSHIP',
        message: 'Image does not belong to this product.',
      });
    }

    return this.productImagesRepository.create({
      publicId: file.fileId,
      secureUrl: file.url,
      sortOrder: imageCount,
      product: {
        connect: {
          id: productId,
        },
      },
    });
  }

  async removeImage(productId: string, imageId: string): Promise<void> {
    const product = await this.productsRepository.findById(productId);
    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    const image = await this.productImagesRepository.findById(imageId);
    if (!image) {
      throw new NotFoundException({
        code: 'IMAGE_NOT_FOUND',
        message: 'Image not found.',
      });
    }
    if (image.productId !== productId) {
      throw new ConflictException({
        code: 'INVALID_IMAGE_OWNERSHIP',
        message: 'Image does not belong to this product.',
      });
    }

    await this.productImagesRepository.delete(imageId);
    await this.imageKitService.deleteFile(image.publicId);
  }
}
