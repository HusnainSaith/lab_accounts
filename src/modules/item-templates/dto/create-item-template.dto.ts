import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateItemTemplateDto {
  @IsOptional()
  @IsString()
  industry?: string;

  @IsString()
  @MinLength(2)
  itemName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  suggestedCategory?: string;
}