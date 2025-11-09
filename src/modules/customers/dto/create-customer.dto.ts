import { IsString, IsEmail, IsOptional, IsBoolean, MinLength, IsEnum } from 'class-validator';
import { CustomerType } from '../entities/customer.entity';

export class CreateCustomerDto {
  @IsEnum(CustomerType)
  customerType: CustomerType;

  @IsString()
  @MinLength(2)
  name: string;

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
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsBoolean()
  isVatRegistered?: boolean;
}