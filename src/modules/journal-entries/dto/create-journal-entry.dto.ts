import { IsString, IsDateString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJournalEntryLineDto {
  @IsString()
  accountId: string;

  @IsString()
  debit: string;

  @IsString()
  credit: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  partyId?: string;
}

export class CreateJournalEntryDto {
  @IsString()
  voucherTypeId: string;

  @IsString()
  voucherNo: string;

  @IsDateString()
  entryDate: string;

  @IsDateString()
  postingDate: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJournalEntryLineDto)
  lines: CreateJournalEntryLineDto[];
}