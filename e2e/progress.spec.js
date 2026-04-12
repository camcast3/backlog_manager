import { test, expect } from '@playwright/test';

test.describe('Progress & Achievements', () => {
  test('navigates to progress page', async ({ page }) => {
    // Go directly — avoids Dashboard's long loading spinner
    await page.goto('/progress');
    await expect(page.locator('.page-title')).toContainText('Progress', { timeout: 30000 });
  });

  test('shows level and XP information', async ({ page }) => {
    await page.goto('/progress');
    await expect(page.locator('.page-title')).toContainText('Progress', { timeout: 30000 });
    await expect(page.locator('body')).toContainText(/Level/);
  });

  test('shows achievement categories', async ({ page }) => {
    await page.goto('/progress');
    await expect(page.locator('.page-title')).toContainText('Progress', { timeout: 30000 });
    await expect(page.locator('body')).toContainText(/Achievements/);
  });

  test('page loads without errors', async ({ page }) => {
    await page.goto('/progress');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });
});
