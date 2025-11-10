import { Company } from 'src/modules/companies/entities/company.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

@Entity('item_templates')
export class ItemTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: true })
  industry: string;

  @Column({ name: 'item_name', length: 255 })
  itemName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'suggested_category', length: 255, nullable: true })
  suggestedCategory: string;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;

  @ManyToMany('Company', 'itemTemplates')
  companies: Company[];
}
