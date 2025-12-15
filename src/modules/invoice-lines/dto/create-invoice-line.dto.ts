import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateInvoiceLineDto {
  @IsString()
  invoiceId: string;

  @IsNumber()
  lineNo: number;

  @IsOptional()
  @IsString()
  itemId?: string;

  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  taxPercent?: number;

  @IsOptional()
  @IsNumber()
  taxAmount?: number;

  @IsNumber()
  lineTotal: number;

  @IsOptional()
  @IsString()
  accountId?: string;
}