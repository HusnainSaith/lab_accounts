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

  async findByName(roleName: string): Promise<Role | null> {
    return this.rolesRepository.findOne({ 
      where: { roleName },
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
        roleName: 'Owner',
        description: 'Company owner with full access'
      },
      {
        roleName: 'Staff',
        description: 'Staff member with limited access'
      },
      {
        roleName: 'Accountant',
        description: 'Accountant with financial access'
      }
    ];

    for (const roleData of defaultRoles) {
      const existing = await this.findByName(roleData.roleName);
      if (!existing) {
        await this.create(roleData);
      }
    }
  }
}