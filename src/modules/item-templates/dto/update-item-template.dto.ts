import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateItemTemplateDto {
  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  itemName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  suggestedCategory?: string;
}