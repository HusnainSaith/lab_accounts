import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompleteRLSImplementation1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable RLS on blacklisted_tokens table
    await queryRunner.query(`ALTER TABLE blacklisted_tokens ENABLE ROW LEVEL SECURITY;`);

    // Add RLS policy for blacklisted_tokens
    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON blacklisted_tokens
      FOR ALL TO PUBLIC
      USING (
        EXISTS (
          SELECT 1 FROM users u
          JOIN company_users cu ON u.id = cu.user_id
          WHERE u.id = blacklisted_tokens.user_id
            AND cu.company_id = current_setting('app.company_id', true)::uuid
        )
      );
    `);

    // Enable RLS on users table (if not already enabled)
    await queryRunner.query(`ALTER TABLE users ENABLE ROW LEVEL SECURITY;`);

    // Add RLS policy for users - only users belonging to current company
    await queryRunner.query(`
      DROP POLICY IF EXISTS tenant_isolation_policy ON users;
    `);
    
    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON users
      FOR ALL TO PUBLIC
      USING (
        EXISTS (
          SELECT 1 FROM company_users cu
          WHERE cu.user_id = users.id
            AND cu.company_id = current_setting('app.company_id', true)::uuid
        )
      );
    `);

    // Enable RLS on permissions table
    await queryRunner.query(`ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;`);

    // Add RLS policy for permissions - all users can read permissions
    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON permissions
      FOR SELECT TO PUBLIC
      USING (true);
    `);

    // Add RLS policy for role_permissions
    await queryRunner.query(`ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;`);

    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON role_permissions
      FOR ALL TO PUBLIC
      USING (
        EXISTS (
          SELECT 1 FROM roles r
          WHERE r.id = role_permissions.role_id
            AND (r.company_id = current_setting('app.company_id', true)::uuid OR r.company_id IS NULL)
        )
      );
    `);

    // Create function to set company context
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_company_context(company_uuid UUID)
      RETURNS void AS $$
      BEGIN
        PERFORM set_config('app.company_id', company_uuid::text, true);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    // Create function to get current company context
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION get_current_company_id()
      RETURNS UUID AS $$
      BEGIN
        RETURN current_setting('app.company_id', true)::uuid;
      EXCEPTION
        WHEN OTHERS THEN
          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    // Create function to check if user belongs to company
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION user_belongs_to_company(user_uuid UUID, company_uuid UUID)
      RETURNS boolean AS $$
      BEGIN
        RETURN EXISTS (
          SELECT 1 FROM company_users cu
          WHERE cu.user_id = user_uuid
            AND cu.company_id = company_uuid
            AND cu.is_active = true
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop functions
    await queryRunner.query(`DROP FUNCTION IF EXISTS user_belongs_to_company(UUID, UUID);`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS get_current_company_id();`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS set_company_context(UUID);`);

    // Drop RLS policies
    await queryRunner.query(`DROP POLICY IF EXISTS tenant_isolation_policy ON role_permissions;`);
    await queryRunner.query(`DROP POLICY IF EXISTS tenant_isolation_policy ON permissions;`);
    await queryRunner.query(`DROP POLICY IF EXISTS tenant_isolation_policy ON users;`);
    await queryRunner.query(`DROP POLICY IF EXISTS tenant_isolation_policy ON blacklisted_tokens;`);

    // Disable RLS
    await queryRunner.query(`ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE users DISABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE blacklisted_tokens DISABLE ROW LEVEL SECURITY;`);
  }
}