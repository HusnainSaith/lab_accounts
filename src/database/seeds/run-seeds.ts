import { DataSource } from 'typeorm';
import { PermissionsSeed } from './permissions.seed';
import { RolesSeed } from './roles.seed';
import { AssignRolesSeed } from './assign-roles.seed';
import { dataSourceOptions } from '../../config/database.config';

async function runSeeds() {
  const dataSource = new DataSource(dataSourceOptions);

  try {
    await dataSource.initialize();
    console.log('🔗 Database connected');

    const rolesSeed = new RolesSeed();
    await rolesSeed.run(dataSource);

    const permissionsSeed = new PermissionsSeed();
    await permissionsSeed.run(dataSource);

    const assignRolesSeed = new AssignRolesSeed();
    await assignRolesSeed.run(dataSource);


    console.log('🌱 All seeds completed successfully');
  } catch (error) {
    console.error('❌ Error running seeds:', error);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();