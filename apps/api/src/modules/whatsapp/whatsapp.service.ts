import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/browser';

import { CreateWhatsAppPurchaseRequestDto } from './dto/whatsapp.dto';
import { WhatsAppErrorCode } from './whatsapp.constants';

@Injectable()
export class WhatsAppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createPurchaseRequest(dto: CreateWhatsAppPurchaseRequestDto) {
    const productIds = dto.items.map((item) => item.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        optionGroups: {
          where: { isActive: true },
          include: { values: { where: { isActive: true } } },
        },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const lines: string[] = [];
    let total = new Prisma.Decimal(0);

    dto.items.forEach((item, index) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new BadRequestException({
          code: WhatsAppErrorCode.PRODUCT_NOT_FOUND,
          message: `Product ${item.productId} not found`,
          productId: item.productId,
        });
      }

      if (!product.isActive || !product.isAvailable) {
        throw new BadRequestException({
          code: WhatsAppErrorCode.PRODUCT_UNAVAILABLE,
          message: `${product.name} is no longer available`,
          productId: item.productId,
        });
      }

      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException({
          code: WhatsAppErrorCode.INSUFFICIENT_STOCK,
          message: `Only ${product.stockQuantity} units of ${product.name} are currently available`,
          productId: item.productId,
          availableStock: product.stockQuantity,
        });
      }

      const selectedIds = new Set(item.selectedOptionValueIds);
      const selectedValues = product.optionGroups.flatMap((group) =>
        group.values.filter((value) => selectedIds.has(value.id)),
      );

      if (selectedValues.length !== selectedIds.size) {
        throw new BadRequestException({
          code: WhatsAppErrorCode.INVALID_OPTION,
          message: `${product.name} has an invalid option selection`,
          productId: item.productId,
        });
      }

      for (const group of product.optionGroups) {
        const selectedInGroup = selectedValues.filter(
          (value) => value.groupId === group.id,
        );

        if (
          selectedInGroup.length > 1 ||
          (group.isRequired && selectedInGroup.length !== 1)
        ) {
          throw new BadRequestException({
            code: WhatsAppErrorCode.INVALID_OPTION,
            message: `${product.name} requires one valid ${group.name} selection`,
            productId: item.productId,
          });
        }
      }

      const basePrice =
        product.isOnSale && product.salePrice
          ? product.salePrice
          : product.price;
      const unitPrice = selectedValues.reduce(
        (price, value) => price.add(value.priceAdjustment),
        basePrice,
      );
      const lineTotal = unitPrice.mul(item.quantity);
      total = total.add(lineTotal);

      lines.push(
        `${index + 1}. ${product.name}\n   ${selectedValues.map((value) => `Option: ${value.label}`).join('\n   ')}${selectedValues.length ? '\n   ' : ''}Quantity: ${item.quantity}\n   Price: ${this.formatPrice(unitPrice)}\n   Subtotal: ${this.formatPrice(lineTotal)}`,
      );
    });

    const message = [
      'Hello DenTool,',
      '',
      "I'd like to order the following products:",
      '',
      lines.join('\n\n'),
      '',
      `Total: ${this.formatPrice(total)}`,
      '',
      'Thank you.',
    ].join('\n');

    const businessNumber = this.configService.get<string>(
      'WHATSAPP_BUSINESS_NUMBER',
      '961XXXXXXXX',
    );
    const whatsappUrl = `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;

    return { whatsappUrl };
  }

  private formatPrice(price: InstanceType<typeof Prisma.Decimal>): string {
    return `$${price.toFixed(2)}`;
  }
}
