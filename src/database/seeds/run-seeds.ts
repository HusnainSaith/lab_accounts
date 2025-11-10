import { DataSource } from 'typeorm';
import { PermissionsSeed } from './permissions.seed';
import { dataSourceOptions } from '../../config/database.config';

async function runSeeds() {
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('🔗 Database connected');
    
    const permissionsSeed = new PermissionsSeed();
    await permissionsSeed.run(dataSource);
    
    console.log('🌱 All seeds completed successfully');
  } catch (error) {
    console.error('❌ Error running seeds:', error);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();