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
      where.permissionNameEn = Like(`%${search}%`);
    }

    return this.permissionsRepository.find({
      where,
      order: { permissionNameEn: 'ASC' }
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
      { permissionNameEn: 'Create Invoice', permissionNameAr: 'إنشاء فاتورة', descriptionEn: 'Create new invoices', descriptionAr: 'إنشاء فواتير جديدة' },
      { permissionNameEn: 'View Invoice', permissionNameAr: 'عرض الفاتورة', descriptionEn: 'View invoices', descriptionAr: 'عرض الفواتير' },
      { permissionNameEn: 'Edit Invoice', permissionNameAr: 'تعديل الفاتورة', descriptionEn: 'Edit invoices', descriptionAr: 'تعديل الفواتير' },
      { permissionNameEn: 'Delete Invoice', permissionNameAr: 'حذف الفاتورة', descriptionEn: 'Delete invoices', descriptionAr: 'حذف الفواتير' },
      { permissionNameEn: 'Manage Users', permissionNameAr: 'إدارة المستخدمين', descriptionEn: 'Manage company users', descriptionAr: 'إدارة مستخدمي الشركة' },
      { permissionNameEn: 'View Reports', permissionNameAr: 'عرض التقارير', descriptionEn: 'View financial reports', descriptionAr: 'عرض التقارير المالية' }
    ];

    for (const permission of defaultPermissions) {
      const exists = await this.permissionsRepository.findOne({
        where: { permissionNameEn: permission.permissionNameEn }
      });
      
      if (!exists) {
        await this.permissionsRepository.save(permission);
      }
    }
  }
}