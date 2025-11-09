import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 3, unique: true })
  code: string;

  @Column({ name: 'name_en', length: 100 })
  nameEn: string;

  @Column({ name: 'name_ar', length: 100 })
  nameAr: string;

  @Column({ name: 'currency_code', length: 3 })
  currencyCode: string;

  @Column({ name: 'currency_symbol', length: 10 })
  currencySymbol: string;

  @Column({ name: 'default_vat_rate', type: 'decimal', precision: 5, scale: 2 })
  defaultVatRate: number;

  @Column({ name: 'trn_required', default: true })
  trnRequired: boolean;

  @Column({ name: 'qr_code_required', default: false })
  qrCodeRequired: boolean;

  @Column({ name: 'date_format', length: 20, default: 'DD/MM/YYYY' })
  dateFormat: string;

  @Column({ name: 'number_format', length: 20, default: '1,234.56' })
  numberFormat: string;

  @Column({ default: true })
  active: boolean;
}