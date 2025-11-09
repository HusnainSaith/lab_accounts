import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@Entity('invoice_settings')
export class InvoiceSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', unique: true })
  companyId: string;

  @Column({ name: 'next_invoice_number', type: 'int' })
  nextInvoiceNumber: number;

  @Column({ name: 'invoice_prefix', length: 50 })
  invoicePrefix: string;

  @Column({ name: 'invoice_number_format', length: 100 })
  invoiceNumberFormat: string;

  @Column({ name: 'default_payment_terms_days', type: 'int', nullable: true })
  defaultPaymentTermsDays: number;

  @Column({ name: 'default_notes_en', type: 'text', nullable: true })
  defaultNotesEn: string;

  @Column({ name: 'default_notes_ar', type: 'text', nullable: true })
  defaultNotesAr: string;

  @Column({ name: 'include_company_logo', default: true })
  includeCompanyLogo: boolean;

  @Column({ name: 'auto_send_on_create', default: false })
  autoSendOnCreate: boolean;

  @Column({ name: 'enable_qr_code', default: false })
  enableQrCode: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}