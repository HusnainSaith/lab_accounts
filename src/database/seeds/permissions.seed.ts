import { DataSource } from 'typeorm';

export class PermissionsSeed {
  async run(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    try {
      const permissions = [
        // User Management
        { code: 'users.create', description: 'Create users' },
        { code: 'users.read', description: 'View users' },
        { code: 'users.update', description: 'Update users' },
        { code: 'users.delete', description: 'Delete users' },

        // Role Management
        { code: 'roles.create', description: 'Create roles' },
        { code: 'roles.read', description: 'View roles' },
        { code: 'roles.update', description: 'Update roles' },
        { code: 'roles.delete', description: 'Delete roles' },

        // Permission Management
        { code: 'permissions.create', description: 'Create permissions' },
        { code: 'permissions.read', description: 'View permissions' },
        { code: 'permissions.update', description: 'Update permissions' },
        { code: 'permissions.delete', description: 'Delete permissions' },

        // Company Management
        { code: 'companies.create', description: 'Create companies' },
        { code: 'companies.read', description: 'View companies' },
        { code: 'companies.update', description: 'Update companies' },
        { code: 'companies.delete', description: 'Delete companies' },

        // Account Management
        { code: 'accounts.create', description: 'Create accounts' },
        { code: 'accounts.read', description: 'View accounts' },
        { code: 'accounts.update', description: 'Update accounts' },
        { code: 'accounts.delete', description: 'Delete accounts' },

        // Invoice Management
        { code: 'invoices.create', description: 'Create invoices' },
        { code: 'invoices.read', description: 'View invoices' },
        { code: 'invoices.update', description: 'Update invoices' },
        { code: 'invoices.delete', description: 'Delete invoices' },

        // Invoice Lines
        { code: 'invoice-lines.create', description: 'Create invoice lines' },
        { code: 'invoice-lines.read', description: 'View invoice lines' },
        { code: 'invoice-lines.update', description: 'Update invoice lines' },
        { code: 'invoice-lines.delete', description: 'Delete invoice lines' },

        // Payment Management
        { code: 'payments.create', description: 'Create payments' },
        { code: 'payments.view', description: 'View payments' },
        { code: 'payments.edit', description: 'Edit payments' },
        { code: 'payments.delete', description: 'Delete payments' },

        // Billing & Subscriptions
        { code: 'billing.view', description: 'View billing info' },
        { code: 'billing.edit', description: 'Manage subscriptions' },

        // Integrations
        { code: 'integrations.create', description: 'Create integrations' },
        { code: 'integrations.view', description: 'View integrations' },
        { code: 'integrations.edit', description: 'Edit integrations' },
        { code: 'integrations.delete', description: 'Delete integrations' },

        // Settings
        { code: 'settings.view', description: 'View settings' },
        { code: 'settings.edit', description: 'Edit settings' },

        // Journal Entries
        { code: 'journal-entries.create', description: 'Create journal entries' },
        { code: 'journal-entries.read', description: 'View journal entries' },
        { code: 'journal-entries.update', description: 'Update journal entries' },
        { code: 'journal-entries.post', description: 'Post journal entries' },
        { code: 'journal-entries.delete', description: 'Delete journal entries' },

        // Fiscal Years
        { code: 'fiscal-years.create', description: 'Create fiscal years' },
        { code: 'fiscal-years.read', description: 'View fiscal years' },
        { code: 'fiscal-years.update', description: 'Update fiscal years' },
        { code: 'fiscal-years.close', description: 'Close fiscal years' },
        { code: 'fiscal-years.delete', description: 'Delete fiscal years' },

        // Voucher Types
        { code: 'voucher-types.create', description: 'Create voucher types' },
        { code: 'voucher-types.read', description: 'View voucher types' },
        { code: 'voucher-types.update', description: 'Update voucher types' },
        { code: 'voucher-types.delete', description: 'Delete voucher types' },

        // Account Balances
        { code: 'account-balances.read', description: 'View account balances' },

        // Reports
        { code: 'reports.view', description: 'View reports' },
        { code: 'reports.export', description: 'Export reports' },

        // Audit Logs
        { code: 'audit.read', description: 'View audit logs' },

        // System Administration
        { code: 'system.settings', description: 'Manage system settings' },
        { code: 'fiscal.close', description: 'Close fiscal periods' },
        { code: 'vouchers.approve', description: 'Approve vouchers' },
        { code: 'vouchers.post', description: 'Post vouchers' },
        { code: 'vouchers.reverse', description: 'Reverse vouchers' }

      ];

      for (const permission of permissions) {
        const existing = await queryRunner.query(
          `SELECT id FROM permissions WHERE code = $1`,
          [permission.code]
        );

        if (existing.length === 0) {
          await queryRunner.query(
            `INSERT INTO permissions (code, description) VALUES ($1, $2)`,
            [permission.code, permission.description]
          );
        }
      }

      console.log('✅ Permissions seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding permissions:', error);
      throw error;
    }
  }
}