import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('New Modules E2E Tests', () => {
    let app: INestApplication;
    let accessToken: string;
    let paymentId: string;
    let integrationId: string;

    const uniqueId = Math.random().toString(36).substring(7);
    const userEmail = `newmodules_${uniqueId}@example.com`;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
        await app.init();

        // Register and login
        await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: userEmail,
                password: 'Password123!',
                firstName: 'Test',
                lastName: 'User',
                countryCode: 'AE',
                phone: '+971500000001'
            });

        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: userEmail,
                password: 'Password123!'
            });

        accessToken = loginResponse.body.access_token;

        // Create a company
        await request(app.getHttpServer())
            .post('/companies')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                name: `Test Company ${uniqueId}`,
                countryCode: 'UAE',
                currencyCode: 'AED',
                vatRate: 5
            });

        // Re-login to get company context
        const reloginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: userEmail,
                password: 'Password123!'
            });

        accessToken = reloginResponse.body.access_token;
    });

    afterAll(async () => {
        await app.close();
    });

    // PAYMENTS MODULE TESTS
    describe('Payments Module', () => {
        let accountId: string;

        beforeAll(async () => {
            // Get a bank account for payment
            const accountsResponse = await request(app.getHttpServer())
                .get('/accounts')
                .set('Authorization', `Bearer ${accessToken}`);

            const bankAccount = accountsResponse.body.find((a: any) => a.code === '1112');
            accountId = bankAccount?.id;
        });

        it('should create a payment', async () => {
            const response = await request(app.getHttpServer())
                .post('/payments')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    date: new Date().toISOString().split('T')[0],
                    paymentMethod: 'bank',
                    amount: 500,
                    reference: 'E2E-TEST-001',
                    notes: 'E2E Test Payment',
                    accountId: accountId
                })
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('paymentNumber');
            expect(response.body.status).toBe('pending');
            paymentId = response.body.id;
        });

        it('should list all payments', async () => {
            const response = await request(app.getHttpServer())
                .get('/payments')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('should get a specific payment', async () => {
            const response = await request(app.getHttpServer())
                .get(`/payments/${paymentId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.id).toBe(paymentId);
        });

        it('should confirm a payment', async () => {
            const response = await request(app.getHttpServer())
                .post(`/payments/${paymentId}/confirm`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(201);

            expect(response.body.status).toBe('confirmed');
        });

        it('should cancel a payment', async () => {
            // Create another payment to cancel
            const createResponse = await request(app.getHttpServer())
                .post('/payments')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    date: new Date().toISOString().split('T')[0],
                    paymentMethod: 'cash',
                    amount: 100,
                    accountId: accountId
                });

            const cancelResponse = await request(app.getHttpServer())
                .post(`/payments/${createResponse.body.id}/cancel`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(201);

            expect(cancelResponse.body.status).toBe('cancelled');
        });
    });

    // BILLING MODULE TESTS
    describe('Billing Module', () => {
        it('should get subscription (creates FREE if not exists)', async () => {
            const response = await request(app.getHttpServer())
                .get('/billing/subscription')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('id');
            expect(response.body.plan).toBe('free');
            expect(response.body.status).toBe('active');
        });

        it('should update subscription', async () => {
            const response = await request(app.getHttpServer())
                .patch('/billing/subscription')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    plan: 'basic',
                    autoRenew: true
                })
                .expect(200);

            expect(response.body.plan).toBe('basic');
        });

        it('should get billing transactions', async () => {
            const response = await request(app.getHttpServer())
                .get('/billing/transactions')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should cancel subscription', async () => {
            const response = await request(app.getHttpServer())
                .post('/billing/subscription/cancel')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(201);

            expect(response.body.status).toBe('cancelled');
        });
    });

    // INTEGRATIONS MODULE TESTS
    describe('Integrations Module', () => {
        it('should create an integration', async () => {
            const response = await request(app.getHttpServer())
                .post('/integrations')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    type: 'stripe',
                    name: 'Stripe Integration',
                    description: 'E2E Test Stripe Integration',
                    config: { mode: 'test' },
                    apiKey: 'test_key_123'
                })
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.type).toBe('stripe');
            expect(response.body.status).toBe('inactive');
            integrationId = response.body.id;
        });

        it('should list all integrations', async () => {
            const response = await request(app.getHttpServer())
                .get('/integrations')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('should get a specific integration', async () => {
            const response = await request(app.getHttpServer())
                .get(`/integrations/${integrationId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.id).toBe(integrationId);
        });

        it('should activate an integration', async () => {
            const response = await request(app.getHttpServer())
                .post(`/integrations/${integrationId}/activate`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(201);

            expect(response.body.status).toBe('active');
        });

        it('should test integration connection', async () => {
            const response = await request(app.getHttpServer())
                .post(`/integrations/${integrationId}/test`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(201);

            expect(response.body).toHaveProperty('success');
            expect(response.body).toHaveProperty('message');
        });

        it('should deactivate an integration', async () => {
            const response = await request(app.getHttpServer())
                .post(`/integrations/${integrationId}/deactivate`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(201);

            expect(response.body.status).toBe('inactive');
        });

        it('should update an integration', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/integrations/${integrationId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Updated Stripe Integration',
                    description: 'Updated description'
                })
                .expect(200);

            expect(response.body.name).toBe('Updated Stripe Integration');
        });
    });

    // SETTINGS MODULE TESTS
    describe('Settings Module', () => {
        it('should get user settings (creates default if not exists)', async () => {
            const response = await request(app.getHttpServer())
                .get('/settings/user')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('id');
            expect(response.body.theme).toBe('light');
            expect(response.body.language).toBe('en');
        });

        it('should update user settings', async () => {
            const response = await request(app.getHttpServer())
                .patch('/settings/user')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    theme: 'dark',
                    language: 'ur',
                    timezone: 'Asia/Dubai'
                })
                .expect(200);

            expect(response.body.theme).toBe('dark');
            expect(response.body.language).toBe('ur');
            expect(response.body.timezone).toBe('Asia/Dubai');
        });

        it('should get tenant settings (creates default if not exists)', async () => {
            const response = await request(app.getHttpServer())
                .get('/settings/tenant')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('companyName');
        });

        it('should update tenant settings', async () => {
            const response = await request(app.getHttpServer())
                .patch('/settings/tenant')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    companyEmail: 'updated@company.com',
                    companyPhone: '+971501234567',
                    taxRate: 5
                })
                .expect(200);

            expect(response.body.companyEmail).toBe('updated@company.com');
            expect(response.body.taxRate).toBe(5);
        });
    });

    // REPORTS MODULE - Test aligned endpoints
    describe('Reports Module - Aligned Endpoints', () => {
        it('should get trial balance from /reports/trial-balance', async () => {
            const response = await request(app.getHttpServer())
                .get('/reports/trial-balance')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should get general ledger from /reports/general-ledger/:accountId', async () => {
            // Get an account first
            const accountsResponse = await request(app.getHttpServer())
                .get('/accounts')
                .set('Authorization', `Bearer ${accessToken}`);

            const account = accountsResponse.body[0];

            const response = await request(app.getHttpServer())
                .get(`/reports/general-ledger/${account.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toBeDefined();
        });
    });
});
