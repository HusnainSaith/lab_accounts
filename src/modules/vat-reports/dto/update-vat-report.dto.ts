import { IsOptional, IsNumber, Min, IsIn } from 'class-validator';
import { VatReportStatus } from '../entities/vat-report.entity';

export class UpdateVatReportDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalSales?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalVatCollected?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPurchases?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalVatPaid?: number;

  @IsOptional()
  @IsNumber()
  netVatPayable?: number;

  @IsOptional()
  @IsIn([VatReportStatus.DRAFT, VatReportStatus.SUBMITTED, VatReportStatus.APPROVED])
  reportStatus?: VatReportStatus;
}