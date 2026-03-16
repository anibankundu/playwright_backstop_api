// utils/ApiClient.js
// ---------------------------------------------------------------
// A reusable API client built on top of Playwright's `request`
// context, with built-in rate limiting powered by Bottleneck.
//
// Why rate limiting?
//   When running many API tests in parallel, you can accidentally
//   flood the server with requests and get 429 (Too Many Requests)
//   errors.  Bottleneck queues extra requests and releases them at
//   a controlled rate.
//
// Usage example:
//   const client = new ApiClient(request, 'https://api.example.com');
//   const data   = await client.get('/users');
// ---------------------------------------------------------------

const Bottleneck = require('bottleneck');
const logger = require('./logger');

class ApiClient {
  /**
   * @param {import('@playwright/test').APIRequestContext} requestContext
   *   The Playwright request fixture (from `test` or `request.newContext()`).
   * @param {string} baseUrl
   *   Root URL for the API, e.g. 'https://api.example.com'.
   * @param {Object} [options]                - Optional configuration.
   * @param {number} [options.maxConcurrent=5] - How many requests may run at once.
   * @param {number} [options.minTime=200]     - Minimum milliseconds between requests.
   * @param {Object} [options.defaultHeaders]  - Headers sent with every request.
   */
  constructor(requestContext, baseUrl, options = {}) {
    this.request = requestContext;
    this.baseUrl = baseUrl.replace(/\/$/, ''); // strip trailing slash

    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.defaultHeaders,
    };

    // ── Bottleneck rate limiter ────────────────────────────────
    // maxConcurrent: at most N requests in flight at the same time.
    // minTime:       wait at least N ms before starting the next request.
    this.limiter = new Bottleneck({
      maxConcurrent: options.maxConcurrent ?? 5,
      minTime: options.minTime ?? 200,
    });

    // Log whenever Bottleneck queues or drops a request.
    this.limiter.on('queued', () => logger.debug('API request queued by rate limiter'));
    this.limiter.on('failed', (error, jobInfo) => {
      logger.error(`Rate-limiter job failed (attempt ${jobInfo.retryCount}): ${error.message}`);
      // Returning a number tells Bottleneck to retry after that many milliseconds.
      if (jobInfo.retryCount < 2) return 500;
    });
  }

  // ── Private helpers ──────────────────────────────────────────

  /**
   * Build the full URL by joining the base URL with the path.
   * @param {string} path - Relative path, e.g. '/users/1'.
   * @returns {string} Absolute URL.
   */
  _url(path) {
    return `${this.baseUrl}${path}`;
  }

  /**
   * Merge caller-supplied headers with the default headers.
   * @param {Object} [extraHeaders={}]
   * @returns {Object}
   */
  _headers(extraHeaders = {}) {
    return { ...this.defaultHeaders, ...extraHeaders };
  }

  /**
   * Execute a raw Playwright API call inside the rate limiter.
   * All public methods (get, post, put, patch, delete) delegate here.
   *
   * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} method - HTTP method.
   * @param {string} path          - Relative URL path.
   * @param {Object} [options={}]  - Playwright fetch options (data, params, headers…).
   * @returns {Promise<import('@playwright/test').APIResponse>}
   */
  async _send(method, path, options = {}) {
    const url = this._url(path);
    const mergedOptions = {
      headers: this._headers(options.headers),
      ...options,
    };

    logger.info(`${method} ${url}`);

    // Schedule the network call through the rate limiter.
    const response = await this.limiter.schedule(() =>
      this.request[method.toLowerCase()](url, mergedOptions)
    );

    logger.info(`${method} ${url} → ${response.status()}`);
    return response;
  }

  // ── Public HTTP methods ──────────────────────────────────────

  /**
   * Send a GET request.
   * @param {string} path          - e.g. '/users'
   * @param {Object} [options={}]  - Optional params, headers, etc.
   * @returns {Promise<import('@playwright/test').APIResponse>}
   */
  async get(path, options = {}) {
    return this._send('GET', path, options);
  }

  /**
   * Send a POST request with a JSON body.
   * @param {string} path          - e.g. '/users'
   * @param {Object} [body={}]     - Request body (will be JSON-encoded).
   * @param {Object} [options={}]  - Optional headers, params, etc.
   */
  async post(path, body = {}, options = {}) {
    return this._send('POST', path, { data: body, ...options });
  }

  /**
   * Send a PUT request with a JSON body.
   * @param {string} path          - e.g. '/users/1'
   * @param {Object} [body={}]     - Request body (will be JSON-encoded).
   * @param {Object} [options={}]  - Optional headers, params, etc.
   */
  async put(path, body = {}, options = {}) {
    return this._send('PUT', path, { data: body, ...options });
  }

  /**
   * Send a PATCH request with a JSON body.
   * @param {string} path          - e.g. '/users/1'
   * @param {Object} [body={}]     - Partial update body (will be JSON-encoded).
   * @param {Object} [options={}]  - Optional headers, params, etc.
   */
  async patch(path, body = {}, options = {}) {
    return this._send('PATCH', path, { data: body, ...options });
  }

  /**
   * Send a DELETE request.
   * @param {string} path          - e.g. '/users/1'
   * @param {Object} [options={}]  - Optional headers, params, etc.
   */
  async delete(path, options = {}) {
    return this._send('DELETE', path, options);
  }

  // ── Convenience helpers ──────────────────────────────────────

  /**
   * Send a GET request and automatically parse the JSON response body.
   * Throws an error if the status code is not in the 2xx range.
   *
   * @param {string} path         - Relative URL path.
   * @param {Object} [options={}] - Optional params, headers, etc.
   * @returns {Promise<any>} Parsed JSON object.
   */
  async getJson(path, options = {}) {
    const response = await this.get(path, options);
    if (!response.ok()) {
      throw new Error(`GET ${path} failed with status ${response.status()}`);
    }
    return response.json();
  }

  /**
   * Send a POST request and automatically parse the JSON response body.
   * Throws an error if the status code is not in the 2xx range.
   *
   * @param {string} path         - Relative URL path.
   * @param {Object} [body={}]    - Request body.
   * @param {Object} [options={}] - Optional headers, params, etc.
   * @returns {Promise<any>} Parsed JSON object.
   */
  async postJson(path, body = {}, options = {}) {
    const response = await this.post(path, body, options);
    if (!response.ok()) {
      throw new Error(`POST ${path} failed with status ${response.status()}`);
    }
    return response.json();
  }

  /**
   * Drain the rate-limiter queue and stop accepting new jobs.
   * Call this in afterAll() hooks if you want a clean teardown.
   */
  async disconnect() {
    await this.limiter.stop({ dropWaitingJobs: false });
    logger.info('ApiClient rate limiter stopped');
  }
}

module.exports = ApiClient;
