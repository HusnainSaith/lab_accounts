import {
  IsEmail,
  IsString,
  IsIn,
  MinLength,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  firstNameEn: string;

  @IsOptional()
  @IsString()
  firstNameAr?: string;

  @IsString()
  @MinLength(2)
  lastNameEn: string;

  @IsOptional()
  @IsString()
  lastNameAr?: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  companyName: string;

  @IsOptional()
  @IsString()
  companyNameAr?: string;

  @IsOptional()
  @IsString()
  trn?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @IsIn(['AE', 'SA', 'EG'])
  countryCode: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
