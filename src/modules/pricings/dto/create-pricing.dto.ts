import {
  IsString,
  IsNumber,
  IsArray,
  IsObject,
  IsOptional,
} from 'class-validator';

export class FeatureDto {
  @IsString()
  name: string;

  @IsOptional()
  included?: boolean;
}

export class CreatePricingDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  period?: string;

  @IsArray()
  @IsObject({ each: true })
  features: FeatureDto[];
}
