import { IsString, IsDateString, IsOptional } from 'class-validator';

export class DashboardStatsDto {
  @IsString()
  companyId: string;
}

export class RevenueChartDto {
  @IsString()
  companyId: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}