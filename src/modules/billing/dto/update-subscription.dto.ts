import { IsEnum, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { TenantPlan } from '../entities/subscription.entity';

export class UpdateSubscriptionDto {
    @IsOptional()
    @IsEnum(TenantPlan)
    plan?: TenantPlan;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsBoolean()
    autoRenew?: boolean;
}
