# Playwright Framework Example (Beginner-friendly)

Overview
- Lightweight Playwright framework written in JavaScript
- Page Object Model, utilities, error handling, artifact capture
- Rate-limited API client using Bottleneck
- Visual regression integration using Backstop.js with backstop-playwright adapter

Getting started
1. Clone this repo (or copy files into a new folder)
2. Install dependencies:
   npm install

3. Install Playwright browsers:
   npm run prepare

Run tests
- Run all Playwright tests:
  npm test

- Run Playwright tests with headed browser:
  npm run test:headed

- View Playwright HTML report:
  npm run test:report

Artifacts
- Test artifacts (screenshots, videos, traces) are saved according to Playwright config and the `artifacts/` folder created by tests.

Visual regression with Backstop.js
1. Install backstop-js and backstop-playwright (already in devDependencies)
2. Generate reference images:
   npm run backstop:reference

3. Run Backstop tests:
   npm run backstop:test

Note on backstop-playwright:
- We're using backstop-playwright's approach where scenarios call a script that accepts Playwright's page object.
- If you need advanced flows (auth, network mocking) implement them inside the `backstop/scenarios/*.js` script.

Rate limiting for APIs
- The helper `utils/apiClient.js` uses Bottleneck to limit concurrent and per-time requests.
- Usage:
  const apiClient = require('../utils/apiClient');
  const resp = await apiClient.get('https://api.example.com/data');

Error handling and retries
- `utils/utils.js` includes `safeClick` and `safeType` which retry a few times on transient failures.
- Playwright config captures screenshot/trace/video on failures.

Extending the framework
- Add more Page objects into `pages/`
- Add shared fixtures (e.g. login fixtures) using Playwright test `test.extend`
- Swap logger for winston or pino if you need log persistence
- Add CI job to run `npm test` and then `npm run backstop:test`

If you'd like, I can:
- Convert to TypeScript
- Add an Allure or custom reporter and show CI (GitHub Actions) config
- Add more example page objects and end-to-end flows
