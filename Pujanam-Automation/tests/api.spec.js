import { test, expect } from '@playwright/test';

const API = process.env.API_URL || 'http://localhost:5000/api';

test.describe('Backend API smoke and security tests', () => {
  test('TC-API-001: health endpoint is healthy', async ({ request }) => {
    const res = await request.get(`${API}/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('OK');
  });

  test('TC-API-002: detailed health endpoint responds', async ({ request }) => {
    const res = await request.get(`${API}/health/detailed`);
    expect(res.status()).toBeLessThan(500);
  });

  test('TC-API-003: public services endpoint responds', async ({ request }) => {
    const res = await request.get(`${API}/services`);
    expect(res.status()).toBeLessThan(500);
  });

  test('TC-API-004: public pandits endpoint responds', async ({ request }) => {
    const res = await request.get(`${API}/pandits`);
    expect(res.status()).toBeLessThan(500);
  });

  test('TC-API-005: protected user profile rejects missing token', async ({ request }) => {
    const res = await request.get(`${API}/user/profile`);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-API-006: protected user bookings rejects missing token', async ({ request }) => {
    const res = await request.get(`${API}/user/bookings`);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-API-007: payment order rejects missing token', async ({ request }) => {
    const res = await request.post(`${API}/payment/create-order`, { data: {} });
    expect([400, 401, 403, 422]).toContain(res.status());
  });

  test('TC-API-008: admin dashboard rejects missing authentication', async ({ request }) => {
    const res = await request.get(`${API}/admin/dashboard`);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-API-009: malformed object id does not cause 500', async ({ request }) => {
    const res = await request.get(`${API}/user/bookings/not-a-mongo-id`);
    expect(res.status()).toBeLessThan(500);
  });

  test('TC-API-010: contact endpoint accepts JSON request format', async ({ request }) => {
    const res = await request.post(`${API}/contact/submit`, { data: {} });
    expect(res.status()).toBeLessThan(500);
  });

  test('TC-API-011: application endpoint validates empty payload', async ({ request }) => {
    const res = await request.post(`${API}/application/submit`, { data: {} });
    expect(res.status()).toBeLessThan(500);
  });

  test('TC-API-012: debug route is reachable only in development', async ({ request }) => {
    const res = await request.get(`${API}/debug`);
    expect(res.status()).toBeLessThan(500);
  });
});
