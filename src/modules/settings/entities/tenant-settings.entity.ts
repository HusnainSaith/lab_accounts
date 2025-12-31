import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@Entity('tenant_settings')
export class TenantSettings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'company_id' })
    companyId: string;

    @Column({ name: 'company_name', length: 255 })
    companyName: string;

    @Column({ name: 'company_email', length: 255 })
    companyEmail: string;

    @Column({ name: 'company_phone', length: 50 })
    companyPhone: string;

    @Column({ name: 'company_address', type: 'text' })
    companyAddress: string;

    @Column({ name: 'fiscal_year_start', type: 'date' })
    fiscalYearStart: Date;

    @Column({ length: 3, default: 'USD' })
    currency: string;

    @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
    taxRate: number;

    @Column({ type: 'text', nullable: true })
    logo?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;
}
