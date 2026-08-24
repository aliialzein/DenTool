import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsDto } from './dto/find-products.dto';
import { FindProductsByIdsDto } from './dto/find-products-by-ids.dto';
import { CreateImageSignatureDto } from './dto/create-image-signature.dto';
import { SessionGuard } from '../auth/guards/session.guard';
import { AttachProductImageDto } from './dto/attach-product-image.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findMany(@Query() query: FindProductsDto) {
    return this.productsService.findMany(query);
  }

  @Get('admin')
  @UseGuards(SessionGuard, AdminGuard)
  async findManyAdmin(@Query() query: FindProductsDto) {
    return this.productsService.findManyAdmin(query);
  }

  @Get('by-ids')
  async findByIds(@Query() query: FindProductsByIdsDto) {
    return this.productsService.findByIds(query);
  }

  @Get('id/:id')
  async findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @UseGuards(SessionGuard, AdminGuard)
  @Get('admin/id/:id')
  async findByIdAdmin(@Param('id') id: string) {
    return this.productsService.findByIdAdmin(id);
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @UseGuards(SessionGuard, AdminGuard, CsrfGuard)
  @Post()
  async create(@Body() data: CreateProductDto) {
    return this.productsService.create(data);
  }

  @UseGuards(SessionGuard, AdminGuard, CsrfGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateProductDto) {
    return this.productsService.update(id, data);
  }

  @UseGuards(SessionGuard, AdminGuard, CsrfGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  @UseGuards(SessionGuard, AdminGuard, CsrfGuard)
  @Post(':id/images/signature')
  async generateImageUploadSignature(
    @Param('id') id: string,
    @Body() data: CreateImageSignatureDto,
  ) {
    return this.productsService.generateImageUploadSignature(id, data);
  }

  @UseGuards(SessionGuard, AdminGuard, CsrfGuard)
  @Post(':id/images')
  async attachImage(
    @Param('id') id: string,
    @Body() data: AttachProductImageDto,
  ) {
    return this.productsService.attachImage(id, data);
  }

  @UseGuards(SessionGuard, AdminGuard, CsrfGuard)
  @Delete(':productId/images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeImage(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ): Promise<void> {
    await this.productsService.removeImage(productId, imageId);
  }
}
