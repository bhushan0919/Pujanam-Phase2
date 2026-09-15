import { test, expect } from '@playwright/test';
import { loginAsUser, loginAsAdmin, loginAsPandit } from '../utils/helpers.js';

test.describe('Authentication and protected routes', () => {
  test('TC-AUTH-001: customer login rejects invalid password', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;
    test.skip(!email || !password, 'Provide TEST_USER_EMAIL and TEST_USER_PASSWORD');
    await page.goto('/user/login');
    await page.getByLabel(/email/i).first().fill(email);
    await page.getByLabel(/password/i).first().fill(`${password}-wrong`);

    const policyCheckbox = page.locator('input[type="checkbox"]').first();
    await policyCheckbox.check();

    const submit = page.getByRole('button', {
      name: /sign in|login/i
    }).first();

    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page.locator('body')).toContainText(/login failed|invalid|incorrect|failed/i);
  });

  test('TC-AUTH-002: customer protected dashboard redirects when logged out', async ({ page }) => {
    await page.goto('/user/dashboard');
    await expect(page).toHaveURL(/\/user\/login/);
  });

  test('TC-AUTH-003: astro protected route redirects when logged out', async ({ page }) => {
    await page.goto('/astro/kundali');
    await expect(page).toHaveURL(/\/user\/login/);
  });

  test('TC-AUTH-004: admin protected route redirects when logged out', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin-login/);
  });

  test('TC-AUTH-005: pandit protected route redirects when logged out', async ({ page }) => {
    await page.goto('/pandit');
    await expect(page).toHaveURL(/\/pandit-login/);
  });

  test('TC-AUTH-006: customer can login with test account', async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD, 'Provide customer test credentials');
    await loginAsUser(page);
  });

  test('TC-AUTH-007: admin can login with test account', async ({ page }) => {
    test.skip(!process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD, 'Provide admin test credentials');
    await loginAsAdmin(page);
  });

  test('TC-AUTH-008: pandit can login with test account', async ({ page }) => {
    test.skip(!process.env.TEST_PANDIT_USERNAME || !process.env.TEST_PANDIT_PASSWORD, 'Provide pandit test credentials');
    await loginAsPandit(page);
  });
});
