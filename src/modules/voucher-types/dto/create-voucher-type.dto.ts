import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export enum VoucherNature {
  PAYMENT = 'payment',
  RECEIPT = 'receipt',
  JOURNAL = 'journal',
  CONTRA = 'contra',
  SALES = 'sales',
  PURCHASE = 'purchase',
  CREDIT_NOTE = 'credit_note',
  DEBIT_NOTE = 'debit_note',
  OPENING = 'opening',
}

export class CreateVoucherTypeDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsEnum(VoucherNature)
  nature: VoucherNature;

  @IsOptional()
  @IsBoolean()
  autoNumbering?: boolean;

  @IsOptional()
  @IsString()
  prefix?: string;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;
}