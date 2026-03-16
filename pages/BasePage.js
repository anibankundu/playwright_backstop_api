// pages/BasePage.js
// ---------------------------------------------------------------
// Every page object should extend this class.
// It holds the Playwright `page` instance and provides common
// navigation and assertion helpers that every page shares.
// ---------------------------------------------------------------

const { expect } = require('@playwright/test');
const PlaywrightUtils = require('../utils/PlaywrightUtils');
const logger = require('../utils/logger');

class BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright Page instance.
   */
  constructor(page) {
    this.page = page;
    // Expose the utility class on every page so subclasses can call
    // this.utils.clickElement(), this.utils.fillInput(), etc.
    this.utils = new PlaywrightUtils(page);
  }

  // ── Navigation ───────────────────────────────────────────────

  /**
   * Navigate to a URL relative to the baseURL set in playwright.config.js.
   * @param {string} [path='/'] - Relative path to navigate to.
   */
  async goto(path = '/') {
    await this.utils.navigateTo(path);
  }

  /**
   * Reload the current page.
   */
  async reload() {
    logger.info('Reloading page');
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  /**
   * Go back to the previous page in browser history.
   */
  async goBack() {
    logger.info('Navigating back');
    await this.page.goBack();
  }

  // ── Shared assertions ─────────────────────────────────────────

  /**
   * Assert the page has the expected <title>.
   * @param {string} title - Expected title string.
   */
  async assertTitle(title) {
    await expect(this.page).toHaveTitle(title);
  }

  /**
   * Assert the current URL contains a given substring.
   * @param {string} urlPart - Substring or regex pattern.
   */
  async assertUrlContains(urlPart) {
    await expect(this.page).toHaveURL(new RegExp(urlPart));
  }

  // ── Shared getters ────────────────────────────────────────────

  /**
   * Return the current page URL.
   * @returns {string}
   */
  getUrl() {
    return this.page.url();
  }

  /**
   * Return the current page title.
   * @returns {Promise<string>}
   */
  async getTitle() {
    return this.page.title();
  }
}

module.exports = BasePage;
