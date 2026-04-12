import { test, expect } from '@playwright/test';

test.describe('Analytics', () => {
  test('analytics page loads with title', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page.locator('.page-title')).toContainText('Analytics', { timeout: 10000 });
  });

  test('page loads without errors', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });
});
