import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('faq_items')
export class FaqItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_en', length: 255, nullable: true })
  categoryEn: string;

  @Column({ name: 'category_ar', length: 255, nullable: true })
  categoryAr: string;

  @Column({ name: 'question_en', type: 'text' })
  questionEn: string;

  @Column({ name: 'question_ar', type: 'text', nullable: true })
  questionAr: string;

  @Column({ name: 'answer_en', type: 'text' })
  answerEn: string;

  @Column({ name: 'answer_ar', type: 'text', nullable: true })
  answerAr: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}