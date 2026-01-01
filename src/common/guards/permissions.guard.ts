import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private dataSource: DataSource,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id || !user.companyId) {
      throw new ForbiddenException('User not authenticated or company context missing');
    }

    // Check if user has required permissions within the company context
    // We join users -> user_roles -> roles -> role_permissions -> permissions
    // filtered by current company_id and user_id
    const userPermissions = await this.dataSource.query(
      `
      SELECT DISTINCT p.code
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN roles r ON rp.role_id = r.id
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1 AND ur.company_id = $2
      `,
      [user.id, user.companyId]
    );

    const permissionCodes = userPermissions.map((p: any) => p.code);
    const hasPermission = requiredPermissions.some((permission) =>
      permissionCodes.includes(permission)
    );

    if (!hasPermission) {
      throw new ForbiddenException('You do not have the required permissions to perform this action');
    }

    return true;
  }
}
