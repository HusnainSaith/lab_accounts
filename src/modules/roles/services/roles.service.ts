import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { CreateRoleDto, UpdateRoleDto } from '../dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find({
      relations: ['permissions'],
      order: { createdAt: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Role | null> {
    return this.rolesRepository.findOne({ 
      where: { id },
      relations: ['permissions']
    });
  }

  async findByName(roleNameEn: string): Promise<Role | null> {
    return this.rolesRepository.findOne({ 
      where: { roleNameEn },
      relations: ['permissions']
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role | null> {
    await this.rolesRepository.update(id, updateRoleDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.rolesRepository.delete(id);
  }

  async seedDefaultRoles(): Promise<void> {
    const defaultRoles = [
      {
        name: 'Owner',
        roleNameEn: 'Owner',
        roleNameAr: 'مالك',
        descriptionEn: 'Company owner with full access',
        descriptionAr: 'مالك الشركة مع صلاحية كاملة'
      },
      {
        name: 'Staff',
        roleNameEn: 'Staff',
        roleNameAr: 'موظف',
        descriptionEn: 'Staff member with limited access',
        descriptionAr: 'موظف مع صلاحية محدودة'
      },
      {
        name: 'Accountant',
        roleNameEn: 'Accountant',
        roleNameAr: 'محاسب',
        descriptionEn: 'Accountant with financial access',
        descriptionAr: 'محاسب مع صلاحية مالية'
      }
    ];

    for (const roleData of defaultRoles) {
      const existing = await this.findByName(roleData.roleNameEn);
      if (!existing) {
        await this.create(roleData);
      }
    }
  }
}