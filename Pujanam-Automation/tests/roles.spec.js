import { test, expect } from '@playwright/test';
import { loginAsUser, loginAsAdmin, loginAsPandit } from '../utils/helpers.js';

test.describe('Role dashboards', () => {
  test('TC-ROLE-001: customer dashboard loads', async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD, 'Customer credentials required');
    await loginAsUser(page);
    await page.goto('/user/dashboard');
    await expect(page.locator('body')).not.toContainText(/Application error|Cannot read properties/i);
  });

  test('TC-ROLE-002: admin dashboard loads', async ({ page }) => {
    test.skip(!process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD, 'Admin credentials required');
    await loginAsAdmin(page);
    await expect(page.locator('body')).not.toContainText(/Application error|Cannot read properties/i);
  });

  test('TC-ROLE-003: pandit dashboard loads', async ({ page }) => {
    test.skip(!process.env.TEST_PANDIT_USERNAME || !process.env.TEST_PANDIT_PASSWORD, 'Pandit credentials required');
    await loginAsPandit(page);
    await expect(page.locator('body')).not.toContainText(/Application error|Cannot read properties/i);
  });
});
