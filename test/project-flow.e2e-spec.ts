import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Project Flow (E2E)', () => {
    let app: INestApplication;
    let accessToken: string;
    let userId: string;
    let companyId: string;
    let customerId: string;
    let invoiceId: string;
    let fiscalYearId: string;
    let voucherTypeId: string;
    let journalEntryId: string;
    let bankAccountId: string;

    // Utilize a random string to avoid unique constraint violations on re-runs
    const uniqueId = Math.random().toString(36).substring(7);
    const userEmail = `admin_${uniqueId}@example.com`;
    const companyName = `Test Company ${uniqueId}`;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    // 1. AUTHENTICATION MODULE
    describe('Authentication', () => {
        it('should register a new user', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: userEmail,
                    password: 'Password123!',
                    firstName: 'Admin',
                    lastName: 'User',
                    countryCode: 'AE',
                    phone: '+971500000000'
                })
                .expect(201);

            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('id');
            userId = response.body.user.id;
        });

        it('should login', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: userEmail,
                    password: 'Password123!'
                })
                .expect(201);

            expect(response.body).toHaveProperty('access_token');
            accessToken = response.body.access_token;
        });
    });

    // 2. COMPANY MODULE
    describe('Company Management', () => {
        it('should create a new company', async () => {
            const response = await request(app.getHttpServer())
                .post('/companies')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: companyName,
                    countryCode: 'UAE',
                    currencyCode: 'AED',
                    vatRate: 5
                })
                .expect(201);

            expect(response.body).toHaveProperty('id');
            companyId = response.body.id;
        });

        it('should get company statistics', async () => {
            await request(app.getHttpServer())
                .get('/companies/statistics')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
        });
    });

    // 3. RE-AUTHENTICATION (to get companyId in token)
    describe('Re-Authentication with Context', () => {
        it('should login again to get company context in token', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: userEmail,
                    password: 'Password123!'
                })
                .expect(201);

            accessToken = response.body.access_token;
        });
    });

    // 4. FISCAL SETUP
    describe('Fiscal Years', () => {
        it('should verify seeded fiscal year', async () => {
            const response = await request(app.getHttpServer())
                .get('/fiscal-years')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.length).toBeGreaterThan(0);
            fiscalYearId = response.body[0].id;
        });

        it('should create a custom fiscal year', async () => {
            await request(app.getHttpServer())
                .post('/fiscal-years')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    yearName: `FY TEST ${uniqueId}`,
                    startDate: '2027-01-01',
                    endDate: '2027-12-31'
                })
                .expect(201);
        });
    });

    // 5. ACCOUNTING SETUP
    describe('Accounting Setup', () => {
        it('should verify seeded chart of accounts', async () => {
            const response = await request(app.getHttpServer())
                .get('/accounts')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.length).toBeGreaterThan(10); // Should have ~25 seeded accounts
            // Seeded Bank Account is '1112'
            const bank = response.body.find((a: any) => a.code === '1112');
            expect(bank).toBeDefined();
            bankAccountId = bank.id;
        });

        it('should create a Custom Level 4 Posting Account', async () => {
            const response = await request(app.getHttpServer())
                .post('/accounts')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    code: `9999-${uniqueId.substring(0, 4)}`,
                    name: 'E2E Custom Account',
                    type: 'expense',
                    isPosting: true,
                    level: '4'
                })
                .expect(201);
        });

        it('should create a Voucher Type', async () => {
            const response = await request(app.getHttpServer())
                .post('/voucher-types')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    code: 'JV-E2E',
                    name: 'E2E Journal Voucher',
                    nature: 'journal',
                    autoNumbering: true
                })
                .expect(201);

            expect(response.body).toHaveProperty('id');
            voucherTypeId = response.body.id;
        });
    });

    // 6. CONSTANTS (Customers/Vendors)
    describe('Constants', () => {
        it('should create a Customer', async () => {
            const response = await request(app.getHttpServer())
                .post('/constants')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    code: `CUST-${uniqueId.toUpperCase()}`,
                    name: 'E2E Test Customer',
                    type: 'customer',
                    email: 'e2e@customer.com',
                    taxRegistrationNo: '123456789012345'
                })
                .expect(201);

            customerId = response.body.id;
        });
    });

    // 7. INVOICING
    describe('Invoicing', () => {
        it('should create a Sales Invoice', async () => {
            const response = await request(app.getHttpServer())
                .post('/invoices')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    customerId: customerId,
                    invoiceType: 'sales',
                    supplyDate: new Date().toISOString().split('T')[0],
                    dueDate: new Date().toISOString().split('T')[0],
                    currencyCode: 'AED',
                    vatRate: 5,
                    invoiceItems: [
                        {
                            description: 'E2E Item',
                            quantity: 1,
                            unitPrice: 1000,
                            vatRate: 5
                        }
                    ]
                })
                .expect(201);

            expect(response.body).toHaveProperty('id');
            invoiceId = response.body.id;
        });

        it('should mark invoice as send', async () => {
            await request(app.getHttpServer())
                .patch(`/invoices/${invoiceId}/send`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
        });
    });

    // 8. JOURNAL ENTRIES
    describe('Journal Entries', () => {
        it('should create a Journal Entry', async () => {
            const response = await request(app.getHttpServer())
                .post('/journal-entries')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    voucherTypeId: voucherTypeId,
                    voucherNo: `JV-${uniqueId}`,
                    entryDate: new Date().toISOString().split('T')[0],
                    postingDate: new Date().toISOString().split('T')[0],
                    lines: [
                        {
                            accountId: bankAccountId,
                            debit: "100.00",
                            credit: "0.00",
                            description: "E2E Debit line"
                        },
                        {
                            accountId: bankAccountId,
                            debit: "0.00",
                            credit: "100.00",
                            description: "E2E Credit line"
                        }
                    ]
                })
                .expect(201);

            expect(response.body).toHaveProperty('id');
            journalEntryId = response.body.id;
        });

        it('should list journal entries', async () => {
            await request(app.getHttpServer())
                .get('/journal-entries')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
        });
    });

    // 9. MANAGEMENT (Users, Audit Logs, IAM)
    describe('Management & IAM', () => {
        let roleId: string;
        let permissionId: string;

        it('should list users', async () => {
            await request(app.getHttpServer())
                .get('/users')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
        });

        it('should list audit logs', async () => {
            await request(app.getHttpServer())
                .get('/audit-logs')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
        });

        it('should list roles', async () => {
            const response = await request(app.getHttpServer())
                .get('/roles')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.length).toBeGreaterThan(0);
            roleId = response.body[0].id;
        });

        it('should list permissions', async () => {
            const response = await request(app.getHttpServer())
                .get('/permissions')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.length).toBeGreaterThan(0);
            permissionId = response.body[0].id;
        });

        it('should get role permissions', async () => {
            await request(app.getHttpServer())
                .get(`/role-permissions/role/${roleId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
        });
    });

    // 10. ADVANCED FINANCIALS (Account Balances & Invoice Lines)
    describe('Advanced Financials', () => {
        it('should list invoice lines for our created invoice', async () => {
            await request(app.getHttpServer())
                .get(`/invoice-lines/invoice/${invoiceId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
        });

        it('should get account balances', async () => {
            await request(app.getHttpServer())
                .get('/account-balances')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
        });

        it('should get trial balance', async () => {
            await request(app.getHttpServer())
                .get('/account-balances/trial-balance')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
        });
    });

    // 11. REPORTS
    describe('Reports', () => {
        it('should generate a Balance Sheet', async () => {
            const date = new Date().toISOString().split('T')[0];
            await request(app.getHttpServer())
                .get('/reports/balance-sheet')
                .query({ asOfDate: date })
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
        });

        it('should generate Dashboard Charts data', async () => {
            await request(app.getHttpServer())
                .get('/reports/dashboard/charts')
                .query({ months: 6 })
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
        });
    });
});

