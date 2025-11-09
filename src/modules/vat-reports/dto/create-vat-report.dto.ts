import { IsUUID, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateVatReportDto {
  @IsUUID()
  companyId: string;

  @IsDateString()
  reportPeriodStart: string;

  @IsDateString()
  reportPeriodEnd: string;

  @IsNumber()
  @Min(0)
  totalSales: number;

  @IsNumber()
  @Min(0)
  totalVatCollected: number;

  @IsNumber()
  @Min(0)
  totalPurchases: number;

  @IsNumber()
  @Min(0)
  totalVatPaid: number;

  @IsNumber()
  netVatPayable: number;
}