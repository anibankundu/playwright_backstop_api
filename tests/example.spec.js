// Simple end-to-end test showing usage of Page Object, utils, and API client
const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/login.page');
const { captureScreenshot } = require('../utils/utils');
const apiClient = require('../utils/apiClient');
const logger = require('../utils/logger');
const fs = require('fs');

// Ensure artifacts dir exists
const artifactsDir = 'artifacts';
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

test.describe('Example flow', () => {
  test('should show error on bad credentials and call rate-limited API', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    // Intentionally invalid login to show error capture
    await login.login('baduser', 'badpass');

    // wait a bit for error to appear
    await page.waitForTimeout(500);
    const err = await login.getError();
    // capture screenshot for reporting / debugging
    const shot = await captureScreenshot(page, 'login-invalid');
    logger.info('Captured screenshot:', shot);

    expect(err).not.toBeNull();

    // Example of calling an external API via rate limited client
    // NOTE: Replace with your real API URL or a mocked endpoint
    const apiResp = await apiClient.get('https://httpbin.org/get');
    expect(apiResp.status).toBe(200);
    logger.info('API call succeeded');
  });
});
