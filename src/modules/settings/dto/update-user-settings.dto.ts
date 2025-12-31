import { IsOptional, IsString, IsObject, IsEnum } from 'class-validator';

export class UpdateUserSettingsDto {
    @IsOptional()
    @IsEnum(['light', 'dark'])
    theme?: 'light' | 'dark';

    @IsOptional()
    @IsEnum(['en', 'ur'])
    language?: 'en' | 'ur';

    @IsOptional()
    @IsObject()
    notifications?: {
        email?: boolean;
        push?: boolean;
        sms?: boolean;
    };

    @IsOptional()
    @IsString()
    dateFormat?: string;

    @IsOptional()
    @IsString()
    numberFormat?: string;

    @IsOptional()
    @IsString()
    timezone?: string;
}
