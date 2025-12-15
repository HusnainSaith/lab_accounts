# Row Level Security (RLS) Implementation

## Overview
Complete RLS implementation has been added to ensure multi-tenant data isolation at the database level.

## Components Added

### 1. Database Migration (1700000000004-CompleteRLSImplementation.ts)
- Enables RLS on all tables including `blacklisted_tokens`, `users`, `permissions`, `role_permissions`
- Creates RLS policies using `app.company_id` session variable
- Adds helper functions:
  - `set_company_context(UUID)` - Sets company context
  - `get_current_company_id()` - Gets current company context
  - `user_belongs_to_company(UUID, UUID)` - Checks user-company relationship

### 2. RLS Middleware (`src/common/middleware/rls.middleware.ts`)
- Automatically sets company context for each authenticated request
- Uses `user.companyId` from JWT token
- Applied globally in `app.module.ts`

### 3. RLS Service (`src/common/services/rls.service.ts`)
- Updated to use correct session variable `app.company_id`
- Provides methods to set/clear company context
- Includes `withCompanyContext()` for scoped operations

### 4. RLS Guard (`src/common/guards/rls.guard.ts`)
- Additional guard to ensure company context is set
- Can be used for specific routes requiring extra security

## RLS Policies Applied

### Tables with Direct Company Isolation:
- `companies` - Only current company row
- `roles` - Company-specific or global roles
- `company_users` - Current company users only
- `user_roles` - Current company user roles
- `audit_logs` - Current company audit logs
- `fiscal_years` - Current company fiscal years
- `accounts` - Current company accounts
- `voucher_types` - Current company voucher types
- `constant` - Current company customers/suppliers
- `journal_entries` - Current company journal entries
- `invoices` - Current company invoices
- `account_balances` - Current company account balances

### Tables with Join-based Isolation:
- `journal_entry_lines` - Via parent journal entry
- `invoice_lines` - Via parent invoice
- `blacklisted_tokens` - Via user-company relationship
- `users` - Via company_users relationship
- `role_permissions` - Via role-company relationship

### Special Cases:
- `permissions` - Read-only access for all users (global permissions)

## How It Works

1. **Authentication**: JWT token contains `companyId`
2. **Middleware**: RLS middleware sets `app.company_id` session variable
3. **Database**: All queries automatically filtered by RLS policies
4. **Isolation**: Users can only access data from their company

## Usage

The RLS is transparent to application code. Simply ensure:
1. JWT tokens include `companyId`
2. Users are properly associated with companies via `company_users` table
3. All database operations go through TypeORM (which respects RLS)

## Security Benefits

- **Data Isolation**: Complete separation of tenant data
- **Database Level**: Security enforced at PostgreSQL level
- **Automatic**: No need to add WHERE clauses in application code
- **Fail-Safe**: Even if application code has bugs, data remains isolated
- **Audit Trail**: All operations logged with proper company context

## Testing RLS

To test RLS policies:
```sql
-- Set company context
SELECT set_config('app.company_id', 'your-company-uuid', true);

-- Test queries - should only return data for set company
SELECT * FROM accounts;
SELECT * FROM invoices;
```