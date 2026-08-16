import { IsIn, IsInt, IsString, Max, Min } from 'class-validator';

export class CreateImageSignatureDto {
  @IsString()
  fileName!: string;

  @IsIn(['image/jpeg', 'image/png'])
  mimeType!: string;

  @IsInt()
  @Min(1)
  @Max(5 * 1024 * 1024)
  fileSize!: number;
}
