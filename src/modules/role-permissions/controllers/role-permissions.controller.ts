import { Controller, Post, Delete, Get, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolePermissionsService } from '../services/role-permissions.service';
import { AssignPermissionDto } from '../dto/assign-permission.dto';

@Controller('role-permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolePermissionsController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) { }

  @Post('assign')
  @Roles('owner')
  async assignPermission(@Body() assignPermissionDto: AssignPermissionDto) {
    return this.rolePermissionsService.assignPermission(assignPermissionDto);
  }

  @Post('assign-multiple/:roleId')
  @Roles('owner')
  async assignMultiplePermissions(
    @Param('roleId') roleId: string,
    @Body() body: { permissionIds: string[] }
  ) {
    return this.rolePermissionsService.assignMultiplePermissions(roleId, body.permissionIds);
  }

  @Delete(':roleId/:permissionId')
  @Roles('owner')
  async removePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rolePermissionsService.removePermission(roleId, permissionId);
  }

  @Delete('role/:roleId/all')
  @Roles('owner')
  async removeAllRolePermissions(@Param('roleId') roleId: string) {
    return this.rolePermissionsService.removeAllRolePermissions(roleId);
  }

  @Get('role/:roleId')
  @Roles('owner', 'staff')
  async getRolePermissions(@Param('roleId') roleId: string) {
    return this.rolePermissionsService.getRolePermissions(roleId);
  }

  @Get('permission/:permissionId')
  @Roles('owner')
  async getPermissionRoles(@Param('permissionId') permissionId: string) {
    return this.rolePermissionsService.getPermissionRoles(permissionId);
  }
}