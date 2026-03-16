// This is a backstop-playwright compatible scenario script
// It must export an async function accepting the Playwright page and scenario object
module.exports = async (page, scenario, vp) => {
  // example: go to login, ensure consistent state, capture screenshot
  await page.goto('https://example.com/login', { waitUntil: 'networkidle' });
  // If login modal or cookie prompt appears, close it here
  await page.waitForTimeout(500);
  // optionally interact with page before capture
};
