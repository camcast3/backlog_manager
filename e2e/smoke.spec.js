import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads and shows dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');
    // Click Backlog nav link
    await page.click('a[href="/backlog"]');
    await expect(page.locator('h1')).toContainText('Backlog');
  });

  test('all pages load without errors', async ({ page }) => {
    const pages = ['/', '/backlog', '/games', '/progress', '/analytics', '/recommend', '/settings'];
    for (const p of pages) {
      await page.goto(p);
      // Should not show error state
      await expect(page.locator('body')).not.toContainText('500');
    }
  });
});
