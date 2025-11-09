import { Company } from 'src/modules/companies/entities/company.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

@Entity('item_templates')
export class ItemTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'industry_en', length: 255, nullable: true })
  industryEn: string;

  @Column({ name: 'industry_ar', length: 255, nullable: true })
  industryAr: string;

  @Column({ name: 'item_name_en', length: 255 })
  itemNameEn: string;

  @Column({ name: 'item_name_ar', length: 255, nullable: true })
  itemNameAr: string;

  @Column({ name: 'description_en', type: 'text', nullable: true })
  descriptionEn: string;

  @Column({ name: 'description_ar', type: 'text', nullable: true })
  descriptionAr: string;

  @Column({ name: 'suggested_category_en', length: 255, nullable: true })
  suggestedCategoryEn: string;

  @Column({ name: 'suggested_category_ar', length: 255, nullable: true })
  suggestedCategoryAr: string;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;

  @ManyToMany('Company', 'itemTemplates')
  companies: Company[];
}
