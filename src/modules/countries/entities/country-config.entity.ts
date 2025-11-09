import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('country_configs')
export class CountryConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'country_code', length: 3, unique: true })
  countryCode: string;

  @Column({ name: 'country_name_en', length: 255 })
  countryNameEn: string;

  @Column({ name: 'country_name_ar', length: 255 })
  countryNameAr: string;

  @Column({ name: 'currency_code', length: 3 })
  currencyCode: string;

  @Column({ name: 'currency_symbol', length: 10 })
  currencySymbol: string;

  @Column({ name: 'default_vat_rate', type: 'decimal', precision: 5, scale: 2 })
  defaultVatRate: number;

  @Column({ name: 'vat_label_en', length: 100, default: 'VAT' })
  vatLabelEn: string;

  @Column({ name: 'vat_label_ar', length: 100, default: 'ضريبة القيمة المضافة' })
  vatLabelAr: string;

  @Column({ name: 'date_format', length: 20, default: 'DD/MM/YYYY' })
  dateFormat: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}