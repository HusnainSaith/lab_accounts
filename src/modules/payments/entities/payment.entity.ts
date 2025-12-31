import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Account } from '../../companies/entities/account.entity';
import { Company } from '../../companies/entities/company.entity';

export enum PaymentMethod {
    CASH = 'cash',
    BANK = 'bank',
    CHECK = 'check',
    CARD = 'card',
    OTHER = 'other'
}

export enum PaymentStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled'
}

@Entity('payments')
@Unique('uq_payment_no', ['companyId', 'paymentNumber'])
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'payment_number', length: 50 })
    paymentNumber: string;

    @Column({ name: 'company_id' })
    companyId: string;

    @Column({ type: 'date' })
    date: Date;

    @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod, default: PaymentMethod.CASH })
    paymentMethod: PaymentMethod;

    @Column({ type: 'decimal', precision: 18, scale: 2 })
    amount: number;

    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;

    @Column({ length: 100, nullable: true })
    reference: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ name: 'account_id' })
    accountId: string;

    @Column({ name: 'invoice_id', nullable: true })
    invoiceId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Account)
    @JoinColumn({ name: 'account_id' })
    account: Account;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @ManyToOne('Invoice')
    @JoinColumn({ name: 'invoice_id' })
    invoice: unknown;
}
