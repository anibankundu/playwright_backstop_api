# Playwright + BackstopJS + API Framework

A beginner-friendly yet production-ready test framework that combines:

| Capability | Technology |
|---|---|
| End-to-end browser tests | [Playwright](https://playwright.dev) |
| Visual regression tests | [BackstopJS](https://github.com/garris/BackstopJS) |
| API tests with rate limiting | Playwright request + [Bottleneck](https://github.com/SGrondin/bottleneck) |
| Structured logging | [Winston](https://github.com/winstonjs/winston) |
| HTML / JSON reports | Playwright built-in reporters |

---

## Project structure

```
playwright_backstop_api/
├── pages/                        # Page Object Model classes
│   ├── BasePage.js               # Shared navigation & assertion helpers
│   └── HomePage.js               # Page object for the home page
│
├── utils/                        # Reusable utilities
│   ├── PlaywrightUtils.js        # click, fill, wait, screenshot helpers
│   ├── ApiClient.js              # HTTP client with built-in rate limiting
│   └── logger.js                 # Winston logger (console + file)
│
├── tests/
│   ├── e2e/
│   │   └── example.spec.js       # E2E tests using page objects
│   └── api/
│       └── api.spec.js           # API tests with rate limiting
│
├── backstop_data/
│   ├── engine_scripts/puppet/
│   │   ├── onBefore.js           # Runs before each BackstopJS screenshot
│   │   └── onReady.js            # Runs after page ready, before screenshot
│   └── bitmaps_reference/        # Baseline screenshots (committed to git)
│
├── .env.example                  # Template for environment variables
├── backstop.config.js            # BackstopJS configuration
├── eslint.config.js              # ESLint (flat config)
├── playwright.config.js          # Playwright configuration
└── package.json
```

---

## Prerequisites

- **Node.js 18+** — [download](https://nodejs.org)
- **npm 9+** — included with Node.js

---

## Quick start

```bash
# 1. Clone the repository
git clone https://github.com/anibankundu/playwright_backstop_api.git
cd playwright_backstop_api

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install --with-deps

# 4. Copy and edit the environment file
cp .env.example .env
# Edit .env with your BASE_URL and API_URL

# 5. Run the E2E and API tests
npm test
```

---

## Running tests

### All tests
```bash
npm test
```

### E2E tests only
```bash
npm run test:e2e
```

### API tests only
```bash
npm run test:api
```

### Open the HTML report
```bash
npm run test:report
```

---

## Visual regression with BackstopJS

BackstopJS captures screenshots of your pages and compares them to a stored baseline, failing the test if pixels differ beyond a configurable threshold.

```bash
# Step 1 — capture the baseline (do this once, then commit the images)
npm run backstop:reference

# Step 2 — make your UI changes, then run the comparison
npm run backstop:test

# Step 3 — if the changes are intentional, approve them as the new baseline
npm run backstop:approve
```

The HTML report opens automatically in your browser after `backstop:test`.

### Configuring scenarios

Edit `backstop.config.js` → `scenarios` array.  Each scenario has:

| Field | Description |
|---|---|
| `label` | Human-readable name shown in the report |
| `url` | Full URL or path to capture |
| `readySelector` | Wait for this element before screenshotting |
| `misMatchThreshold` | Allowed pixel difference (0 = exact, 0.1 = 10%) |
| `hideSelectors` | CSS selectors to hide before capturing |

---

## API tests & rate limiting

All API tests use `ApiClient`, which wraps Playwright's request context with a [Bottleneck](https://github.com/SGrondin/bottleneck) rate limiter.

```js
const client = new ApiClient(request, 'https://api.example.com', {
  maxConcurrent: 5,   // at most 5 requests in flight at once
  minTime: 200,       // minimum 200 ms between requests
});

const post = await client.getJson('/posts/1');
```

This prevents your test suite from accidentally flooding the server with 429 Too Many Requests errors when many tests run in parallel.

---

## Writing new tests

### 1. Add a page object

```js
// pages/LoginPage.js
const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.selectors = {
      emailInput:    '#email',
      passwordInput: '#password',
      submitButton:  'button[type="submit"]',
    };
  }

  async open() { await this.goto('/login'); }

  async login(email, password) {
    await this.utils.fillInput(this.selectors.emailInput, email);
    await this.utils.fillInput(this.selectors.passwordInput, password);
    await this.utils.clickElement(this.selectors.submitButton);
  }
}

module.exports = LoginPage;
```

### 2. Write the test

```js
// tests/e2e/login.spec.js
const { test } = require('@playwright/test');
const LoginPage  = require('../../pages/LoginPage');

test('user can log in', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await login.login('user@example.com', 'secret');
  await login.assertUrlContains('/dashboard');
});
```

### 3. Add a BackstopJS scenario (optional)

```js
// In backstop.config.js → scenarios array:
{
  label:              'Login page',
  url:                `${BASE_URL}/login`,
  readySelector:      '#email',
  misMatchThreshold:  0.1,
}
```

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `BASE_URL` | `https://playwright.dev` | Base URL for E2E tests |
| `API_URL` | `https://jsonplaceholder.typicode.com` | Base URL for API tests |
| `LOG_LEVEL` | `info` | Winston log level |
| `CI` | _(unset)_ | Set to any value on CI to enable retries |

---

## Linting

```bash
npm run lint
```

---

## Architecture decisions

| Decision | Reason |
|---|---|
| **Page Object Model** | Keeps selectors in one place — if the HTML changes, only the page object needs updating |
| **Utility class (`PlaywrightUtils`)** | DRY principle — common actions (click, fill, wait) written once and shared |
| **Bottleneck rate limiter** | Prevents 429 errors when many API tests run in parallel |
| **Winston logger** | Structured, levelled logs go to console *and* files so CI and local runs both have useful output |
| **HTML + JSON reporters** | HTML is human-readable for developers; JSON is machine-readable for CI dashboards |
| **`.env` + `dotenv`** | Keeps secrets and environment-specific config out of the source code |
