import { IsString, IsDateString } from 'class-validator';

export class CreateFiscalYearDto {
  @IsString()
  yearName: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}