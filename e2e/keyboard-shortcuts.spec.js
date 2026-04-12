import { test, expect } from '@playwright/test';

test.describe('Keyboard Shortcuts', () => {
  test('pressing ? shows keyboard shortcuts help', async ({ page }) => {
    await page.goto('/backlog');
    await expect(page.locator('.page-title')).toContainText('Backlog', { timeout: 30000 });
    await page.keyboard.press('?');
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible({ timeout: 5000 });
  });

  test('pressing Escape closes help modal', async ({ page }) => {
    await page.goto('/backlog');
    await expect(page.locator('.page-title')).toContainText('Backlog', { timeout: 30000 });
    await page.keyboard.press('?');
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible({ timeout: 5000 });
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Keyboard Shortcuts')).not.toBeVisible({ timeout: 5000 });
  });

  test('pressing 2 navigates to backlog', async ({ page }) => {
    await page.goto('/games');
    await expect(page.locator('.page-title')).toContainText('Game Library', { timeout: 30000 });
    await page.keyboard.press('2');
    await expect(page).toHaveURL(/\/backlog/, { timeout: 5000 });
  });

  test('pressing 3 navigates to games', async ({ page }) => {
    await page.goto('/backlog');
    await expect(page.locator('.page-title')).toContainText('Backlog', { timeout: 30000 });
    await page.keyboard.press('3');
    await expect(page).toHaveURL(/\/games/, { timeout: 5000 });
  });
});
