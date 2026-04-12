import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.mjs',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'cd backend && node src/server.js',
      port: 3001,
      reuseExistingServer: true,
      env: {
        DATABASE_URL: 'postgres://postgres:password@localhost:5432/backlog_manager',
        NODE_ENV: 'test',
      },
    },
    {
      command: 'cd frontend && npx vite',
      port: 5173,
      reuseExistingServer: true,
    },
  ],
});
