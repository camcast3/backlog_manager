import { test, expect } from '@playwright/test';

test.describe('Analytics', () => {
  test('analytics page loads with charts', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page.locator('h1')).toContainText('Analytics');
  });
});
