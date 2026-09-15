import { test, expect } from '@playwright/test';

test.describe('Astro protected pages', () => {
  for (const route of ['/astro/kundali', '/astro/kundali/result', '/astro/horoscope', '/astro/horoscope/result', '/astro/compatibility', '/astro/compatibility/result']) {
    test(`TC-ASTRO: ${route} requires customer login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/user\/login/);
    });
  }
});
