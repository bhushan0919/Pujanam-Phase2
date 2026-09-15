import { test, expect } from '@playwright/test';

const API = process.env.API_URL || 'http://localhost:5000/api';

async function statusNot5xx(res) {
  expect(res.status()).toBeLessThan(500);
}

async function jsonResponse(res) {
  await statusNot5xx(res);
  expect(res.headers()['content-type'] || '').toContain('application/json');
}

test.describe('Deep API validation and robustness', () => {
  test('TC-DEEP-001: services list responds', async ({ request }) => {
    await jsonResponse(await request.get(`${API}/services`));
  });

  test('TC-DEEP-002: services list supports pagination parameters', async ({ request }) => {
    await statusNot5xx(await request.get(`${API}/services`, { params: { page: 1, limit: 5 } }));
  });

  test('TC-DEEP-003: services list handles large page number', async ({ request }) => {
    await statusNot5xx(await request.get(`${API}/services`, { params: { page: 9999, limit: 5 } }));
  });

  test('TC-DEEP-004: services list handles zero limit without server error', async ({ request }) => {
    await statusNot5xx(await request.get(`${API}/services`, { params: { page: 1, limit: 0 } }));
  });

  test('TC-DEEP-005: services list handles nonnumeric pagination', async ({ request }) => {
    await statusNot5xx(await request.get(`${API}/services`, { params: { page: 'abc', limit: 'xyz' } }));
  });

  test('TC-DEEP-006: pandit list responds', async ({ request }) => {
    await jsonResponse(await request.get(`${API}/pandits`));
  });

  test('TC-DEEP-007: pandit list supports pagination', async ({ request }) => {
    await statusNot5xx(await request.get(`${API}/pandits`, { params: { page: 1, limit: 5 } }));
  });

  test('TC-DEEP-008: pandit list handles empty search', async ({ request }) => {
    await statusNot5xx(await request.get(`${API}/pandits`, { params: { search: '' } }));
  });

  test('TC-DEEP-009: pandit list handles special-character search', async ({ request }) => {
    await statusNot5xx(await request.get(`${API}/pandits`, { params: { search: "'\"<>%$" } }));
  });

  test('TC-DEEP-010: pandit list handles large page number', async ({ request }) => {
    await statusNot5xx(await request.get(`${API}/pandits`, { params: { page: 9999, limit: 5 } }));
  });

  test('TC-DEEP-011: invalid HTTP method on services does not create server error', async ({ request }) => {
    await statusNot5xx(await request.post(`${API}/services/not-a-valid-id`, { data: {} }));
  });

  test('TC-DEEP-012: invalid HTTP method on pandit lookup does not create server error', async ({ request }) => {
    await statusNot5xx(await request.post(`${API}/pandits/not-a-valid-id`, { data: {} }));
  });

  test('TC-DEEP-013: unknown API route returns controlled response', async ({ request }) => {
    const res = await request.get(`${API}/this-route-does-not-exist`);
    expect(res.status()).toBeLessThan(500);
  });

  test('TC-DEEP-014: malformed service id is controlled', async ({ request }) => {
    const res = await request.get(`${API}/services/123`);
    expect(res.status()).toBeLessThan(500);
  });

  test('TC-DEEP-015: malformed pandit id is controlled', async ({ request }) => {
    const res = await request.get(`${API}/pandits/123`);
    expect(res.status()).toBeLessThan(500);
  });

  test('TC-DEEP-016: user profile requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.get(`${API}/user/profile`)).status());
  });

  test('TC-DEEP-017: user bookings requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.get(`${API}/user/bookings`)).status());
  });

  test('TC-DEEP-018: user booking by invalid id requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.get(`${API}/user/bookings/not-valid`)).status());
  });

  test('TC-DEEP-019: user booking verification code requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.get(`${API}/user/bookings/not-valid/verification-code`)).status());
  });

  test('TC-DEEP-020: user profile update requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.put(`${API}/user/profile`, { data: {} })).status());
  });

  test('TC-DEEP-021: user support ticket creation requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.post(`${API}/user/support-ticket`, { data: {} })).status());
  });

  test('TC-DEEP-022: user booking cancellation requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.put(`${API}/user/bookings/not-valid/cancel`, { data: {} })).status());
  });

  test('TC-DEEP-023: user account deletion requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.delete(`${API}/user/delete-account`)).status());
  });

  test('TC-DEEP-024: user booking void requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.delete(`${API}/user/bookings/not-valid/void`)).status());
  });

  test('TC-DEEP-025: public pandit reviews endpoint handles invalid pandit id', async ({ request }) => {
    await statusNot5xx(await request.get(`${API}/user/pandit/not-valid/reviews`));
  });

  test('TC-DEEP-026: admin all-data requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.get(`${API}/admin/all-data`)).status());
  });

  test('TC-DEEP-027: admin pandit creation requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.post(`${API}/admin/pandits`, { data: {} })).status());
  });

  test('TC-DEEP-028: admin service creation requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.post(`${API}/admin/services`, { data: {} })).status());
  });

  test('TC-DEEP-029: admin booking details requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.get(`${API}/admin/bookings/not-valid`)).status());
  });

  test('TC-DEEP-030: admin booking status update requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.patch(`${API}/admin/bookings/not-valid/status`, { data: {} })).status());
  });

  test('TC-DEEP-031: admin pandit toggle requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.patch(`${API}/admin/pandits/not-valid/toggle-availability`)).status());
  });

  test('TC-DEEP-032: admin service toggle requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.patch(`${API}/admin/services/not-valid/toggle-activity`)).status());
  });

  test('TC-DEEP-033: admin recent activity requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.get(`${API}/admin/activity/recent`)).status());
  });

  test('TC-DEEP-034: admin pandit performance requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.get(`${API}/admin/pandits/performance`)).status());
  });

  test('TC-DEEP-035: admin support ticket detail requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.get(`${API}/admin/support-tickets/not-valid`)).status());
  });

  test('TC-DEEP-036: admin contact message detail requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.get(`${API}/contact/admin/messages/not-valid`)).status());
  });

  test('TC-DEEP-037: admin contact status update requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.patch(`${API}/contact/admin/messages/not-valid/status`, { data: {} })).status());
  });

  test('TC-DEEP-038: admin contact reply requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.post(`${API}/contact/admin/messages/not-valid/reply`, { data: {} })).status());
  });

  test('TC-DEEP-039: admin contact delete requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.delete(`${API}/contact/admin/messages/not-valid`)).status());
  });

  test('TC-DEEP-040: application submit validates empty payload', async ({ request }) => {
    await statusNot5xx(await request.post(`${API}/application/submit`, { data: {} }));
  });

  test('TC-DEEP-041: contact submit validates empty payload', async ({ request }) => {
    await statusNot5xx(await request.post(`${API}/contact/submit`, { data: {} }));
  });

  test('TC-DEEP-042: customer OTP endpoint validates missing payload', async ({ request }) => {
    await statusNot5xx(await request.post(`${API}/auth/send-otp`, { data: {} }));
  });

  test('TC-DEEP-043: customer OTP verification validates missing payload', async ({ request }) => {
    await statusNot5xx(await request.post(`${API}/auth/verify-otp`, { data: {} }));
  });

  test('TC-DEEP-044: customer registration validates missing payload', async ({ request }) => {
    await statusNot5xx(await request.post(`${API}/auth/register`, { data: {} }));
  });

  test('TC-DEEP-045: pandit reset-password validates missing payload', async ({ request }) => {
    await statusNot5xx(await request.post(`${API}/pandit/auth/reset-password`, { data: {} }));
  });

  test('TC-DEEP-046: pandit verify-reset-token validates missing payload', async ({ request }) => {
    await statusNot5xx(await request.post(`${API}/pandit/auth/verify-reset-token`, { data: {} }));
  });

  test('TC-DEEP-047: astro consultation birth chart requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.post(`${API}/astro-consultation/fetch-birth-chart`, { data: {} })).status());
  });

  test('TC-DEEP-048: daily horoscope requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.get(`${API}/astro-consultation/daily-horoscope/Aries`)).status());
  });

  test('TC-DEEP-049: free astro request requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.post(`${API}/astro-consultation/free-request`, { data: {} })).status());
  });

  test('TC-DEEP-050: customer consultations requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.get(`${API}/astro-consultation/my-consultations`)).status());
  });

  test('TC-DEEP-051: pandit consultations requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.get(`${API}/astro-consultation/pandit/consultations`)).status());
  });

  test('TC-DEEP-052: payment create-order requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.post(`${API}/payment/create-order`, { data: {} })).status());
  });

  test('TC-DEEP-053: payment verify requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.post(`${API}/payment/verify-payment`, { data: {} })).status());
  });

  test('TC-DEEP-054: payment cancellation requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.post(`${API}/payment/cancel-booking`, { data: {} })).status());
  });

  test('TC-DEEP-055: payment cancelled callback requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.post(`${API}/payment/payment-cancelled`, { data: {} })).status());
  });

  test('TC-DEEP-056: pandit logout requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.post(`${API}/pandit/logout`)).status());
  });

  test('TC-DEEP-057: pandit change password requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.post(`${API}/pandit/change-password`, { data: {} })).status());
  });

  test('TC-DEEP-058: pandit online status requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.get(`${API}/pandit/online-status`)).status());
  });

  test('TC-DEEP-059: pandit activity update requires authentication', async ({ request }) => {
    expect([401, 403]).toContain((await request.post(`${API}/pandit/update-activity`, { data: {} })).status());
  });

  test('TC-DEEP-060: API response includes JSON content type for services', async ({ request }) => {
    const res = await request.get(`${API}/services`);
    await jsonResponse(res);
  });
});
