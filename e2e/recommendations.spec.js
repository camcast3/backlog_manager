import { test, expect } from '@playwright/test';

test.describe('Recommendations', () => {
  test('navigates to recommendations page', async ({ page }) => {
    await page.goto('/recommend');
    await expect(page.locator('.page-title')).toContainText(/What Should I Play/i, { timeout: 30000 });
  });

  test('shows mood selection cards', async ({ page }) => {
    await page.goto('/recommend');
    await expect(page.locator('.page-title')).toContainText(/What Should I Play/i, { timeout: 30000 });
    await expect(page.locator('body')).toContainText('Wind Down');
    await expect(page.locator('body')).toContainText('Explore');
    await expect(page.locator('body')).toContainText('Test Myself');
  });

  test('shows session length options', async ({ page }) => {
    await page.goto('/recommend');
    await expect(page.locator('.page-title')).toContainText(/What Should I Play/i, { timeout: 30000 });
    await expect(page.locator('body')).toContainText(/Short/);
    await expect(page.locator('body')).toContainText(/Medium/);
    await expect(page.locator('body')).toContainText(/Long/);
  });

  test('shows Find My Game button', async ({ page }) => {
    await page.goto('/recommend');
    await expect(page.locator('.page-title')).toContainText(/What Should I Play/i, { timeout: 30000 });
    await expect(page.locator('text=Find My Game')).toBeVisible();
  });

  test('page loads without errors', async ({ page }) => {
    await page.goto('/recommend');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });
});
