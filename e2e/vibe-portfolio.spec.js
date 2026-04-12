import { test, expect } from '@playwright/test';

test.describe('Vibe Portfolio / Gamer DNA', () => {
  test('navigates to Gamer DNA page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.page-title')).toContainText('Dashboard', { timeout: 10000 });
    await page.click('a[href="/vibe-dna"]');
    await expect(page.locator('body')).toContainText(/Gamer DNA/, { timeout: 10000 });
  });

  test('shows empty state when no vibe profiles exist', async ({ page }) => {
    await page.goto('/vibe-dna');
    const content = page.locator('body');
    await expect(content).toContainText(/Gamer DNA|vibe questions/i, { timeout: 10000 });
  });

  test('page loads without errors', async ({ page }) => {
    await page.goto('/vibe-dna');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });
});
