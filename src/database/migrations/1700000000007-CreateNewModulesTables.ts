import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNewModulesTables1700000000007 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // ==================== PAYMENTS MODULE ====================
        await queryRunner.query(`
      CREATE TABLE payments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        payment_number VARCHAR(50) NOT NULL,
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'bank', 'check', 'card', 'other')),
        amount DECIMAL(18, 2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
        reference VARCHAR(100),
        notes TEXT,
        account_id UUID NOT NULL REFERENCES accounts(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT uq_payment_no UNIQUE (company_id, payment_number)
      );
    `);

        await queryRunner.query(`CREATE INDEX idx_payments_company ON payments(company_id);`);
        await queryRunner.query(`CREATE INDEX idx_payments_date ON payments(date);`);
        await queryRunner.query(`CREATE INDEX idx_payments_status ON payments(status);`);

        // Enable RLS on payments
        await queryRunner.query(`ALTER TABLE payments ENABLE ROW LEVEL SECURITY;`);
        await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON payments
      FOR ALL TO PUBLIC
      USING (company_id = current_setting('app.company_id', true)::uuid);
    `);

        // ==================== BILLING MODULE ====================
        await queryRunner.query(`
      CREATE TABLE subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        plan VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'professional', 'enterprise')),
        status VARCHAR(20) NOT NULL DEFAULT 'trial' CHECK (status IN ('active', 'trial', 'past_due', 'cancelled', 'expired')),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        trial_end_date TIMESTAMP,
        monthly_price DECIMAL(18, 2) DEFAULT 0,
        yearly_price DECIMAL(18, 2) DEFAULT 0,
        billing_cycle VARCHAR(10) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        next_billing_date TIMESTAMP,
        auto_renew BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT uq_subscription_company UNIQUE (company_id)
      );
    `);

        await queryRunner.query(`CREATE INDEX idx_subscriptions_company ON subscriptions(company_id);`);
        await queryRunner.query(`CREATE INDEX idx_subscriptions_status ON subscriptions(status);`);

        // Enable RLS on subscriptions
        await queryRunner.query(`ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;`);
        await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON subscriptions
      FOR ALL TO PUBLIC
      USING (company_id = current_setting('app.company_id', true)::uuid);
    `);

        await queryRunner.query(`
      CREATE TABLE billing_transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('charge', 'refund', 'credit')),
        amount DECIMAL(18, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
        stripe_payment_intent_id VARCHAR(255),
        stripe_charge_id VARCHAR(255),
        description TEXT,
        failure_reason TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

        await queryRunner.query(`CREATE INDEX idx_billing_transactions_subscription ON billing_transactions(subscription_id);`);
        await queryRunner.query(`CREATE INDEX idx_billing_transactions_status ON billing_transactions(status);`);

        // Enable RLS on billing_transactions
        await queryRunner.query(`ALTER TABLE billing_transactions ENABLE ROW LEVEL SECURITY;`);
        await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON billing_transactions
      FOR ALL TO PUBLIC
      USING (
        EXISTS (
          SELECT 1 FROM subscriptions s
          WHERE s.id = billing_transactions.subscription_id
            AND s.company_id = current_setting('app.company_id', true)::uuid
        )
      );
    `);

        // ==================== INTEGRATIONS MODULE ====================
        await queryRunner.query(`
      CREATE TABLE integrations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('stripe', 'paypal', 'quickbooks', 'xero', 'zapier', 'slack', 'email', 'webhook', 'api')),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
        config JSONB,
        credentials JSONB,
        webhook_url TEXT,
        api_key VARCHAR(255),
        api_secret TEXT,
        last_error TEXT,
        last_sync_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

        await queryRunner.query(`CREATE INDEX idx_integrations_company ON integrations(company_id);`);
        await queryRunner.query(`CREATE INDEX idx_integrations_type ON integrations(type);`);
        await queryRunner.query(`CREATE INDEX idx_integrations_status ON integrations(status);`);

        // Enable RLS on integrations
        await queryRunner.query(`ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;`);
        await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON integrations
      FOR ALL TO PUBLIC
      USING (company_id = current_setting('app.company_id', true)::uuid);
    `);

        // ==================== SETTINGS MODULE ====================
        await queryRunner.query(`
      CREATE TABLE user_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
        language VARCHAR(10) DEFAULT 'en' CHECK (language IN ('en', 'ur')),
        notifications JSONB DEFAULT '{"email": true, "push": false, "sms": false}',
        date_format VARCHAR(50) DEFAULT 'YYYY-MM-DD',
        number_format VARCHAR(50) DEFAULT '1,000.00',
        timezone VARCHAR(100) DEFAULT 'UTC',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT uq_user_settings_user UNIQUE (user_id)
      );
    `);

        await queryRunner.query(`CREATE INDEX idx_user_settings_user ON user_settings(user_id);`);

        // Enable RLS on user_settings
        await queryRunner.query(`ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;`);
        await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON user_settings
      FOR ALL TO PUBLIC
      USING (
        EXISTS (
          SELECT 1 FROM users u
          JOIN company_users cu ON u.id = cu.user_id
          WHERE u.id = user_settings.user_id
            AND cu.company_id = current_setting('app.company_id', true)::uuid
        )
      );
    `);

        await queryRunner.query(`
      CREATE TABLE tenant_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        company_name VARCHAR(255) NOT NULL,
        company_email VARCHAR(255) NOT NULL,
        company_phone VARCHAR(50) NOT NULL,
        company_address TEXT NOT NULL,
        fiscal_year_start DATE NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        tax_rate DECIMAL(5, 2) DEFAULT 0,
        logo TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT uq_tenant_settings_company UNIQUE (company_id)
      );
    `);

        await queryRunner.query(`CREATE INDEX idx_tenant_settings_company ON tenant_settings(company_id);`);

        // Enable RLS on tenant_settings
        await queryRunner.query(`ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;`);
        await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON tenant_settings
      FOR ALL TO PUBLIC
      USING (company_id = current_setting('app.company_id', true)::uuid);
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order (respecting foreign keys)
        await queryRunner.query(`DROP TABLE IF EXISTS tenant_settings CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS user_settings CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS integrations CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS billing_transactions CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS subscriptions CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS payments CASCADE;`);
    }
}
