import { IsString, MinLength, IsOptional } from 'class-validator';

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  permissionName?: string;

  @IsOptional()
  @IsString()
  description?: string;
}