// Reusable utility helpers: safe click, safe type, wait and retry
const { expect } = require('@playwright/test');
const logger = require('./logger');

/**
 * Waits for selector, then clicks. Retries basic transient failures.
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 * @param {object} options
 */
async function safeClick(page, selector, options = {}) {
  const retries = options.retries ?? 2;
  const timeout = options.timeout ?? 5000;
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      await page.waitForSelector(selector, { timeout });
      await page.click(selector, { timeout });
      return;
    } catch (err) {
      lastErr = err;
      logger.warn(`safeClick attempt ${i + 1} failed for ${selector}: ${err.message}`);
      // brief pause before retry
      await page.waitForTimeout(300);
    }
  }
  throw lastErr;
}

/**
 * Type into an input after clearing and ensuring it is visible
 */
async function safeType(page, selector, text, options = {}) {
  const timeout = options.timeout ?? 5000;
  await page.waitForSelector(selector, { timeout });
  await page.fill(selector, text);
}

/**
 * Capture screenshot with a friendly name
 */
async function captureScreenshot(page, name) {
  const file = `artifacts/${name.replace(/[^a-z0-9\-_]/gi, '_')}.png`;
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

module.exports = { safeClick, safeType, captureScreenshot };
