import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class WhatsAppItemDto {
  @IsUUID()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsArray()
  @IsUUID('4', { each: true })
  selectedOptionValueIds!: string[];
}

export class CreateWhatsAppPurchaseRequestDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Cart cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => WhatsAppItemDto)
  items!: WhatsAppItemDto[];
}
