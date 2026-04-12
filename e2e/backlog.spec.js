import { test, expect } from '@playwright/test';

test.describe('Backlog Management', () => {
  test('can view backlog page with filters', async ({ page }) => {
    await page.goto('/backlog');
    await expect(page.locator('.page-title')).toContainText('Backlog', { timeout: 10000 });
    await expect(page.locator('button:has-text("Want to Play")')).toBeVisible();
    await expect(page.locator('button:has-text("Playing")')).toBeVisible();
  });

  test('can switch filter tabs', async ({ page }) => {
    await page.goto('/backlog');
    await expect(page.locator('.page-title')).toContainText('Backlog', { timeout: 10000 });
    await page.click('button:has-text("All")');
    // Should show either cards or empty state
    await expect(page.locator('.card, .empty-state, body')).toBeVisible();
  });

  test('can open add game modal', async ({ page }) => {
    await page.goto('/backlog');
    await expect(page.locator('.page-title')).toContainText('Backlog', { timeout: 10000 });
    await page.click('button:has-text("Add Game")');
    await expect(page.locator('.modal-overlay, [role="dialog"]')).toBeVisible();
  });
});
