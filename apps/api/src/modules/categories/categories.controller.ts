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
  UseGuards,
} from '@nestjs/common';
import { IsUUID } from 'class-validator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryImageSignatureDto } from './dto/create-category-image-signature.dto';
import { AttachCategoryImageDto } from './dto/attach-category-image.dto';

class CategoryIdParamDto {
  @IsUUID()
  id!: string;
}

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('admin')
  @UseGuards(SessionGuard, AdminGuard)
  findAllAdmin() {
    return this.categoriesService.findAllAdmin();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(SessionGuard, AdminGuard, CsrfGuard)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  @UseGuards(SessionGuard, AdminGuard, CsrfGuard)
  update(
    @Param() { id }: CategoryIdParamDto,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(SessionGuard, AdminGuard, CsrfGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() { id }: CategoryIdParamDto): Promise<void> {
    await this.categoriesService.remove(id);
  }

  @Post(':id/image/signature')
  @UseGuards(SessionGuard, AdminGuard, CsrfGuard)
  generateImageUploadSignature(
    @Param() { id }: CategoryIdParamDto,
    @Body() data: CreateCategoryImageSignatureDto,
  ) {
    return this.categoriesService.generateImageUploadSignature(id, data);
  }

  @Post(':id/image')
  @UseGuards(SessionGuard, AdminGuard, CsrfGuard)
  attachImage(
    @Param() { id }: CategoryIdParamDto,
    @Body() data: AttachCategoryImageDto,
  ) {
    return this.categoriesService.attachImage(id, data);
  }

  @Delete(':id/image')
  @UseGuards(SessionGuard, AdminGuard, CsrfGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeImage(@Param() { id }: CategoryIdParamDto): Promise<void> {
    await this.categoriesService.removeImage(id);
  }
}
