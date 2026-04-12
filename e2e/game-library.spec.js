import { test, expect } from '@playwright/test';

test.describe('Game Library', () => {
  test('navigates to game library', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/games"]');
    await expect(page.locator('h1')).toContainText('Game Library');
  });

  test('shows search input', async ({ page }) => {
    await page.goto('/games');
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });

  test('shows vibe filter dropdown', async ({ page }) => {
    await page.goto('/games');
    await expect(page.locator('select')).toBeVisible();
  });

  test('page loads without errors', async ({ page }) => {
    await page.goto('/games');
    await expect(page.locator('body')).not.toContainText('500');
  });
});
