import { test, expect } from '@playwright/test';

test.describe('Form validation', () => {
  test('TC-FORM-001: contact form blocks empty submission', async ({ page }) => {
    await page.goto('/contact');
    const form = page.locator('form').first();
    await form.getByRole('button', { name: /submit|send|contact/i }).click().catch(() => form.locator('button[type="submit"]').click());
    await expect(page.locator('body')).toContainText(/required|enter|invalid/i);
  });

  test('TC-FORM-002: join Pandit validates invalid mobile', async ({ page }) => {
    await page.goto('/join-pandit');
    await page.getByPlaceholder(/your name/i).fill('Test User');
    await page.getByPlaceholder(/mobile number/i).fill('123');
    await page.getByPlaceholder(/your email/i).fill('test@example.com');
    await expect(page.locator('body')).toContainText(/mobile|10-digit/i);
  });

  test('TC-FORM-003: join Pandit validates invalid email', async ({ page }) => {
    await page.goto('/join-pandit');
    await page.getByPlaceholder(/your name/i).fill('Test User');
    await page.getByPlaceholder(/mobile number/i).fill('9876543210');
    await page.getByPlaceholder(/your email/i).fill('invalid-email');
    await page.getByPlaceholder(/qualification/i).fill('Test Qualification');
    await page.getByPlaceholder(/puja/i).fill('Puja Services');
    await page.locator('input[name="experience"]').fill('2');
    await page.locator('input[name="aadhar"]').fill('123456789012');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('body')).toContainText(/email|invalid/i);
  });

  test('TC-FORM-004: customer login required fields', async ({ page }) => {
    await page.goto('/user/login');
    const email = page.getByLabel(/email/i).first();
    const password = page.getByLabel(/password/i).first();
    await expect(email).toBeVisible();
    await expect(password).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|login/i }).first()).toBeVisible();
  });

  test('TC-FORM-005: admin login required fields', async ({ page }) => {
    await page.goto('/admin-login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('TC-FORM-006: pandit login required fields', async ({ page }) => {
    await page.goto('/pandit-login');
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });
});
