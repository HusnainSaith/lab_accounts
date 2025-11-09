import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto, UpdatePermissionDto } from '../dto';

@Injectable()
export class PermissionsService implements OnModuleInit {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultPermissions();
  }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionsRepository.create(createPermissionDto);
    return this.permissionsRepository.save(permission);
  }

  async findAll(search?: string): Promise<Permission[]> {
    const where: any = {};
    
    if (search) {
      where.permissionName = Like(`%${search}%`);
    }

    return this.permissionsRepository.find({
      where,
      order: { permissionName: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionsRepository.findOne({ where: { id } });
    
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    
    return permission;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const result = await this.permissionsRepository.update(id, updatePermissionDto);
    
    if (result.affected === 0) {
      throw new NotFoundException('Permission not found');
    }
    
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.permissionsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException('Permission not found');
    }
  }

  private async seedDefaultPermissions(): Promise<void> {
    const defaultPermissions = [
      { permissionName: 'Create Invoice', description: 'Create new invoices' },
      { permissionName: 'View Invoice', description: 'View invoices' },
      { permissionName: 'Edit Invoice', description: 'Edit invoices' },
      { permissionName: 'Delete Invoice', description: 'Delete invoices' },
      { permissionName: 'Manage Users', description: 'Manage company users' },
      { permissionName: 'View Reports', description: 'View financial reports' }
    ];

    for (const permission of defaultPermissions) {
      const exists = await this.permissionsRepository.findOne({
        where: { permissionName: permission.permissionName }
      });
      
      if (!exists) {
        await this.permissionsRepository.save(permission);
      }
    }
  }
}