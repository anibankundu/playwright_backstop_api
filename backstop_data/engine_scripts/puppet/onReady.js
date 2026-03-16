// backstop_data/engine_scripts/puppet/onReady.js
// ---------------------------------------------------------------
// This script runs AFTER the page is ready but BEFORE BackstopJS
// takes the screenshot.  Use it to:
//   • Interact with the page (scroll, click, hover)
//   • Wait for lazy-loaded content to appear
//   • Hide elements that vary between runs (dates, user avatars)
//
// `page`     — Playwright page object
// `scenario` — The BackstopJS scenario object from backstop.config.js
// `viewport` — The current viewport object
// ---------------------------------------------------------------

module.exports = async (page, scenario, viewport) => {
  // ── Example: scroll to the bottom to trigger lazy loading ────
  // await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  // await page.waitForTimeout(500); // let lazy images load

  // ── Example: hide all <time> elements so timestamps don't cause diffs ──
  // await page.addStyleTag({ content: 'time { visibility: hidden !important; }' });

  // ── Example: hover over a nav item to show a dropdown ────────
  // await page.hover('.navbar__items a:first-child');

  console.log(`[onReady] Capturing scenario: "${scenario.label}" @ ${viewport.label}`);
};
