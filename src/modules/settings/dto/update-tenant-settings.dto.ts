import { IsOptional, IsString, IsNumber, IsDateString, IsEmail } from 'class-validator';

export class UpdateTenantSettingsDto {
    @IsOptional()
    @IsString()
    companyName?: string;

    @IsOptional()
    @IsEmail()
    companyEmail?: string;

    @IsOptional()
    @IsString()
    companyPhone?: string;

    @IsOptional()
    @IsString()
    companyAddress?: string;

    @IsOptional()
    @IsDateString()
    fiscalYearStart?: string;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsNumber()
    taxRate?: number;

    @IsOptional()
    @IsString()
    logo?: string;
}
