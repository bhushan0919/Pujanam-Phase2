import { expect } from '@playwright/test';

export async function expectNoPageErrors(page) {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  return errors;
}

export async function fillByLabelOrPlaceholder(page, label, value, placeholder = label) {
  const byLabel = page.getByLabel(label, { exact: false });
  if (await byLabel.count()) {
    await byLabel.first().fill(value);
    return byLabel.first();
  }
  const byPlaceholder = page.getByPlaceholder(placeholder, { exact: false });
  if (await byPlaceholder.count()) {
    await byPlaceholder.first().fill(value);
    return byPlaceholder.first();
  }
  throw new Error(`Could not find field: ${label}`);
}

export async function loginAsUser(page) {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Customer test credentials are missing. Check the .env file for TEST_USER_EMAIL and TEST_USER_PASSWORD.'
    );
  }

  await page.goto('/user/login');

  await page.getByLabel(/email/i).first().fill(email);
  await page.getByLabel(/password/i).first().fill(password);

  const policyCheckbox = page.locator('input[type="checkbox"]').first();

  if (await policyCheckbox.isVisible()) {
    await policyCheckbox.check();
  }

  const submit = page.getByRole('button', {
    name: /sign in|login/i
  }).first();

  await expect(submit).toBeEnabled();
  await submit.click();

  await expect(page).toHaveURL(
    /\/user\/dashboard|\/services|\/find-pandit|\/$/
  );
}

export async function loginAsAdmin(page) {
  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASSWORD;
  testCredentialsOrSkip(email, password, 'TEST_ADMIN_EMAIL/TEST_ADMIN_PASSWORD');
  await page.goto('/admin-login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|login/i }).click();
  await expect(page).toHaveURL(/\/admin/);
}

export async function loginAsPandit(page) {
  const username = process.env.TEST_PANDIT_USERNAME;
  const password = process.env.TEST_PANDIT_PASSWORD;
  testCredentialsOrSkip(username, password, 'TEST_PANDIT_USERNAME/TEST_PANDIT_PASSWORD');
  await page.goto('/pandit-login');
  await page.getByLabel(/username/i).fill(username);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|login/i }).click();
  await expect(page).toHaveURL(/\/pandit/);
}

export function testCredentialsOrSkip(...args) {
  // Playwright's test.skip is intentionally avoided here so helper remains test-runner agnostic.
  if (args.slice(0, -1).some(v => !v)) {
    throw new Error(`Missing ${args.at(-1)}. Copy .env.example to .env and provide test credentials for this suite.`);
  }
}
