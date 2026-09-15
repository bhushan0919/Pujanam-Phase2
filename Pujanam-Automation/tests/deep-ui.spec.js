import { test, expect } from '@playwright/test';

const routes = [
  '/', '/services', '/find-pandit', '/about', '/contact', '/privacy-policy',
  '/terms-conditions', '/cancellation-policy', '/delete-account', '/download-app',
  '/join-pandit', '/astro-services', '/premium-services', '/liveChat', '/help',
  '/trackBooking', '/support/live-chat', '/support/email', '/support/track-booking'
];

test.describe('Deep public UI checks', () => {
  for (const route of routes) {
    test(`TC-UI-DEEP-${route.replace(/[^a-z0-9]/gi, '-').slice(0, 18)}: ${route} renders without app crash`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(500);
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('body')).not.toContainText(/Cannot read properties|Application error|Internal Server Error/i);
    });
  }

  test('TC-UI-DEEP-020: home page has document title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
  });

  test('TC-UI-DEEP-021: services page has interactive content', async ({ page }) => {
    await page.goto('/services');
    await expect(page.locator('button, a, input').first()).toBeVisible();
  });

  test('TC-UI-DEEP-022: find pandit page has interactive content', async ({ page }) => {
    await page.goto('/find-pandit');
    await expect(page.locator('button, a, input').first()).toBeVisible();
  });

  test('TC-UI-DEEP-023: contact page has form or contact action', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('input, textarea, button, a').first()).toBeVisible();
  });

  test('TC-UI-DEEP-024: public pages do not horizontally overflow desktop viewport', async ({ page }) => {
    await page.goto('/services');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    expect(overflow).toBeFalsy();
  });

  test('TC-UI-DEEP-025: public pages do not horizontally overflow mobile viewport', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto('/find-pandit');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    expect(overflow).toBeFalsy();
    await context.close();
  });
});
