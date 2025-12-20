import { test, expect, APIRequestContext } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Exhaustive Project API Flow', () => {
    let accessToken: string;
    let companyId: string;
    let fiscalYearId: string;
    let bankAccountId: string;
    let voucherTypeId: string;
    let customerId: string;
    let invoiceId: string;
    let journalEntryId: string;
    let roleId: string;

    const uniqueId = Math.random().toString(36).substring(7);
    const adminEmail = `admin_${uniqueId}@playwright.com`;
    const password = 'Password123!';

    // 1. AUTHENTICATION
    test('should register and login', async ({ request }) => {
        // Register
        const regResponse = await request.post('/auth/register', {
            data: {
                firstName: 'Playwright',
                lastName: 'Admin',
                email: adminEmail,
                password: password,
                companyName: `PW Corp ${uniqueId}`,
                countryCode: 'AE',
                phone: '+971500000000'
            }
        });
        expect(regResponse.status()).toBe(201);
        const regBody = await regResponse.json();
        companyId = regBody.company.id;

        // Login (AuthService automatically picks the first active company)
        const loginResponse = await request.post('/auth/login', {
            data: { email: adminEmail, password }
        });
        expect(loginResponse.status()).toBe(201);
        const loginBody = await loginResponse.json();
        accessToken = loginBody.access_token;
        expect(accessToken).toBeDefined();
    });

    // 3. FISCAL & ACCOUNTING SETUP
    test('should verify seeded setup and create custom artifacts', async ({ request }) => {
        const authHeader = { 'Authorization': `Bearer ${accessToken}` };

        // Verify Seeded Fiscal Year
        const fyRes = await request.get('/fiscal-years', { headers: authHeader });
        expect(fyRes.status()).toBe(200);
        const fys = await fyRes.json();
        expect(fys.length).toBeGreaterThan(0);
        fiscalYearId = fys[0].id;

        // Verify Seeded COA
        const coaRes = await request.get('/accounts', { headers: authHeader });
        expect(coaRes.status()).toBe(200);
        const accounts = await coaRes.json();
        expect(accounts.length).toBeGreaterThan(20);

        // Find seeded bank account '1112'
        const bank = accounts.find((a: any) => a.code === '1112');
        expect(bank).toBeDefined();
        bankAccountId = bank.id;

        // Create Custom Posting Account
        const accRes = await request.post('/accounts', {
            headers: authHeader,
            data: {
                code: `9999-${uniqueId.substring(0, 4)}`,
                name: 'PW Custom Expense',
                type: 'expense',
                isPosting: true,
                level: '4'
            }
        });
        expect(accRes.status()).toBe(201);

        // Create Voucher Type
        const vtRes = await request.post('/voucher-types', {
            headers: authHeader,
            data: {
                code: 'PW-JV',
                name: 'Playwright JV',
                nature: 'journal',
                autoNumbering: true
            }
        });
        expect(vtRes.status()).toBe(201);
        const vtBody = await vtRes.json();
        voucherTypeId = vtBody.id;
    });

    // 4. CRM & SALES
    test('should handle customer and sales flow', async ({ request }) => {
        const authHeader = { 'Authorization': `Bearer ${accessToken}` };

        // Create Customer
        const custRes = await request.post('/constants', {
            headers: authHeader,
            data: {
                code: `CUST-PW-${uniqueId.toUpperCase()}`,
                name: 'Playwright Customer',
                type: 'customer',
                email: 'customer@playwright.com'
            }
        });
        expect(custRes.status()).toBe(201);
        const custBody = await custRes.json();
        customerId = custBody.id;

        // Create Sales Invoice
        const invRes = await request.post('/invoices', {
            headers: authHeader,
            data: {
                customerId: customerId,
                invoiceType: 'sales',
                supplyDate: new Date().toISOString().split('T')[0],
                dueDate: new Date().toISOString().split('T')[0],
                currencyCode: 'AED',
                vatRate: 5,
                invoiceItems: [
                    {
                        description: 'API Consult',
                        quantity: 1,
                        unitPrice: 5000,
                        vatRate: 5
                    }
                ]
            }
        });
        expect(invRes.status()).toBe(201);
        const invBody = await invRes.json();
        invoiceId = invBody.id;

        // Verify Invoice Lines
        const linesRes = await request.get(`/invoice-lines/invoice/${invoiceId}`, { headers: authHeader });
        expect(linesRes.status()).toBe(200);
    });

    // 5. JOURNAL ENTRIES & FINANCIALS
    test('should create balanced journal entry and check balances', async ({ request }) => {
        const authHeader = { 'Authorization': `Bearer ${accessToken}` };

        // Post Journal Entry
        const jeRes = await request.post('/journal-entries', {
            headers: authHeader,
            data: {
                voucherTypeId: voucherTypeId,
                voucherNo: `PW-JV-${uniqueId}`,
                entryDate: new Date().toISOString().split('T')[0],
                postingDate: new Date().toISOString().split('T')[0],
                lines: [
                    { accountId: bankAccountId, debit: "1000.00", credit: "0.00", description: "PW Debit" },
                    { accountId: bankAccountId, debit: "0.00", credit: "1000.00", description: "PW Credit" }
                ]
            }
        });
        expect(jeRes.status()).toBe(201);
        const jeBody = await jeRes.json();
        journalEntryId = jeBody.id;

        // Check Balances
        const balRes = await request.get('/account-balances', { headers: authHeader });
        expect(balRes.status()).toBe(200);

        const trialRes = await request.get('/account-balances/trial-balance', { headers: authHeader });
        expect(trialRes.status()).toBe(200);
    });

    // 6. IAM & MANAGEMENT
    test('should verify IAM and System logs', async ({ request }) => {
        const authHeader = { 'Authorization': `Bearer ${accessToken}` };

        // Roles
        const roleRes = await request.get('/roles', { headers: authHeader });
        expect(roleRes.status()).toBe(200);
        const roles = await roleRes.json();
        roleId = roles[0].id;

        // Permissions
        const permRes = await request.get('/permissions', { headers: authHeader });
        expect(permRes.status()).toBe(200);

        // Audit Logs
        const auditRes = await request.get('/audit-logs', { headers: authHeader });
        expect(auditRes.status()).toBe(200);
    });

    // 7. REPORTING
    test('should generate financial reports', async ({ request }) => {
        const authHeader = { 'Authorization': `Bearer ${accessToken}` };

        const bsRes = await request.get('/reports/balance-sheet', {
            headers: authHeader,
            params: { asOfDate: new Date().toISOString().split('T')[0] }
        });
        expect(bsRes.status()).toBe(200);

        const dashRes = await request.get('/reports/dashboard/charts', {
            headers: authHeader,
            params: { months: 6 }
        });
        expect(dashRes.status()).toBe(200);
    });
});
