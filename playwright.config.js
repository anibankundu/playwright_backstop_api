// Playwright config with friendly defaults and reporting
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  timeout: 60 * 1000,
  testDir: 'tests',
  retries: 1,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15 * 1000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
// playwright.config.js
// ------------------------------------------------------------
// Central configuration for all Playwright tests.
// Adjust BASE_URL, browser, and reporter settings here.
// ------------------------------------------------------------

// Load .env file so tests can read environment variables like BASE_URL and API_URL.
require('dotenv').config();

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // ── Test discovery ──────────────────────────────────────────
  testDir: './tests',

  // Run tests in parallel inside a file (set to false for sequential order).
  fullyParallel: true,

  // Stop the whole run after this many failures (0 = never stop early).
  maxFailures: 0,

  // Retry a failed test once on CI, zero times locally.
  retries: process.env.CI ? 1 : 0,

  // How many parallel workers to use.
  workers: process.env.CI ? 2 : undefined,

  // ── Reporters ───────────────────────────────────────────────
  // 'html' creates a visual report you can open in a browser.
  // 'list' prints a live summary to the terminal.
  // 'json' gives you machine-readable results.
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright-html', open: 'never' }],
    ['json', { outputFile: 'reports/playwright-results.json' }],
  ],

  // ── Shared test settings ─────────────────────────────────────
  use: {
    // Base URL so tests can use relative paths like page.goto('/login').
    baseURL: process.env.BASE_URL || 'https://playwright.dev',

    // Capture a screenshot on test failure so you can see exactly what went wrong.
    screenshot: 'only-on-failure',

    // Record a video on the first retry so you can replay failures.
    video: 'on-first-retry',

    // Capture a full browser trace on the first retry for deep debugging.
    trace: 'on-first-retry',

    // Default navigation / action timeout (30 seconds).
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },

  // ── Output folder ────────────────────────────────────────────
  outputDir: 'test-results',

  // ── Browser projects ─────────────────────────────────────────
  // Each project runs the full test suite in a different browser.
  // Comment out browsers you don't need to speed up local runs.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile emulation examples (uncomment to enable):
    // {
    //   name: 'mobile-chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'mobile-safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],
});
