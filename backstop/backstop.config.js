// Backstop config using backstop-playwright adapter
// NOTE: Install backstop-js and backstop-playwright in your project:
//   npm i -D backstop-js backstop-playwright
module.exports = {
  id: 'project-backstop',
  viewports: [{ label: 'desktop', width: 1280, height: 720 }],
  scenarios: [
    {
      label: 'Login page visual',
      // We use backstop-playwright: specify a custom script for Playwright actions
      // The adapter will call this script which should export an async function that receives page and scenario
      // See backstop/scenarios/login.visual.js file in this repo
      playwrightScenario: 'backstop/scenarios/login.visual.js',
      selectors: ['document'],
      misMatchThreshold: 0.1,
    }
  ],
  paths: {
    bitmaps_reference: 'backstop_data/bitmaps_reference',
    bitmaps_test: 'backstop_data/bitmaps_test',
    html_report: 'backstop_data/html_report',
    ci_report: 'backstop_data/ci_report'
  },
  engine: 'playwright',
  engineFlags: [],
  asyncCaptureLimit: 5,
  asyncCompareLimit: 5,
  debug: false,
  debugWindow: false
};
