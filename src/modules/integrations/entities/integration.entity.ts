import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

export enum IntegrationType {
    STRIPE = 'stripe',
    PAYPAL = 'paypal',
    QUICKBOOKS = 'quickbooks',
    XERO = 'xero',
    ZAPIER = 'zapier',
    SLACK = 'slack',
    EMAIL = 'email',
    WEBHOOK = 'webhook',
    API = 'api',
}

export enum IntegrationStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ERROR = 'error',
}

@Entity('integrations')
export class Integration {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'company_id' })
    companyId: string;

    @Column({ type: 'enum', enum: IntegrationType })
    type: IntegrationType;

    @Column({ length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'enum', enum: IntegrationStatus, default: IntegrationStatus.INACTIVE })
    status: IntegrationStatus;

    @Column({ type: 'jsonb', nullable: true })
    config: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    credentials: Record<string, any>;

    @Column({ name: 'webhook_url', type: 'text', nullable: true })
    webhookUrl: string;

    @Column({ name: 'api_key', length: 255, nullable: true })
    apiKey: string;

    @Column({ name: 'api_secret', type: 'text', nullable: true })
    apiSecret: string;

    @Column({ name: 'last_error', type: 'text', nullable: true })
    lastError: string;

    @Column({ name: 'last_sync_at', type: 'timestamp', nullable: true })
    lastSyncAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;
}
