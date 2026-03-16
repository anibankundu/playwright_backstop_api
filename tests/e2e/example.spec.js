// tests/e2e/example.spec.js
// ---------------------------------------------------------------
// Example end-to-end tests for the Playwright documentation site.
// Replace the URL and selectors with those for YOUR application.
//
// Each test block (`test(...)`) represents a user journey.
// The `test.describe` block groups related tests together.
// ---------------------------------------------------------------

const { test } = require('@playwright/test');
const HomePage = require('../../pages/HomePage');

// ── Home page tests ───────────────────────────────────────────
test.describe('Home page', () => {
  // `beforeEach` runs before every test in this describe block.
  // We open the home page once so each individual test starts there.
  test.beforeEach(async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
  });

  // ── TC-001: Page loads successfully ──────────────────────────
  test('TC-001: page title should contain Playwright', async ({ page }) => {
    const home = new HomePage(page);
    // Assert the <title> tag matches a regex.
    await home.assertTitle(/Playwright/);
  });

  // ── TC-002: Hero banner is visible ───────────────────────────
  test('TC-002: hero heading should be visible', async ({ page }) => {
    const home = new HomePage(page);
    await home.assertHeroVisible();
  });

  // ── TC-003: Hero heading contains expected text ───────────────
  test('TC-003: hero heading should contain "Playwright"', async ({ page }) => {
    const home = new HomePage(page);
    await home.assertHeroText('Playwright');
  });

  // ── TC-004: Navigation to "Get Started" ───────────────────────
  test('TC-004: clicking Get Started navigates to the intro page', async ({ page }) => {
    const home = new HomePage(page);
    await home.clickGetStarted();
    // After clicking the link we should be on the /docs/intro page.
    await home.assertUrlContains('intro');
  });

  // ── TC-005: Screenshot on demand ─────────────────────────────
  test('TC-005: capture a screenshot of the home page', async ({ page }) => {
    const home = new HomePage(page);
    // Screenshots are stored under test-results/ alongside other Playwright artefacts.
    await home.utils.takeFullPageScreenshot('test-results/home-full.png');
  });
});
