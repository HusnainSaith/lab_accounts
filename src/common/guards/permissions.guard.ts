import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/roles/entities/role.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user with role and permissions
    const userWithRole = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['roleEntity']
    });

    if (!userWithRole?.roleEntity) {
      throw new ForbiddenException('User has no role assigned');
    }

    // Get role with permissions
    const roleWithPermissions = await this.roleRepository.findOne({
      where: { id: (userWithRole.roleEntity as any).id },
      relations: ['permissions']
    });

    if (!roleWithPermissions?.permissions) {
      throw new ForbiddenException('Role has no permissions assigned');
    }

    const userPermissions = roleWithPermissions.permissions.map((p: any) => p.permissionName);

    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied. Required permissions: ${requiredPermissions.join(', ')}`
      );
    }

    return true;
  }
}