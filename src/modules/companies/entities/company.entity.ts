import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Check,
} from 'typeorm';

@Entity('companies')
@Check('chk_fiscal_month', 'fiscal_year_start_month BETWEEN 1 AND 12')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'legal_name', length: 255, nullable: true })
  legalName: string;

  @Column({ name: 'registration_no', length: 100, nullable: true })
  registrationNo: string;

  @Column({ name: 'tax_registration_no', length: 100, nullable: true })
  taxRegistrationNo: string;

  @Column({ name: 'country_code', length: 3 })
  countryCode: string;

  @Column({ name: 'currency_code', length: 3 })
  currencyCode: string;

  @Column({ name: 'fiscal_year_start_month', type: 'integer', default: 1 })
  fiscalYearStartMonth: number;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  settings: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany('User', 'company')
  users: unknown[];

  @OneToMany('Constant', 'company')
  constants: unknown[];

  @OneToMany('Invoice', 'company')
  invoices: unknown[];

  @OneToMany('Role', 'company')
  roles: unknown[];

  @OneToMany('Account', 'company')
  accounts: unknown[];

  @OneToMany('FiscalYear', 'company')
  fiscalYears: unknown[];
}