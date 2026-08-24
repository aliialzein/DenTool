import { IsNotEmpty, IsString } from 'class-validator';

export class AttachCategoryImageDto {
  @IsString()
  @IsNotEmpty()
  fileId!: string;
}
