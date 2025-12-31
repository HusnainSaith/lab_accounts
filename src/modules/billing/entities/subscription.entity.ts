import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

export enum SubscriptionStatus {
    ACTIVE = 'active',
    TRIAL = 'trial',
    PAST_DUE = 'past_due',
    CANCELLED = 'cancelled',
    EXPIRED = 'expired',
}

export enum TenantPlan {
    FREE = 'free',
    BASIC = 'basic',
    PROFESSIONAL = 'professional',
    ENTERPRISE = 'enterprise',
}

@Entity('subscriptions')
export class Subscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'company_id' })
    companyId: string;

    @Column({ type: 'enum', enum: TenantPlan, default: TenantPlan.FREE })
    plan: TenantPlan;

    @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.TRIAL })
    status: SubscriptionStatus;

    @Column({ name: 'start_date', type: 'timestamp' })
    startDate: Date;

    @Column({ name: 'end_date', type: 'timestamp', nullable: true })
    endDate: Date;

    @Column({ name: 'trial_end_date', type: 'timestamp', nullable: true })
    trialEndDate: Date;

    @Column({ name: 'monthly_price', type: 'decimal', precision: 18, scale: 2, default: 0 })
    monthlyPrice: number;

    @Column({ name: 'yearly_price', type: 'decimal', precision: 18, scale: 2, default: 0 })
    yearlyPrice: number;

    @Column({ name: 'billing_cycle', type: 'varchar', length: 10, default: 'monthly' })
    billingCycle: 'monthly' | 'yearly';

    @Column({ name: 'stripe_customer_id', length: 255, nullable: true })
    stripeCustomerId: string;

    @Column({ name: 'stripe_subscription_id', length: 255, nullable: true })
    stripeSubscriptionId: string;

    @Column({ name: 'next_billing_date', type: 'timestamp', nullable: true })
    nextBillingDate: Date;

    @Column({ name: 'auto_renew', default: true })
    autoRenew: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @OneToMany(() => BillingTransaction, (transaction) => transaction.subscription)
    transactions: BillingTransaction[];
}

export enum TransactionType {
    CHARGE = 'charge',
    REFUND = 'refund',
    CREDIT = 'credit',
}

export enum TransactionStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded',
}

@Entity('billing_transactions')
export class BillingTransaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'subscription_id' })
    subscriptionId: string;

    @Column({ type: 'enum', enum: TransactionType })
    type: TransactionType;

    @Column({ type: 'decimal', precision: 18, scale: 2 })
    amount: number;

    @Column({ length: 3, default: 'USD' })
    currency: string;

    @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
    status: TransactionStatus;

    @Column({ name: 'stripe_payment_intent_id', length: 255, nullable: true })
    stripePaymentIntentId: string;

    @Column({ name: 'stripe_charge_id', length: 255, nullable: true })
    stripeChargeId: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'failure_reason', type: 'text', nullable: true })
    failureReason: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Subscription, (subscription) => subscription.transactions)
    @JoinColumn({ name: 'subscription_id' })
    subscription: Subscription;
}
