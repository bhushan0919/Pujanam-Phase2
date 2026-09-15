import { test, expect } from '@playwright/test';

const publicRoutes = [
  '/', '/services', '/find-pandit', '/about', '/contact', '/privacy-policy',
  '/terms-conditions', '/cancellation-policy', '/delete-account', '/download-app',
  '/join-pandit', '/astro-services', '/premium-services', '/help', '/trackBooking',
  '/liveChat', '/support/live-chat', '/support/email', '/support/track-booking',
  '/user/login', '/admin-login', '/pandit-login', '/user/forgot-password',
  '/pandit-forgot-password'
];

test.describe('Pujanam public smoke tests', () => {
  for (const route of publicRoutes) {
    test(`TC-SMOKE: ${route} loads`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(500);
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('body')).not.toContainText(/Cannot read properties|Application error|Internal Server Error/i);
    });
  }

  test('TC-SMOKE: unknown route shows 404 UI', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText(/404.*Page Not Found/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /go home/i })).toHaveAttribute('href', '/');
  });

  test('TC-SMOKE: mobile layout has no obvious horizontal overflow', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
    expect(overflow).toBeFalsy();
  });
});
