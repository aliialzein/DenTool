import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateCategoryDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  imagePublicId?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
