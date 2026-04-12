import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test('settings page shows theme and data sections', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('text=Theme')).toBeVisible();
    await expect(page.locator('text=Data Management')).toBeVisible();
  });

  test('can change theme', async ({ page }) => {
    await page.goto('/settings');
    // Click a theme button
    const themeButtons = page.locator('button:has(div)').first();
    await themeButtons.click();
  });
});
