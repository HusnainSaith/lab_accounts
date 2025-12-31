import { IsEnum, IsString, IsOptional, IsObject, IsUrl } from 'class-validator';
import { IntegrationType } from '../entities/integration.entity';

export class CreateIntegrationDto {
    @IsEnum(IntegrationType)
    type: IntegrationType;

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsObject()
    config?: Record<string, any>;

    @IsOptional()
    @IsObject()
    credentials?: Record<string, any>;

    @IsOptional()
    @IsUrl()
    webhookUrl?: string;

    @IsOptional()
    @IsString()
    apiKey?: string;

    @IsOptional()
    @IsString()
    apiSecret?: string;
}
