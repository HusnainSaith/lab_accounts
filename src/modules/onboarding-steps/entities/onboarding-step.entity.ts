import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

@Entity('onboarding_steps')
export class OnboardingStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'step_number', type: 'int' })
  stepNumber: number;

  @Column({ name: 'title_en', length: 255 })
  titleEn: string;

  @Column({ name: 'title_ar', length: 255, nullable: true })
  titleAr: string;

  @Column({ name: 'description_en', type: 'text', nullable: true })
  descriptionEn: string;

  @Column({ name: 'description_ar', type: 'text', nullable: true })
  descriptionAr: string;

  @Column({ name: 'action_label_en', length: 255, nullable: true })
  actionLabelEn: string;

  @Column({ name: 'action_label_ar', length: 255, nullable: true })
  actionLabelAr: string;

  @Column({ name: 'action_url', length: 500, nullable: true })
  actionUrl: string;

  @Column({ length: 100, nullable: true })
  icon: string;

  @Column({ name: 'is_required', default: false })
  isRequired: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @ManyToMany('User', 'completedOnboardingSteps')
  users: unknown[];
}