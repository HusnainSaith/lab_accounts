import { IsString, IsUUID, IsIn, IsOptional } from 'class-validator';

export class GenerateInvoicePdfDto {
  @IsUUID()
  invoiceId: string;

  @IsOptional()
  @IsIn(['en', 'ar'])
  language?: 'en' | 'ar';
}

export class GenerateReportPdfDto {
  @IsString()
  reportType: string;

  @IsUUID()
  companyId: string;

  @IsOptional()
  @IsIn(['en', 'ar'])
  language?: 'en' | 'ar';

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;
}
