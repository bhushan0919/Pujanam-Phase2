import { test, expect } from '@playwright/test';

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

async function loginUser(page) {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error('TEST_USER_EMAIL or TEST_USER_PASSWORD is missing in .env');
  }

  await page.goto('/user/login', { waitUntil: 'domcontentloaded' });

  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);

  const checkbox = page.locator('input[type="checkbox"]').first();

  if (await checkbox.isVisible().catch(() => false)) {
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }
  }

  const submit = page.getByRole('button', {
    name: /sign in|login/i
  }).first();

  await expect(submit).toBeEnabled({ timeout: 10000 });

  await submit.click();

  // Give React/auth state time to update
  await page.waitForTimeout(3000);

  // Go directly to the protected dashboard
  await page.goto('/user/dashboard', {
    waitUntil: 'domcontentloaded'
  });

  await page.waitForTimeout(2000);

  // If authentication is valid, dashboard must be visible
  await expect(
    page.getByRole('heading', { name: /user dashboard/i })
  ).toBeVisible({ timeout: 15000 });
}

async function loginAdmin(page) {
  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASSWORD;
  test.skip(!email || !password, 'Admin credentials required');

  await page.goto('/admin-login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|login/i }).click();
  await expect(page).toHaveURL(/\/admin/);
}

async function loginPandit(page) {
  const username = process.env.TEST_PANDIT_USERNAME;
  const password = process.env.TEST_PANDIT_PASSWORD;
  test.skip(!username || !password, 'Pandit credentials required');

  await page.goto('/pandit-login');
  await page.getByLabel(/username/i).fill(username);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|login/i }).click();
  await expect(page).toHaveURL(/\/pandit/);
}

test.describe('Customer E2E business flows', () => {
  test('TC-E2E-001: customer login reaches dashboard and session is visible', async ({ page }) => {
    await loginUser(page);
    await expect(page.getByRole('heading', { name: /user dashboard/i })).toBeVisible();
    await expect(page.getByText(/session:/i)).toBeVisible();
  });

  test('TC-E2E-002: customer dashboard tabs switch correctly', async ({ page }) => {
    await loginUser(page);

    for (const name of [/upcoming/i, /completed/i, /cancelled/i, /^all$/i]) {
      await page.getByRole('button', { name }).click();
      await expect(page.getByRole('heading', { name: /your bookings/i })).toBeVisible();
    }
  });

  test('TC-E2E-003: Book New Service navigates to services', async ({ page }) => {
    await loginUser(page);
    await page.getByRole('button', { name: /book new service/i }).click();
    await expect(page).toHaveURL(/\/services/);
  });

  test('TC-E2E-004: Find Pandits quick action navigates correctly', async ({ page }) => {
    await loginUser(page);
    await page.getByRole('button', { name: /find pandits/i }).click();
    await expect(page).toHaveURL(/\/find-pandit/);
  });

  test('TC-E2E-005: customer can open and close Contact Support without submitting', async ({ page }) => {
  await loginUser(page);

  await page.getByRole('button', { name: /contact support/i }).last().click();

  await expect(
    page.getByRole('heading', { name: /^Contact Support$/i }).last()
  ).toBeVisible();

  const closeButton = page.locator('button.close-btn').first();

  await expect(closeButton).toBeVisible();

  await closeButton.evaluate((button) => button.click());

  await expect(
    page.getByRole('heading', { name: /^Contact Support$/i }).last()
  ).toHaveCount(0);
});

  test('TC-E2E-006: customer can open and close My Tickets', async ({ page }) => {
    await loginUser(page);
    await page.getByRole('button', { name: /my tickets/i }).click();
    await expect(page.getByText(/my tickets/i).first()).toBeVisible();
    await page.getByRole('button', { name: /^close$/i }).last().click();
  });

  test('TC-E2E-007: customer sees profile data on booking form', async ({ page }) => {
    await loginUser(page);
    await page.goto('/find-pandit');
    await page.waitForLoadState('networkidle').catch(() => { });
    await page.waitForTimeout(1500);
    const bookButton = page.getByRole('button').filter({
      hasText: /book/i
    }).first();

    await expect(bookButton).toBeVisible({ timeout: 10000 });
    await bookButton.click();

    await expect(page.locator('input[name="name"]')).toHaveValue(/.+/);
    await expect(page.locator('input[name="email"]')).toHaveValue(/.+@.+/);
  });

  test('TC-E2E-008: booking form validates missing required details without creating booking', async ({ page }) => {
    await loginUser(page);
    await page.goto('/find-pandit');

    await page.locator('input[name="contact"]').fill('');
    await page.locator('input[name="dateTime"]').fill('');
    await page.locator('textarea[name="address"]').fill('');

    await page.getByRole('button', { name: /confirm booking/i }).click();

    await expect(page.getByText(/contact number is required/i)).toBeVisible();
    await expect(page.getByText(/date and time is required/i)).toBeVisible();
    await expect(page.getByText(/complete address/i)).toBeVisible();
  });

  test('TC-E2E-009: booking form rejects invalid mobile number', async ({ page }) => {
    await loginUser(page);
    await page.goto('/find-pandit');

    await page.locator('input[name="contact"]').fill('12345');
    await page.locator('input[name="dateTime"]').fill('2030-12-31T12:00');
    await page.locator('textarea[name="address"]').fill('123 Main Street Pune');

    await page.getByRole('button', { name: /confirm booking/i }).click();
    await expect(page.getByText(/valid 10-digit contact number/i)).toBeVisible();
  });

  test('TC-E2E-010: customer can cancel booking modal without creating booking', async ({ page }) => {
    await loginUser(page);
    await page.goto('/find-pandit');
    await expect(page.getByRole('heading', { name: /book:/i })).toBeVisible();

    await page.getByRole('button', { name: /cancel/i }).last().click();
    await expect(page.getByRole('heading', { name: /book:/i })).toHaveCount(0);
  });
});

