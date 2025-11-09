import { IsString, IsEmail, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { UserRole, UserLanguage } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  firstNameEn: string;

  @IsOptional()
  @IsString()
  firstNameAr?: string;

  @IsString()
  lastNameEn: string;

  @IsOptional()
  @IsString()
  lastNameAr?: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

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