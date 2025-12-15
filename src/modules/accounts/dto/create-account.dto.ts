import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { AccountType, AccountLevel } from '../../companies/entities/account.entity';

export class CreateAccountDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(AccountType)
  type: AccountType;

  @IsEnum(AccountLevel)
  level: AccountLevel;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  isPosting?: boolean;

  @IsOptional()
  @IsNumber()
  openingBalance?: number;

  @IsOptional()
  @IsString()
  openingBalanceType?: 'debit' | 'credit';
}