test.describe('Pandit E2E dashboard flows', () => {
  test('TC-E2E-011: Pandit dashboard loads with core sections', async ({ page }) => {
    await loginPandit(page);
    await expect(page.getByRole('heading', { name: /pandit dashboard/i })).toBeVisible();
    await expect(page.getByText(/today's schedule/i)).toBeVisible();
    await expect(page.getByText(/quick actions/i)).toBeVisible();
  });

  test('TC-E2E-012: Pandit dashboard tabs switch', async ({ page }) => {
    await loginPandit(page);

    await page.getByRole('button', { name: /notifications/i }).click();
    await expect(page.getByText(/booking notifications/i)).toBeVisible();

    await page.getByRole('button', { name: /upcoming/i }).click();
    await expect(page.getByText(/upcoming bookings/i)).toBeVisible();

    await page.getByRole('button', { name: /astro consultations/i }).click();
    await expect(page.getByText(/astrology consultations/i)).toBeVisible();
  });

  test('TC-E2E-013: Pandit Astro consultation sub-tabs switch', async ({ page }) => {
    await loginPandit(page);
    await page.getByRole('button', { name: /astro consultations/i }).click();

    for (const name of [/pending/i, /accepted/i, /completed/i]) {
      await page.getByRole('button', { name }).click();
      await expect(page.getByText(/astrology consultations/i)).toBeVisible();
    }
  });

  test('TC-E2E-014: Pandit logout returns to login page', async ({ page }) => {
    await loginPandit(page);
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/pandit-login/);
  });
});

test.describe('Admin E2E dashboard flows', () => {
  test('TC-E2E-015: Admin dashboard loads', async ({ page }) => {
    await loginAdmin(page);
    await expect(page.getByRole('heading', { name: /pujanam admin panel/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /dashboard overview/i })).toBeVisible();
  });

  test('TC-E2E-016: Admin navigation tabs switch', async ({ page }) => {
    await loginAdmin(page);

    const tabs = [
      [/bookings/i, /all bookings/i],
      [/manage pandits/i, /existing pandits/i],
      [/manage services/i, /existing services/i],
      [/support tickets/i, /support tickets/i],
      [/pandit applications/i, /pandit applications/i],
      [/contact messages/i, /contact messages/i],
    ];

    for (const [tab, content] of tabs) {
      await page.getByRole('button', { name: tab }).click();
      await expect(page.getByText(content).first()).toBeVisible();
    }
  });

  test('TC-E2E-017: Admin booking filters are visible', async ({ page }) => {
    await loginAdmin(page);
    await page.getByRole('button', { name: /bookings/i }).click();

    await expect(page.getByPlaceholder(/from date/i)).toBeVisible();
    await expect(page.getByPlaceholder(/to date/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /filter/i })).toBeVisible();
  });

  test('TC-E2E-018: Admin can search Pandits without modifying data', async ({ page }) => {
    await loginAdmin(page);
    await page.getByRole('button', { name: /manage pandits/i }).click();

    const search = page.getByPlaceholder(/search pandits/i);
    await expect(search).toBeVisible();
    await search.fill('zzzz-no-match');
    await expect(page.getByText(/existing pandits/i)).toBeVisible();
  });

  test('TC-E2E-019: Admin can search services without modifying data', async ({ page }) => {
    await loginAdmin(page);
    await page.getByRole('button', { name: /manage services/i }).click();

    const search = page.getByPlaceholder(/search services/i);
    await expect(search).toBeVisible();
    await search.fill('zzzz-no-match');
    await expect(page.getByText(/existing services/i)).toBeVisible();
  });

  test('TC-E2E-020: Admin logout returns to login page', async ({ page }) => {
    await loginAdmin(page);
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/admin-login/);
  });
});
