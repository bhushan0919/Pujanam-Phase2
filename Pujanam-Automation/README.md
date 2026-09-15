# Pujanam Playwright Automation

This is a standalone Playwright test suite prepared for the supplied Pujanam React/Vite frontend and Node/Express backend.

## 1. Prerequisites

- Node.js 18+ recommended
- MongoDB/backend environment configured
- Pujanam backend running on `http://localhost:5000`
- Pujanam frontend running on `http://localhost:5173`

From the backend project:

```bash
npm install
npm run dev
```

From the frontend project:

```bash
npm install
npm run dev
```

## 2. Install automation

Inside this folder:

```bash
npm install
npx playwright install
```

Copy `.env.example` to `.env`.

For public/API tests, you can leave test credentials empty. Authenticated role tests will be skipped until credentials are supplied.

Example:

```env
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:5000/api
TEST_USER_EMAIL=test-user@example.com
TEST_USER_PASSWORD=your-test-password
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=your-test-password
TEST_PANDIT_USERNAME=testpandit
TEST_PANDIT_PASSWORD=your-test-password
```

Use **dedicated TEST accounts**. Do not use real customer data or production admin credentials.

## 3. Run tests

All tests:

```bash
npm test
```

Smoke only:

```bash
npm run test:smoke
```

API only:

```bash
npm run test:api
```

Authentication:

```bash
npm run test:auth
```

Visible browser:

```bash
npm run test:headed
```

Interactive Playwright UI:

```bash
npm run test:ui
```

HTML report:

```bash
npm run report
```

## 4. What is automated

- Public route smoke checks
- 404 page
- Mobile overflow smoke check
- Customer/admin/pandit login page checks
- Protected-route redirects
- Invalid customer login
- Form validation
- Backend health checks
- Public API smoke checks
- Missing-token authorization checks
- Malformed ID handling
- Astro protected routes
- Optional authenticated customer/admin/pandit dashboard smoke tests

## 5. Important limitations

The suite deliberately does not perform destructive database operations or real Razorpay payments. Booking creation, OTP/email verification, Cloudinary uploads, and Razorpay should be automated in a dedicated staging environment with test data/mocks.

The 140 manual test cases previously generated remain the master QA checklist. These Playwright tests are the first automation layer and can be expanded module-by-module.
