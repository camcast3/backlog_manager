import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('shows dashboard on homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('shows Add Game button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Add Game')).toBeVisible();
  });

  test('shows Pick For Me button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Pick For Me')).toBeVisible();
  });

  test('shows stats section', async ({ page }) => {
    await page.goto('/');
    // Stats cards should be present
    await expect(page.locator('body')).toContainText(/Want to Play|Playing Now|Completed|Total/);
  });

  test('page loads without errors', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });
});
