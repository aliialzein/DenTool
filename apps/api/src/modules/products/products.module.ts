import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repositories';
import { AuthModule } from '../auth/auth.module';
import { ProductImagesRepository } from './repositories/product-images.repositories';

@Module({
  imports: [AuthModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository, ProductImagesRepository],
})
export class ProductsModule {}
