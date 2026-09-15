import { test, expect } from '@playwright/test';
import { loginAsUser } from '../utils/helpers.js';

const badText = /Application error|Cannot read properties|Internal Server Error|TypeError:/i;

test.describe('Extended customer-facing UI coverage', () => {
  test('TC-UI-001: services page shows service section', async ({ page }) => {
    await page.goto('/services');
    await expect(page.getByRole('heading', { name: /Explore Sacred Puja Services/i })).toBeVisible();
    await expect(page.getByText(/Popular Puja Services/i)).toBeVisible();
  });

  test('TC-UI-002: services search accepts text', async ({ page }) => {
    await page.goto('/services');
    const search = page.getByRole('textbox', { name: /Search puja by name/i });
    await search.fill('Ganesh');
    await expect(search).toHaveValue('Ganesh');
  });

  test('TC-UI-003: services search shows no-match state for unknown puja', async ({ page }) => {
    await page.goto('/services');
    const search = page.getByRole('textbox', { name: /Search puja by name/i });
    await search.fill('ZZZ-NO-PUJA-MATCH-999');
    await expect(page.getByText(/No services match your search/i)).toBeVisible();
  });

  test('TC-UI-004: services search can be cleared after no-match', async ({ page }) => {
    await page.goto('/services');
    const search = page.getByRole('textbox', { name: /Search puja by name/i });
    await search.fill('ZZZ-NO-PUJA-MATCH-999');
    await page.getByRole('button', { name: /Clear search/i }).click();
    await expect(search).toHaveValue('');
  });

  test('TC-UI-005: View Pandit navigates to find pandit', async ({ page }) => {
    await page.goto('/services');
    await page.getByRole('button', { name: 'View Pandit', exact: true }).click();
    await expect(page).toHaveURL(/\/find-pandit/);
  });

  test('TC-UI-006: find pandit page has search and filters', async ({ page }) => {
    await page.goto('/find-pandit');
    await expect(page.getByRole('heading', { name: /Find.*Pandit/i })).toBeVisible();
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
    await expect(page.locator('select')).toHaveCount(2);
  });

  test('TC-UI-007: find pandit search updates input', async ({ page }) => {
    await page.goto('/find-pandit');
    const search = page.locator('input[type="text"]').first();
    await search.fill('ZZZ-NO-PANDIT-999');
    await expect(search).toHaveValue('ZZZ-NO-PANDIT-999');
  });

  test('TC-UI-008: customer login password visibility control works', async ({ page }) => {
    await page.goto('/user/login');
    const password = page.getByLabel(/password/i).first();
    await password.fill('ExamplePassword123');
    const toggle = page.getByRole('button', { name: /show password/i }).first();
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(password).toHaveAttribute('type', 'text');
  });

  test('TC-UI-009: customer login has forgot password link', async ({ page }) => {
    await page.goto('/user/login');
    await expect(page.getByRole('link', { name: /forgot password/i })).toHaveAttribute('href', '/user/forgot-password');
  });

  test('TC-UI-010: forgot password page loads', async ({ page }) => {
    await page.goto('/user/forgot-password');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(badText);
  });

  test('TC-UI-011: admin login page exposes required controls', async ({ page }) => {
    await page.goto('/admin-login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
  });

  test('TC-UI-012: pandit login page exposes required controls', async ({ page }) => {
    await page.goto('/pandit-login');
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('TC-UI-013: contact page contains a form', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('form').first()).toBeVisible();
  });

  test('TC-UI-014: join pandit page contains application form', async ({ page }) => {
    await page.goto('/join-pandit');
    await expect(page.locator('form').first()).toBeVisible();
  });

  test('TC-UI-015: legal pages load without application errors', async ({ page }) => {
    for (const route of ['/privacy-policy', '/terms-conditions', '/cancellation-policy']) {
      await page.goto(route);
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('body')).not.toContainText(badText);
    }
  });

  test('TC-UI-016: support pages load without application errors', async ({ page }) => {
    for (const route of ['/support/live-chat', '/support/email', '/support/track-booking']) {
      await page.goto(route);
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('body')).not.toContainText(badText);
    }
  });

  test('TC-UI-017: kundali form requires customer authentication', async ({ page }) => {
    await page.goto('/astro/kundali');
    await expect(page).toHaveURL(/\/user\/login/);
  });

  test('TC-UI-018: horoscope form requires customer authentication', async ({ page }) => {
    await page.goto('/astro/horoscope');
    await expect(page).toHaveURL(/\/user\/login/);
  });

  test('TC-UI-019: compatibility form requires customer authentication', async ({ page }) => {
    await page.goto('/astro/compatibility');
    await expect(page).toHaveURL(/\/user\/login/);
  });

  test('TC-UI-020: mobile services page has no obvious horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/services');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
    expect(overflow).toBeFalsy();
  });
});
