// BasePage: common helpers all page objects inherit from
class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async goto(url, options = {}) {
    await this.page.goto(url, options);
  }

  async title() {
    return this.page.title();
  }

  /**
   * Waits for network idle to reduce flakiness
   */
  async waitForNetworkIdle(timeout = 5000) {
    await this.page.waitForLoadState('networkidle', { timeout });
  }
}

module.exports = BasePage;
