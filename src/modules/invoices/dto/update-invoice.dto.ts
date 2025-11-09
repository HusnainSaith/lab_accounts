import { IsEnum, IsDateString, IsString, IsNumber, IsOptional } from 'class-validator';
import { InvoiceStatus } from '../entities/invoice.entity';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @IsOptional()
  @IsDateString()
  supplyDate?: Date;

  @IsOptional()
  @IsString()
  notesEn?: string;

  @IsOptional()
  @IsString()
  notesAr?: string;

  @IsOptional()
  @IsString()
  paymentMethodEn?: string;

  @IsOptional()
  @IsString()
  paymentMethodAr?: string;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @IsString()
  pdfPath?: string;

  @IsOptional()
  @IsString()
  qrCodeData?: string;
}