import { Injectable } from '@nestjs/common';
import { Prisma, ProductImage } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class ProductImagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countByProductId(productId: string): Promise<number> {
    return this.prisma.productImage.count({
      where: { productId },
    });
  }

  async create(data: Prisma.ProductImageCreateInput): Promise<ProductImage> {
    return this.prisma.productImage.create({
      data,
    });
  }

  async findById(id: string): Promise<ProductImage | null> {
    return this.prisma.productImage.findUnique({
      where: { id },
    });
  }

  async delete(id: string): Promise<ProductImage> {
    return this.prisma.productImage.delete({
      where: { id },
    });
  }
}
