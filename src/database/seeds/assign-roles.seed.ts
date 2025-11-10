import { DataSource, IsNull } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/roles/entities/role.entity';

export class AssignRolesSeed {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);

    // Get all users without role_id
    const usersWithoutRoles = await userRepository.find({
      where: { roleId: IsNull() }
    });

    if (usersWithoutRoles.length === 0) {
      console.log('✅ All users already have roles assigned');
      return;
    }

    // Get roles
    const ownerRole = await roleRepository.findOne({ where: { roleName: 'Owner' } });
    const staffRole = await roleRepository.findOne({ where: { roleName: 'Staff' } });
    const accountantRole = await roleRepository.findOne({ where: { roleName: 'Accountant' } });

    // Create roles if they don't exist
    if (!ownerRole || !staffRole || !accountantRole) {
      console.log('❌ Required roles not found. Please run permissions seed first.');
      return;
    }

    // Assign roles based on existing role enum
    for (const user of usersWithoutRoles) {
      let roleId: string;
      
      switch (user.role) {
        case 'owner':
          roleId = ownerRole.id;
          break;
        case 'staff':
          roleId = staffRole.id;
          break;
        case 'accountant':
          roleId = accountantRole.id;
          break;
        default:
          roleId = staffRole.id; // Default to staff
      }

      await userRepository.update(user.id, { roleId });
    }

    console.log(`✅ Assigned roles to ${usersWithoutRoles.length} users`);
  }
}