import { Transform } from 'class-transformer';
import { IsOptional, IsUUID } from 'class-validator';

export class FindProductsByIdsDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      return value;
    }

    return value
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  })
  @IsUUID('4', { each: true })
  ids: string[] = [];
}
