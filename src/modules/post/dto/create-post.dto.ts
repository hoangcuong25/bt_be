import { IsMongoId, IsOptional, IsString } from "class-validator";

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsMongoId()
  categoryId: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
