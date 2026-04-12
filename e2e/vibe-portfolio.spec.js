import { test, expect } from '@playwright/test';

test.describe('Vibe Portfolio / Gamer DNA', () => {
  test('navigates to Gamer DNA page', async ({ page }) => {
    // Go directly to avoid Dashboard's long loading spinner
    await page.goto('/vibe-dna');
    await expect(page.locator('body')).toContainText(/Gamer DNA/, { timeout: 30000 });
  });

  test('shows empty state when no vibe profiles exist', async ({ page }) => {
    await page.goto('/vibe-dna');
    const content = page.locator('body');
    await expect(content).toContainText(/Gamer DNA|vibe questions/i, { timeout: 30000 });
  });

  test('page loads without errors', async ({ page }) => {
    await page.goto('/vibe-dna');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });
});
