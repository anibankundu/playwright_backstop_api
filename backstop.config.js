// backstop.config.js
// ---------------------------------------------------------------
// BackstopJS configuration for visual regression testing.
//
// Quick-start guide:
//   1. npm run backstop:reference  — capture baseline screenshots
//   2. (make UI changes)
//   3. npm run backstop:test       — compare against baseline
//   4. npm run backstop:approve    — accept the new look as baseline
//
// Docs: https://github.com/garris/BackstopJS
// ---------------------------------------------------------------

require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'https://playwright.dev';

module.exports = {
  // ── Project ID ─────────────────────────────────────────────
  id: 'playwright_backstop',

  // ── Viewport sizes to test ───────────────────────────────────
  // Add as many viewports as you need to cover your responsive breakpoints.
  viewports: [
    { label: 'phone',   width: 375,  height: 812 },
    { label: 'tablet',  width: 768,  height: 1024 },
    { label: 'desktop', width: 1440, height: 900  },
  ],

  // ── Scenarios (pages / components to capture) ───────────────
  // Each scenario maps to one URL and one set of screenshots.
  // You can add as many scenarios as you have pages to test.
  scenarios: [
    {
      label: 'Home page',
      url: `${BASE_URL}/`,
      // Wait for this selector before taking a screenshot.
      readySelector: '.hero__title',
      // Hide elements that change every run (e.g. ads, timestamps).
      hideSelectors: [],
      // Remove elements from the DOM before screenshotting.
      removeSelectors: [],
      // Extra delay after readySelector is found (ms).
      delay: 500,
      // Pixel tolerance (0–1, where 0 = pixel-perfect).
      misMatchThreshold: 0.1,
      // Require that at least this % of the viewport is the same.
      requireSameDimensions: true,
    },
    {
      label: 'Docs — Introduction',
      url: `${BASE_URL}/docs/intro`,
      readySelector: 'article',
      delay: 300,
      misMatchThreshold: 0.1,
      requireSameDimensions: true,
    },
  ],

  // ── Paths ────────────────────────────────────────────────────
  paths: {
    bitmaps_reference: 'backstop_data/bitmaps_reference',
    bitmaps_test:      'backstop_data/bitmaps_test',
    engine_scripts:    'backstop_data/engine_scripts',
    html_report:       'backstop_data/html_report',
    ci_report:         'backstop_data/ci_report',
  },

  // ── Engine ───────────────────────────────────────────────────
  // 'playwright' engine uses Playwright under the hood — consistent
  // with the rest of the framework.
  engine: 'playwright',
  engineOptions: {
    // Which browser BackstopJS should use.
    browser: 'chromium',
    // Extra Playwright launch options.
    args: ['--no-sandbox'],
  },

  // ── Async concurrency ─────────────────────────────────────────
  // How many browser tabs to run in parallel.
  asyncCaptureLimit: 2,
  asyncCompareLimit: 50,

  // ── Reporting ─────────────────────────────────────────────────
  // 'browser' opens the HTML report automatically after `backstop test`.
  report: ['browser', 'CI'],

  // ── Debug ─────────────────────────────────────────────────────
  debug: false,
  debugWindow: false,
};
