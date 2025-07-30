import { IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  content?: string;
}
