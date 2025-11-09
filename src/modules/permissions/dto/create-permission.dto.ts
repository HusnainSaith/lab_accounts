import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @MinLength(2)
  permissionNameEn: string;

  @IsOptional()
  @IsString()
  permissionNameAr?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;
}