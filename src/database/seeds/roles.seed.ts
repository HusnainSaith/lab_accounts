import { DataSource } from 'typeorm';

export class RolesSeed {
  async run(dataSource: DataSource): Promise<void> {
    const rolesRepository = dataSource.getRepository('roles');

    const defaultRoles = [
      {
        code: 'owner',
        name: 'Owner',
        companyId: null,
        isSystem: true
      },
      {
        code: 'staff',
        name: 'Staff',
        companyId: null,
        isSystem: true
      },
      {
        code: 'accountant',
        name: 'Accountant',
        companyId: null,
        isSystem: true
      }
    ];


    for (const roleData of defaultRoles) {
      const existing = await rolesRepository.findOne({
        where: { code: roleData.code, companyId: null }
      });

      if (!existing) {
        await rolesRepository.save(roleData);
        console.log(`✅ Created role: ${roleData.name}`);
      } else {
        console.log(`⏭️  Role already exists: ${roleData.name}`);
      }
    }
  }
}