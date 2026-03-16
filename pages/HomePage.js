// pages/HomePage.js
// ---------------------------------------------------------------
// Page object for the Playwright documentation home page.
// Replace the selectors and methods here with those matching
// YOUR application's home page.
//
// Rule of thumb: one method per user action on the page.
// ---------------------------------------------------------------

const BasePage = require('./BasePage');

class HomePage extends BasePage {
  constructor(page) {
    super(page);

    // ── Selectors ──────────────────────────────────────────────
    // Define all CSS selectors / Playwright locators here.
    // This means if the HTML changes you only update this file.
    this.selectors = {
      searchInput: '[placeholder="Search"]',
      searchButton: 'button[type="submit"]',
      heroHeading: '.hero__title',
      getStartedLink: 'a[href*="intro"]',
      navItems: '.navbar__items a',
      themeToggle: '.navbar__items--right button[title*="theme"]',
    };
  }

  // ── Page actions ──────────────────────────────────────────────

  /**
   * Open the home page.
   */
  async open() {
    await this.goto('/');
  }

  /**
   * Click the "Get Started" link on the hero banner.
   */
  async clickGetStarted() {
    await this.utils.clickElement(this.selectors.getStartedLink);
  }

  /**
   * Type a query into the search bar and submit it.
   * @param {string} query - Search term.
   */
  async search(query) {
    await this.utils.fillInput(this.selectors.searchInput, query);
    await this.page.keyboard.press('Enter');
  }

  // ── Page assertions ───────────────────────────────────────────

  /**
   * Assert that the hero heading is visible on the page.
   */
  async assertHeroVisible() {
    await this.utils.assertElementVisible(this.selectors.heroHeading);
  }

  /**
   * Assert that the hero heading contains the expected text.
   * @param {string} text - Text to look for in the heading.
   */
  async assertHeroText(text) {
    await this.utils.assertElementText(this.selectors.heroHeading, text);
  }

  // ── Page getters ──────────────────────────────────────────────

  /**
   * Return the text content of the hero heading.
   * @returns {Promise<string>}
   */
  async getHeroText() {
    return this.utils.getElementText(this.selectors.heroHeading);
  }

  /**
   * Return an array of navigation link texts.
   * @returns {Promise<string[]>}
   */
  async getNavItemLabels() {
    const locator = this.page.locator(this.selectors.navItems);
    return locator.allInnerTexts();
  }
}

module.exports = HomePage;
