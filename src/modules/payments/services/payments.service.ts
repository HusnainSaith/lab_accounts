import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { Invoice, InvoiceStatus } from '../../invoices/entities/invoice.entity';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private paymentsRepository: Repository<Payment>,
    ) { }

    async create(createPaymentDto: CreatePaymentDto, companyId: string): Promise<Payment> {
        let paymentNumber = createPaymentDto.paymentNumber;
        if (!paymentNumber) {
            paymentNumber = await this.generatePaymentNumber(companyId);
        }

        const payment = this.paymentsRepository.create({
            ...createPaymentDto,
            paymentNumber,
            companyId,
            status: PaymentStatus.PENDING,
        });

        return await this.paymentsRepository.save(payment);
    }

    async findAll(): Promise<Payment[]> {
        return await this.paymentsRepository.find({
            relations: ['account'],
            order: { date: 'DESC', createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Payment> {
        const payment = await this.paymentsRepository.findOne({
            where: { id },
            relations: ['account', 'company', 'invoice'],
        });

        if (!payment) {
            throw new NotFoundException(`Payment with ID "${id}" not found`);
        }

        return payment;
    }

    async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
        await this.findOne(id);
        await this.paymentsRepository.update(id, updatePaymentDto);
        return this.findOne(id);
    }

    async confirm(id: string): Promise<Payment> {
        const payment = await this.findOne(id);

        if (payment.status === PaymentStatus.CONFIRMED) {
            return payment; // Already confirmed
        }

        payment.status = PaymentStatus.CONFIRMED;
        const confirmedPayment = await this.paymentsRepository.save(payment);

        // Update invoice if payment is linked to one
        if (payment.invoiceId) {
            await this.updateInvoicePayment(payment.invoiceId, payment.amount);
        }

        return confirmedPayment;
    }

    private async updateInvoicePayment(invoiceId: string, paymentAmount: number): Promise<void> {
        const invoice = await this.paymentsRepository.manager
            .getRepository(Invoice)
            .findOne({ where: { id: invoiceId } });

        if (!invoice) {
            return; // Invoice not found, skip update
        }

        // Update paid amount
        const currentPaid = Number(invoice.paidAmount) || 0;
        const newPaidAmount = currentPaid + Number(paymentAmount);
        const totalAmount = Number(invoice.totalAmount);

        // Determine new status
        let newStatus = invoice.status;
        if (newPaidAmount >= totalAmount) {
            newStatus = InvoiceStatus.PAID;
        } else if (newPaidAmount > 0) {
            newStatus = InvoiceStatus.PARTIALLY_PAID;
        }

        // Update invoice
        await this.paymentsRepository.manager
            .getRepository(Invoice)
            .update(invoiceId, {
                paidAmount: newPaidAmount,
                status: newStatus,
            });
    }

    async cancel(id: string): Promise<Payment> {
        const payment = await this.findOne(id);
        payment.status = PaymentStatus.CANCELLED;
        return await this.paymentsRepository.save(payment);
    }

    async remove(id: string): Promise<void> {
        const payment = await this.findOne(id);
        await this.paymentsRepository.remove(payment);
    }

    private async generatePaymentNumber(companyId: string): Promise<string> {
        // Basic logic: PAY-YYYYMMDD-XXXX
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        const prefix = `PAY-${dateStr}-`;

        const lastPayment = await this.paymentsRepository
            .createQueryBuilder('payment')
            .where('payment.companyId = :companyId', { companyId })
            .andWhere('payment.payment_number LIKE :prefix', { prefix: `${prefix}%` })
            .orderBy('payment.payment_number', 'DESC')
            .getOne();

        let sequence = 1;
        if (lastPayment) {
            const parts = lastPayment.paymentNumber.split('-');
            const lastSeq = parseInt(parts[parts.length - 1]);
            if (!isNaN(lastSeq)) {
                sequence = lastSeq + 1;
            }
        }

        return `${prefix}${sequence.toString().padStart(4, '0')}`;
    }
}
