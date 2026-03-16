// API client with rate limiting using Bottleneck
const axios = require('axios');
const Bottleneck = require('bottleneck');
const logger = require('./logger');

// Create a Bottleneck limiter: adjust maxConcurrent and minTime for your API SLA
const limiter = new Bottleneck({
  maxConcurrent: 5,  // at most 5 calls in parallel
  minTime: 200       // at least 200ms between calls
});

/**
 * Simple rate-limited GET
 * @param {string} url
 * @param {object} opts
 */
async function get(url, opts = {}) {
  logger.info(`Scheduling GET ${url}`);
  return limiter.schedule(() => axios.get(url, opts));
}

/**
 * Simple rate-limited POST
 */
async function post(url, data, opts = {}) {
  logger.info(`Scheduling POST ${url}`);
  return limiter.schedule(() => axios.post(url, data, opts));
}

// Expose limiter for advanced usage if tests want to change behavior
module.exports = { get, post, limiter };
