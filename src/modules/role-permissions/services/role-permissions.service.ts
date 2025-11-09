import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from '../entities/role-permission.entity';
import { AssignPermissionDto } from '../dto/assign-permission.dto';

@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async assignPermission(assignPermissionDto: AssignPermissionDto): Promise<RolePermission> {
    const existing = await this.rolePermissionRepository.findOne({
      where: {
        roleId: assignPermissionDto.roleId,
        permissionId: assignPermissionDto.permissionId
      }
    });

    if (existing) {
      throw new ConflictException('Permission already assigned to role');
    }

    const rolePermission = this.rolePermissionRepository.create(assignPermissionDto);
    return this.rolePermissionRepository.save(rolePermission);
  }

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    const result = await this.rolePermissionRepository.delete({ roleId, permissionId });
    
    if (result.affected === 0) {
      throw new NotFoundException('Role permission not found');
    }
  }

  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    return this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission'],
    });
  }

  async getPermissionRoles(permissionId: string): Promise<RolePermission[]> {
    return this.rolePermissionRepository.find({
      where: { permissionId },
      relations: ['role'],
    });
  }

  async assignMultiplePermissions(roleId: string, permissionIds: string[]): Promise<RolePermission[]> {
    const results: RolePermission[] = [];
    
    for (const permissionId of permissionIds) {
      try {
        const result = await this.assignPermission({ roleId, permissionId });
        results.push(result);
      } catch (error) {
        if (!(error instanceof ConflictException)) {
          throw error;
        }
      }
    }
    
    return results;
  }

  async removeAllRolePermissions(roleId: string): Promise<void> {
    await this.rolePermissionRepository.delete({ roleId });
  }
}