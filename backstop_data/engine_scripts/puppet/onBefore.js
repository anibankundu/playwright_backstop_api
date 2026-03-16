// backstop_data/engine_scripts/puppet/onBefore.js
// ---------------------------------------------------------------
// This script runs BEFORE BackstopJS captures each screenshot.
// Use it to:
//   • Set cookies or localStorage for authentication
//   • Dismiss cookie consent banners
//   • Inject CSS to hide dynamic / animated elements
//
// `page`     — Playwright page object
// `scenario` — The BackstopJS scenario object from backstop.config.js
// `viewport` — The current viewport object
// ---------------------------------------------------------------

module.exports = async (page, scenario, viewport) => {
  // ── Example: set a cookie for authenticated pages ────────────
  // Uncomment and adapt if your app requires a session cookie.
  //
  // await page.context().addCookies([
  //   {
  //     name:  'session_token',
  //     value: process.env.SESSION_TOKEN || 'placeholder',
  //     domain: new URL(scenario.url).hostname,
  //     path:   '/',
  //   },
  // ]);

  // ── Example: inject CSS to freeze animations ─────────────────
  // Animated elements (spinners, carousels) cause flaky screenshots.
  // This injects a <style> tag that disables all CSS transitions.
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay:    0s !important;
        transition-duration: 0s !important;
        transition-delay:    0s !important;
      }
    `,
  });

  // ── Example: dismiss a cookie consent banner ─────────────────
  // Uncomment if your site shows a consent banner on first load.
  //
  // try {
  //   await page.click('#cookie-accept-btn', { timeout: 3000 });
  // } catch {
  //   // Banner not present — safe to ignore.
  // }

  console.log(`[onBefore] Ready for scenario: "${scenario.label}" @ ${viewport.label}`);
};
