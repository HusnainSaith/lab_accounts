import { IsString, IsEmail, IsOptional, IsBoolean, IsIn, MinLength } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nameEn?: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  addressEn?: string;

  @IsOptional()
  @IsString()
  addressAr?: string;

  @IsOptional()
  @IsString()
  cityEn?: string;

  @IsOptional()
  @IsString()
  cityAr?: string;

  @IsOptional()
  @IsString()
  @IsIn(['UAE', 'KSA', 'EGY'])
  countryCode?: string;

  @IsOptional()
  @IsBoolean()
  isVatRegistered?: boolean;

  @IsOptional()
  @IsString()
  trn?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;
}