import { IsString, IsEmail, IsOptional, IsBoolean, MinLength, IsEnum } from 'class-validator';
import { CustomerType } from '../entities/customer.entity';

export class CreateCustomerDto {
  @IsEnum(CustomerType)
  customerType: CustomerType;

  @IsString()
  @MinLength(2)
  nameEn: string;

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
  trn?: string;

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
  countryCode?: string;

  @IsOptional()
  @IsBoolean()
  isVatRegistered?: boolean;
}