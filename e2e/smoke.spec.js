import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads and shows dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.page-title')).toContainText('Dashboard', { timeout: 10000 });
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/backlog"]');
    await expect(page.locator('.page-title')).toContainText('Backlog', { timeout: 10000 });
  });

  test('all pages load without errors', async ({ page }) => {
    const pages = ['/', '/backlog', '/games', '/progress', '/analytics', '/recommend', '/settings'];
    for (const p of pages) {
      await page.goto(p);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).not.toContainText('Internal Server Error');
    }
  });
});
