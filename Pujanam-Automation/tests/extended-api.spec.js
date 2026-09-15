import { test, expect } from '@playwright/test';

const API = process.env.API_URL || 'http://localhost:5000/api';

async function expectJsonOrClientError(res) {
  expect(res.status()).toBeLessThan(500);
  const type = res.headers()['content-type'] || '';
  expect(type).toContain('application/json');
}

test.describe('Extended public API coverage', () => {
  test('TC-API-013: active services endpoint responds', async ({ request }) => {
    const res = await request.get(`${API}/services/active`);
    await expectJsonOrClientError(res);
  });

  test('TC-API-014: pandit filter options endpoint responds', async ({ request }) => {
    const res = await request.get(`${API}/pandits/filters`);
    await expectJsonOrClientError(res);
  });

  test('TC-API-015: pandit locations endpoint responds', async ({ request }) => {
    const res = await request.get(`${API}/pandits/locations`);
    await expectJsonOrClientError(res);
  });

  test('TC-API-016: pandit search endpoint responds to query', async ({ request }) => {
    const res = await request.get(`${API}/pandits`, { params: { search: 'xyz-no-match', page: 1, limit: 6 } });
    await expectJsonOrClientError(res);
  });

  test('TC-API-017: service lookup handles invalid id without server error', async ({ request }) => {
    const res = await request.get(`${API}/services/not-a-valid-id`);
    expect(res.status()).toBeLessThan(500);
  });

  test('TC-API-018: pandit lookup handles invalid id without server error', async ({ request }) => {
    const res = await request.get(`${API}/pandits/not-a-valid-id`);
    expect(res.status()).toBeLessThan(500);
  });

  test('TC-API-019: customer horoscope rejects unauthenticated request', async ({ request }) => {
    const res = await request.get(`${API}/free-astro/horoscope/Aries`);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-API-020: customer kundali rejects unauthenticated request', async ({ request }) => {
    const res = await request.post(`${API}/free-astro/kundali`, { data: {} });
    expect([401, 403]).toContain(res.status());
  });

  test('TC-API-021: compatibility rejects unauthenticated request', async ({ request }) => {
    const res = await request.post(`${API}/astro/compatibility`, { data: {} });
    expect([401, 403]).toContain(res.status());
  });

  test('TC-API-022: payment auth-test rejects unauthenticated request', async ({ request }) => {
    const res = await request.get(`${API}/payment/auth-test`);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-API-023: refund eligibility rejects unauthenticated request', async ({ request }) => {
    const res = await request.get(`${API}/payment/refund-eligibility/not-a-valid-id`);
    expect([400, 401, 403, 404]).toContain(res.status());
  });

  test('TC-API-024: user support tickets rejects unauthenticated request', async ({ request }) => {
    const res = await request.get(`${API}/user/support-tickets`);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-API-025: user payment info rejects unauthenticated request', async ({ request }) => {
    const res = await request.get(`${API}/user/bookings/not-a-valid-id/payment-info`);
    expect([400, 401, 403, 404]).toContain(res.status());
  });

  test('TC-API-026: user review endpoint rejects unauthenticated request', async ({ request }) => {
    const res = await request.post(`${API}/user/review`, { data: {} });
    expect([400, 401, 403, 422]).toContain(res.status());
  });

  test('TC-API-027: can-review endpoint rejects unauthenticated request', async ({ request }) => {
    const res = await request.get(`${API}/user/can-review/not-a-valid-id`);
    expect([400, 401, 403, 404]).toContain(res.status());
  });

  test('TC-API-028: user forgot-password validates request', async ({ request }) => {
    const res = await request.post(`${API}/user/forgot-password`, { data: {} });
    expect(res.status()).toBeLessThan(500);
  });

  test('TC-API-029: user verify-reset-code validates request', async ({ request }) => {
    const res = await request.post(`${API}/user/verify-reset-code`, { data: {} });
    expect(res.status()).toBeLessThan(500);
  });

  test('TC-API-030: user reset-password validates request', async ({ request }) => {
    const res = await request.post(`${API}/user/reset-password`, { data: {} });
    expect(res.status()).toBeLessThan(500);
  });

  test('TC-API-031: pandit dashboard rejects unauthenticated request', async ({ request }) => {
    const res = await request.get(`${API}/pandit/dashboard-stats`);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-API-032: pandit profile rejects unauthenticated request', async ({ request }) => {
    const res = await request.get(`${API}/pandit/profile`);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-API-033: pandit notifications rejects unauthenticated request', async ({ request }) => {
    const res = await request.get(`${API}/pandit/notifications`);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-API-034: pandit availability rejects unauthenticated request', async ({ request }) => {
    const res = await request.patch(`${API}/pandit/availability`, { data: {} });
    expect([400, 401, 403, 422]).toContain(res.status());
  });

  test('TC-API-035: admin test-auth rejects unauthenticated request', async ({ request }) => {
    const res = await request.get(`${API}/admin/test-auth`);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-API-036: admin bookings rejects unauthenticated request', async ({ request }) => {
    const res = await request.get(`${API}/admin/bookings`);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-API-037: admin analytics rejects unauthenticated request', async ({ request }) => {
    const res = await request.get(`${API}/admin/analytics/bookings`);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-API-038: admin support tickets rejects unauthenticated request', async ({ request }) => {
    const res = await request.get(`${API}/admin/support-tickets`);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-API-039: application admin list rejects unauthenticated request', async ({ request }) => {
    const res = await request.get(`${API}/application/applications`);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-API-040: contact admin messages rejects unauthenticated request', async ({ request }) => {
    const res = await request.get(`${API}/contact/admin/messages`);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-API-041: pandit forgot-password validates missing email', async ({ request }) => {
    const res = await request.post(`${API}/pandit/auth/forgot-password`, { data: {} });
    expect(res.status()).toBeLessThan(500);
  });

  test('TC-API-042: pandit login rejects missing credentials', async ({ request }) => {
    const res = await request.post(`${API}/pandit/auth/login`, { data: {} });
    expect([400, 401, 422]).toContain(res.status());
  });

  test('TC-API-043: customer login rejects missing credentials', async ({ request }) => {
    const res = await request.post(`${API}/user/login`, { data: {} });
    expect([400, 401, 422]).toContain(res.status());
  });

  test('TC-API-044: CORS preflight for admin routes responds', async ({ request }) => {
    const res = await request.fetch(`${API}/admin/dashboard`, {
      method: 'OPTIONS',
      headers: {
        Origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET'
      }
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('TC-API-045: security headers are present on health response', async ({ request }) => {
    const res = await request.get(`${API}/health`);
    expect(res.ok()).toBeTruthy();
    const headers = res.headers();
    expect(headers['x-content-type-options']).toBeTruthy();
  });
});
