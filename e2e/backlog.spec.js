import { test, expect } from '@playwright/test';

test.describe('Backlog Management', () => {
  test('can view backlog page with filters', async ({ page }) => {
    await page.goto('/backlog');
    await expect(page.locator('h1')).toContainText('Backlog');
    // Status filter buttons should be visible
    await expect(page.locator('button:has-text("Want to Play")')).toBeVisible();
    await expect(page.locator('button:has-text("Playing")')).toBeVisible();
  });

  test('can switch filter tabs', async ({ page }) => {
    await page.goto('/backlog');
    await page.click('button:has-text("All")');
    // Should show items or empty state
    await expect(page.locator('.card, .empty-state')).toBeVisible();
  });

  test('can open add game modal', async ({ page }) => {
    await page.goto('/backlog');
    await page.click('button:has-text("Add Game")');
    // Modal should appear
    await expect(page.locator('[role="dialog"], .modal-backdrop')).toBeVisible();
  });
});
