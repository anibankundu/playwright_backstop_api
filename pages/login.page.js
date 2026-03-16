// Example page object showing typical pattern
const BasePage = require('./base.page');
const { safeClick, safeType } = require('../utils/utils');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.selectors = {
      username: '#username',
      password: '#password',
      submit: '#login-button',
      errorMessage: '.error'
    };
  }

  async goto() {
    await super.goto('https://example.com/login');
  }

  async login(username, password) {
    await safeType(this.page, this.selectors.username, username);
    await safeType(this.page, this.selectors.password, password);
    await safeClick(this.page, this.selectors.submit);
  }

  async getError() {
    const el = await this.page.$(this.selectors.errorMessage);
    return el ? (await el.textContent()).trim() : null;
  }
}

module.exports = LoginPage;
