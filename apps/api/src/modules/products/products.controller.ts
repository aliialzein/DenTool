import {
  Body,
  Controller,
  Delete,
  Get,
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

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findMany(@Query() query: FindProductsDto) {
    return this.productsService.findMany(query);
  }

  @Get('by-ids')
  async findByIds(@Query() query: FindProductsByIdsDto) {
    return this.productsService.findByIds(query);
  }

  @Get('id/:id')
  async findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @UseGuards(SessionGuard)
  @Post()
  async create(@Body() data: CreateProductDto) {
    return this.productsService.create(data);
  }

  @UseGuards(SessionGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateProductDto) {
    return this.productsService.update(id, data);
  }

  @UseGuards(SessionGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  @UseGuards(SessionGuard)
  @Post(':id/images/signature')
  async generateImageUploadSignature(
    @Param('id') id: string,
    @Body() data: CreateImageSignatureDto,
  ) {
    return this.productsService.generateImageUploadSignature(id, data);
  }

  @UseGuards(SessionGuard)
  @Post(':id/images')
  async attachImage(
    @Param('id') id: string,
    @Body() data: AttachProductImageDto,
  ) {
    return this.productsService.attachImage(id, data);
  }
}
