import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateItemTemplateDto {
  @IsOptional()
  @IsString()
  industryEn?: string;

  @IsOptional()
  @IsString()
  industryAr?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  itemNameEn?: string;

  @IsOptional()
  @IsString()
  itemNameAr?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsOptional()
  @IsString()
  suggestedCategoryEn?: string;

  @IsOptional()
  @IsString()
  suggestedCategoryAr?: string;
}