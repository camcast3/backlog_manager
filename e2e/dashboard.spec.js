import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('shows dashboard on homepage', async ({ page }) => {
    await page.goto('/');
    // Dashboard has a full-page spinner until all API calls complete
    await expect(page.locator('.page-title')).toContainText('Dashboard', { timeout: 30000 });
  });

  test('shows Add Game button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.page-title')).toContainText('Dashboard', { timeout: 30000 });
    await expect(page.locator('text=Add Game')).toBeVisible();
  });

  test('shows Pick For Me button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.page-title')).toContainText('Dashboard', { timeout: 30000 });
    await expect(page.locator('text=Pick For Me')).toBeVisible();
  });

  test('shows stats section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.page-title')).toContainText('Dashboard', { timeout: 30000 });
    await expect(page.locator('body')).toContainText(/Want to Play|Playing Now|Completed|Total/);
  });

  test('page loads without errors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });
});
