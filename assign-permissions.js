const { Client } = require('pg');

async function assignAllPermissions() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'lab_account_api',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const roleId = '47567090-cc7e-4dc5-bb2a-9552ca92669f';

    // Get all permissions
    const permissionsResult = await client.query('SELECT id FROM permissions');
    const permissions = permissionsResult.rows;

    console.log(`Found ${permissions.length} permissions`);

    // Assign all permissions to the role
    for (const permission of permissions) {
      try {
        await client.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [roleId, permission.id]
        );
        console.log(`✅ Assigned permission ${permission.id} to role`);
      } catch (error) {
        console.log(`❌ Failed to assign permission ${permission.id}:`, error.message);
      }
    }

    console.log('✅ All permissions assigned successfully');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

assignAllPermissions();