import { IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  roleName?: string;

  @IsOptional()
  @IsString()
  description?: string;
}