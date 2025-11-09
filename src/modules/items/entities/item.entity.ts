import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'item_code', length: 100, nullable: true })
  itemCode: string;

  @Column({ name: 'name_en', length: 255 })
  nameEn: string;

  @Column({ name: 'name_ar', length: 255, nullable: true })
  nameAr: string;

  @Column({ name: 'description_en', type: 'text', nullable: true })
  descriptionEn: string;

  @Column({ name: 'description_ar', type: 'text', nullable: true })
  descriptionAr: string;

  @Column({ name: 'category_en', length: 255, nullable: true })
  categoryEn: string;

  @Column({ name: 'category_ar', length: 255, nullable: true })
  categoryAr: string;

  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 4 })
  unitPrice: number;

  @Column({ name: 'currency_code', length: 3 })
  currencyCode: string;

  @Column({ name: 'default_vat_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  defaultVatRate: number;

  @Column({ name: 'is_service', default: true })
  isService: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'ai_suggested', default: false })
  aiSuggested: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Company, company => company.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}