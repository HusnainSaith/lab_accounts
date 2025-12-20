import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @MinLength(2)
  code: string;

  @IsOptional()
  @IsString()
  description?: string;
}