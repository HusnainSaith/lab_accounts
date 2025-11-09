import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'permission_name_en', length: 255 })
  permissionNameEn: string;

  @Column({ name: 'permission_name_ar', length: 255, nullable: true })
  permissionNameAr: string;

  @Column({ name: 'description_en', type: 'text', nullable: true })
  descriptionEn: string;

  @Column({ name: 'description_ar', type: 'text', nullable: true })
  descriptionAr: string;

  @ManyToMany('Role', 'permissions')
  roles: Role[];
}
