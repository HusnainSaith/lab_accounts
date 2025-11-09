import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

export enum VatReportStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved'
}

@Entity('vat_reports')
export class VatReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'report_period_start', type: 'date' })
  reportPeriodStart: Date;

  @Column({ name: 'report_period_end', type: 'date' })
  reportPeriodEnd: Date;

  @Column({ name: 'total_sales', type: 'decimal', precision: 18, scale: 2 })
  totalSales: number;

  @Column({ name: 'total_vat_collected', type: 'decimal', precision: 18, scale: 2 })
  totalVatCollected: number;

  @Column({ name: 'total_purchases', type: 'decimal', precision: 18, scale: 2 })
  totalPurchases: number;

  @Column({ name: 'total_vat_paid', type: 'decimal', precision: 18, scale: 2 })
  totalVatPaid: number;

  @Column({ name: 'net_vat_payable', type: 'decimal', precision: 18, scale: 2 })
  netVatPayable: number;

  @Column({ name: 'report_status', type: 'enum', enum: VatReportStatus, default: VatReportStatus.DRAFT })
  reportStatus: VatReportStatus;

  @CreateDateColumn({ name: 'generated_at' })
  generatedAt: Date;

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt: Date;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}