import { test, expect } from '@playwright/test';

test.describe('Progress & Achievements', () => {
  test('navigates to progress page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/progress"]');
    await expect(page.locator('h1')).toContainText('Progress');
  });

  test('shows level and XP information', async ({ page }) => {
    await page.goto('/progress');
    await expect(page.locator('body')).toContainText(/Level/);
  });

  test('shows achievement categories', async ({ page }) => {
    await page.goto('/progress');
    // Should show achievement section
    await expect(page.locator('body')).toContainText(/Achievements/);
  });

  test('page loads without errors', async ({ page }) => {
    await page.goto('/progress');
    await expect(page.locator('body')).not.toContainText('500');
  });
});
