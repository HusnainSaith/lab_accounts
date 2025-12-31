import { IsEnum, IsNumber, IsOptional, IsString, IsDateString, IsUUID } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
    @IsDateString()
    date: string;

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsNumber()
    amount: number;

    @IsOptional()
    @IsString()
    reference?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsUUID()
    accountId: string;

    @IsOptional()
    @IsUUID()
    invoiceId?: string;

    @IsOptional()
    @IsString()
    paymentNumber?: string;
}
