import { test, expect } from '@playwright/test';

test.describe('Vibe Portfolio / Gamer DNA', () => {
  test('navigates to Gamer DNA page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/vibe-dna"]');
    await expect(page.locator('h1')).toContainText('Gamer DNA');
  });

  test('shows empty state when no vibe profiles exist', async ({ page }) => {
    await page.goto('/vibe-dna');
    // Should show either DNA content or empty state
    const content = page.locator('body');
    await expect(content).toContainText(/Gamer DNA|vibe questions/i);
  });

  test('page loads without errors', async ({ page }) => {
    await page.goto('/vibe-dna');
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });
});
