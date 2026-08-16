import { IsString, IsNotEmpty } from 'class-validator';

export class AttachProductImageDto {
  @IsString()
  @IsNotEmpty()
  fileId!: string;
}
