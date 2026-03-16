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
  ],
});
