import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { UserRole, UserLanguage } from '../entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstNameEn?: string;

  @IsOptional()
  @IsString()
  firstNameAr?: string;

  @IsOptional()
  @IsString()
  lastNameEn?: string;

  @IsOptional()
  @IsString()
  lastNameAr?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(UserLanguage)
  preferredLanguage?: UserLanguage;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}