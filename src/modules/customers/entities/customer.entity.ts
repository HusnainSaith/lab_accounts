import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';

export enum CustomerType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'customer_type', type: 'enum', enum: CustomerType })
  customerType: CustomerType;

  @Column({ name: 'name_en', length: 255 })
  nameEn: string;

  @Column({ name: 'name_ar', length: 255, nullable: true })
  nameAr: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 64, nullable: true })
  trn: string;

  @Column({ name: 'address_en', type: 'text', nullable: true })
  addressEn: string;

  @Column({ name: 'address_ar', type: 'text', nullable: true })
  addressAr: string;

  @Column({ name: 'city_en', length: 255, nullable: true })
  cityEn: string;

  @Column({ name: 'city_ar', length: 255, nullable: true })
  cityAr: string;

  @Column({ name: 'country_code', length: 3, nullable: true })
  countryCode: string;

  @Column({ name: 'is_vat_registered', default: false })
  isVatRegistered: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Company, company => company.customers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => Invoice, invoice => invoice.customer)
  invoices: Invoice[];
}