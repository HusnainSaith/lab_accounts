import { DataSource } from 'typeorm';
import { Permission } from '../../modules/permissions/entities/permission.entity';
import { Role } from '../../modules/roles/entities/role.entity';

export class PermissionsSeed {
  public async run(dataSource: DataSource): Promise<void> {
    const permissionRepository = dataSource.getRepository(Permission);
    const roleRepository = dataSource.getRepository(Role);

    // Define all permissions
    const permissions = [
      // User Management
      { permissionName: 'users.create', description: 'Create users' },
      { permissionName: 'users.read', description: 'View users' },
      { permissionName: 'users.update', description: 'Update users' },
      { permissionName: 'users.delete', description: 'Delete users' },
      
      // Company Management
      { permissionName: 'companies.create', description: 'Create companies' },
      { permissionName: 'companies.read', description: 'View companies' },
      { permissionName: 'companies.update', description: 'Update companies' },
      { permissionName: 'companies.delete', description: 'Delete companies' },
      
      // Customer Management
      { permissionName: 'customers.create', description: 'Create customers' },
      { permissionName: 'customers.read', description: 'View customers' },
      { permissionName: 'customers.update', description: 'Update customers' },
      { permissionName: 'customers.delete', description: 'Delete customers' },
      
      // Invoice Management
      { permissionName: 'invoices.create', description: 'Create invoices' },
      { permissionName: 'invoices.read', description: 'View invoices' },
      { permissionName: 'invoices.update', description: 'Update invoices' },
      { permissionName: 'invoices.delete', description: 'Delete invoices' },
      { permissionName: 'invoices.send', description: 'Send invoices' },
      
      // Item Management
      { permissionName: 'items.create', description: 'Create items' },
      { permissionName: 'items.read', description: 'View items' },
      { permissionName: 'items.update', description: 'Update items' },
      { permissionName: 'items.delete', description: 'Delete items' },
      
      // Reports
      { permissionName: 'reports.view', description: 'View reports' },
      { permissionName: 'reports.export', description: 'Export reports' },
      
      // Dashboard
      { permissionName: 'dashboard.view', description: 'View dashboard' },
      
      // Role Management
      { permissionName: 'roles.create', description: 'Create roles' },
      { permissionName: 'roles.read', description: 'View roles' },
      { permissionName: 'roles.update', description: 'Update roles' },
      { permissionName: 'roles.delete', description: 'Delete roles' },
      
      // Permission Management
      { permissionName: 'permissions.read', description: 'View permissions' },
      { permissionName: 'permissions.assign', description: 'Assign permissions' }
    ];

    // Create permissions
    const createdPermissions: Permission[] = [];
    for (const permissionData of permissions) {
      let permission = await permissionRepository.findOne({
        where: { permissionName: permissionData.permissionName }
      });
      
      if (!permission) {
        permission = permissionRepository.create(permissionData);
        await permissionRepository.save(permission);
      }
      createdPermissions.push(permission);
    }

    // Find or create Owner role
    let ownerRole = await roleRepository.findOne({
      where: { roleName: 'Owner' },
      relations: ['permissions']
    });

    if (!ownerRole) {
      ownerRole = roleRepository.create({
        roleName: 'Owner',
        description: 'Company owner with full access'
      });
      await roleRepository.save(ownerRole);
    }

    // Assign all permissions to Owner role
    await roleRepository
      .createQueryBuilder()
      .relation(Role, 'permissions')
      .of(ownerRole)
      .addAndRemove(createdPermissions, ownerRole.permissions || []);

    console.log('✅ Permissions seeded successfully');
    console.log(`📝 Created ${permissions.length} permissions`);
    console.log('👑 Assigned all permissions to Owner role');
  }
}