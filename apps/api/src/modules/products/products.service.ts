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
import { ImageKitService } from '../../integrations/ImageKit/imagekit.service';
import { ProductImagesRepository } from './repositories/product-images.repositories';
import { CreateImageSignatureDto } from './dto/create-image-signature.dto';
import { AttachProductImageDto } from './dto/attach-product-image.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly productImagesRepository: ProductImagesRepository,
    private readonly imageKitService: ImageKitService,
  ) {}

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
}
