import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('translations')
export class Translation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, unique: true })
  key: string;

  @Column({ name: 'text_en', type: 'text' })
  textEn: string;

  @Column({ name: 'text_ar', type: 'text', nullable: true })
  textAr: string;

  @Column({ length: 100, nullable: true })
  context: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}