// utils/PlaywrightUtils.js
// ---------------------------------------------------------------
// A collection of reusable helper functions that wrap common
// Playwright actions with built-in error handling and logging.
//
// Usage example:
//   const utils = new PlaywrightUtils(page);
//   await utils.clickElement('#submit-btn');
// ---------------------------------------------------------------

const { expect } = require('@playwright/test');
const logger = require('./logger');

class PlaywrightUtils {
  /**
   * @param {import('@playwright/test').Page} page - Playwright Page instance
   */
  constructor(page) {
    this.page = page;
  }

  // ── Navigation helpers ──────────────────────────────────────

  /**
   * Navigate to a URL and wait until the page is fully loaded.
   * @param {string} url - Full URL or relative path (uses baseURL from config).
   */
  async navigateTo(url) {
    logger.info(`Navigating to: ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    logger.info(`Page title: ${await this.page.title()}`);
  }

  // ── Element interaction helpers ─────────────────────────────

  /**
   * Click an element identified by its CSS selector or locator string.
   * Waits for the element to be visible before clicking.
   * @param {string} selector - CSS selector or Playwright locator.
   */
  async clickElement(selector) {
    logger.info(`Clicking element: ${selector}`);
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible' });
    await element.click();
  }

  /**
   * Type text into an input field, clearing it first.
   * @param {string} selector - CSS selector or Playwright locator.
   * @param {string} text     - Text to type.
   */
  async fillInput(selector, text) {
    logger.info(`Filling input "${selector}" with value`);
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible' });
    await element.clear();
    await element.fill(text);
  }

  /**
   * Select an option from a <select> element by its visible label.
   * @param {string} selector - CSS selector pointing to the <select>.
   * @param {string} label    - The visible option text to select.
   */
  async selectDropdownByLabel(selector, label) {
    logger.info(`Selecting option "${label}" in dropdown "${selector}"`);
    await this.page.locator(selector).selectOption({ label });
  }

  /**
   * Hover over an element (useful for tooltips or hover menus).
   * @param {string} selector - CSS selector or Playwright locator.
   */
  async hoverElement(selector) {
    logger.info(`Hovering over element: ${selector}`);
    await this.page.locator(selector).hover();
  }

  // ── Wait helpers ────────────────────────────────────────────

  /**
   * Wait until an element is visible on the page.
   * @param {string} selector        - CSS selector or Playwright locator.
   * @param {number} [timeout=10000] - Maximum wait time in milliseconds.
   */
  async waitForElement(selector, timeout = 10_000) {
    logger.info(`Waiting for element: ${selector}`);
    await this.page.locator(selector).waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for a specific text to appear anywhere on the page.
   * @param {string} text            - Text to search for.
   * @param {number} [timeout=10000] - Maximum wait time in milliseconds.
   */
  async waitForText(text, timeout = 10_000) {
    logger.info(`Waiting for text: "${text}"`);
    await this.page.waitForSelector(`text=${text}`, { timeout });
  }

  /**
   * Wait for the network to become idle (no outstanding requests).
   * Useful after triggering actions that fire multiple API calls.
   * @param {number} [timeout=15000] - Maximum wait time in milliseconds.
   */
  async waitForNetworkIdle(timeout = 15_000) {
    logger.info('Waiting for network to become idle');
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  // ── Screenshot helpers ──────────────────────────────────────

  /**
   * Take a full-page screenshot and save it to the given file path.
   * @param {string} filePath - Where to save the screenshot (e.g. 'reports/home.png').
   */
  async takeFullPageScreenshot(filePath) {
    logger.info(`Taking full-page screenshot: ${filePath}`);
    await this.page.screenshot({ path: filePath, fullPage: true });
  }

  /**
   * Take a screenshot of a specific element only.
   * @param {string} selector - CSS selector identifying the element.
   * @param {string} filePath - Where to save the screenshot.
   */
  async takeElementScreenshot(selector, filePath) {
    logger.info(`Taking element screenshot for "${selector}": ${filePath}`);
    await this.page.locator(selector).screenshot({ path: filePath });
  }

  // ── Assertion helpers ───────────────────────────────────────

  /**
   * Assert that the current page URL contains a given substring.
   * @param {string} urlFragment - Expected substring.
   */
  async assertUrlContains(urlFragment) {
    logger.info(`Asserting URL contains: "${urlFragment}"`);
    await expect(this.page).toHaveURL(new RegExp(urlFragment));
  }

  /**
   * Assert that the page title matches the expected value exactly.
   * @param {string} expectedTitle - Expected page title.
   */
  async assertPageTitle(expectedTitle) {
    logger.info(`Asserting page title: "${expectedTitle}"`);
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  /**
   * Assert that an element is visible on the page.
   * @param {string} selector - CSS selector or Playwright locator.
   */
  async assertElementVisible(selector) {
    logger.info(`Asserting element visible: ${selector}`);
    await expect(this.page.locator(selector)).toBeVisible();
  }

  /**
   * Assert that an element contains the expected text.
   * @param {string} selector     - CSS selector or Playwright locator.
   * @param {string} expectedText - Text that should appear inside the element.
   */
  async assertElementText(selector, expectedText) {
    logger.info(`Asserting text "${expectedText}" in element "${selector}"`);
    await expect(this.page.locator(selector)).toContainText(expectedText);
  }

  // ── Data extraction helpers ─────────────────────────────────

  /**
   * Get the inner text content of an element.
   * @param {string} selector - CSS selector or Playwright locator.
   * @returns {Promise<string>} The visible text of the element.
   */
  async getElementText(selector) {
    const text = await this.page.locator(selector).innerText();
    logger.info(`Got text from "${selector}": "${text}"`);
    return text;
  }

  /**
   * Read every row of an HTML <table> and return its data as an array of objects.
   * The first row is treated as the header; subsequent rows become objects
   * whose keys come from the header cells.
   *
   * @param {string} tableSelector - CSS selector pointing to the <table>.
   * @returns {Promise<Array<Object>>} Table data as an array of row objects.
   *
   * Example output for a two-column table:
   *   [ { Name: 'Alice', Age: '30' }, { Name: 'Bob', Age: '25' } ]
   */
  async getTableData(tableSelector) {
    logger.info(`Extracting table data from: ${tableSelector}`);
    return this.page.evaluate((sel) => {
      /* global document */
      const table = document.querySelector(sel);
      if (!table) return [];

      const rows = Array.from(table.querySelectorAll('tr'));
      const headers = Array.from(rows[0].querySelectorAll('th, td')).map(
        (cell) => cell.innerText.trim()
      );

      return rows.slice(1).map((row) => {
        const cells = Array.from(row.querySelectorAll('td')).map(
          (cell) => cell.innerText.trim()
        );
        return headers.reduce((obj, header, index) => {
          obj[header] = cells[index] ?? '';
          return obj;
        }, {});
      });
    }, tableSelector);
  }

  // ── Scroll helpers ──────────────────────────────────────────

  /**
   * Scroll an element into view.
   * @param {string} selector - CSS selector or Playwright locator.
   */
  async scrollIntoView(selector) {
    logger.info(`Scrolling element into view: ${selector}`);
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Scroll to the very bottom of the page.
   */
  async scrollToBottom() {
    logger.info('Scrolling to bottom of page');
    await this.page.evaluate(() => {
      /* global window */
      window.scrollTo(0, window.document.body.scrollHeight);
    });
  }

  // ── Cookie / Storage helpers ────────────────────────────────

  /**
   * Get the value of a browser cookie by name.
   * @param {string} name - Cookie name.
   * @returns {Promise<string|undefined>} Cookie value, or undefined if not found.
   */
  async getCookieValue(name) {
    const cookies = await this.page.context().cookies();
    const cookie = cookies.find((c) => c.name === name);
    return cookie?.value;
  }

  /**
   * Clear all cookies for the current browser context.
   */
  async clearCookies() {
    logger.info('Clearing all cookies');
    await this.page.context().clearCookies();
  }
}

module.exports = PlaywrightUtils;
