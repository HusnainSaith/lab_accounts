import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './playwright-tests',
    fullyParallel: false, // Sequential is better for accounting flows
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1, // Sequential execution for stable COA/Fiscal Year state
    reporter: [
        ['html', { open: 'never' }],
        ['list']
    ],
    use: {
        baseURL: 'http://localhost:3000',
        extraHTTPHeaders: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        trace: 'on',
        screenshot: 'on',
        video: 'on',
    },
});
