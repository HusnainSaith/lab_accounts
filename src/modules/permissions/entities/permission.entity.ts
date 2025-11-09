import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'permission_name', length: 255 })
  permissionName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToMany('Role', 'permissions')
  roles: Role[];
}
