import { test, expect } from '@playwright/test';

test.describe('Game Library', () => {
  test('navigates to game library', async ({ page }) => {
    await page.goto('/games');
    await expect(page.locator('.page-title')).toContainText('Game Library', { timeout: 30000 });
  });

  test('shows search input', async ({ page }) => {
    await page.goto('/games');
    await expect(page.locator('.page-title')).toContainText('Game Library', { timeout: 30000 });
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });

  test('shows vibe filter dropdown', async ({ page }) => {
    await page.goto('/games');
    await expect(page.locator('.page-title')).toContainText('Game Library', { timeout: 30000 });
    await expect(page.locator('select')).toBeVisible();
  });

  test('page loads without errors', async ({ page }) => {
    await page.goto('/games');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });
});
