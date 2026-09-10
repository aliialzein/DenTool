import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  Matches,
  IsString,
  IsUUID,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductOptionValueDto {
  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsNumber()
  priceAdjustment!: number;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  colorHex?: string;

  @IsBoolean()
  isActive!: boolean;
}

export class ProductOptionGroupDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsBoolean()
  isRequired!: boolean;

  @IsBoolean()
  isActive!: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOptionValueDto)
  values!: ProductOptionValueDto[];
}

export class CreateProductDto {
  @IsUUID()
  categoryId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @IsBoolean()
  isOnSale: boolean = false;

  @IsNumber()
  @Min(0)
  stockQuantity!: number;

  @IsBoolean()
  isAvailable!: boolean;

  @IsBoolean()
  isActive!: boolean;

  @IsObject()
  useCases!: Record<string, unknown>;

  @IsObject()
  specifications!: Record<string, unknown>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOptionGroupDto)
  optionGroups: ProductOptionGroupDto[] = [];
}
