import { test, expect } from '@playwright/test';

test.describe('Keyboard Shortcuts', () => {
  test('pressing ? shows keyboard shortcuts help', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('?');
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
  });

  test('pressing Escape closes help modal', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('?');
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Keyboard Shortcuts')).not.toBeVisible();
  });

  test('pressing 2 navigates to backlog', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('2');
    await expect(page).toHaveURL(/\/backlog/);
    await expect(page.locator('h1')).toContainText('Backlog');
  });

  test('pressing 3 navigates to games', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('3');
    await expect(page).toHaveURL(/\/games/);
  });
});
