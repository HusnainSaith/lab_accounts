const { Client } = require('pg');

async function fixUserCompany() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'lab_account_api'
  });

  try {
    await client.connect();
    
    // Check current user-company associations
    const userCheck = await client.query(`
      SELECT u.id, u.email, cu.company_id 
      FROM users u 
      LEFT JOIN company_users cu ON u.id = cu.user_id 
      WHERE u.email = 'ahmed@test.com'
    `);
    
    console.log('Current user data:', userCheck.rows);
    
    if (userCheck.rows.length > 0 && !userCheck.rows[0].company_id) {
      // Get the first company
      const companies = await client.query('SELECT id FROM companies LIMIT 1');
      
      if (companies.rows.length > 0) {
        const userId = userCheck.rows[0].id;
        const companyId = companies.rows[0].id;
        
        // Create company_user association
        await client.query(`
          INSERT INTO company_users (company_id, user_id, is_active) 
          VALUES ($1, $2, true)
          ON CONFLICT (company_id, user_id) DO NOTHING
        `, [companyId, userId]);
        
        console.log('User associated with company:', { userId, companyId });
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

fixUserCompany();