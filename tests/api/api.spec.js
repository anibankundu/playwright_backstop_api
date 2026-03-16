// tests/api/api.spec.js
// ---------------------------------------------------------------
// Example API tests using our custom ApiClient with rate limiting.
//
// We test against https://jsonplaceholder.typicode.com — a free
// fake REST API that is perfect for demonstrations.  Replace the
// base URL and endpoints with those of your real API.
//
// Key concepts shown here:
//   • Creating an ApiClient with rate limiting options
//   • GET, POST, PUT, PATCH and DELETE requests
//   • Asserting status codes and response bodies
//   • Verifying that 404 / error responses are handled correctly
// ---------------------------------------------------------------

const { test, expect, request } = require('@playwright/test');
const ApiClient = require('../../utils/ApiClient');

// Base URL for all tests in this file.
// Override with API_URL env variable when running against a real API.
const API_BASE_URL =
  process.env.API_URL || 'https://jsonplaceholder.typicode.com';

// ── Shared client setup ───────────────────────────────────────
// We create ONE APIRequestContext (and wrap it in ApiClient) for the
// whole test.describe block, then dispose it in afterAll.
// Using `request.newContext()` is the correct pattern when you need
// to share a request context across tests.

test.describe('JSONPlaceholder API', () => {
  let client;
  let apiContext;

  test.beforeAll(async () => {
    // Create a standalone APIRequestContext — not tied to any page.
    // This context can safely be reused across all tests in the block.
    apiContext = await request.newContext({
      baseURL: API_BASE_URL,
    });

    // Wrap it in our ApiClient for rate limiting and convenience methods.
    // Rate limiter settings:
    //   maxConcurrent: 3  → at most 3 requests at the same time
    //   minTime:      300  → wait at least 300 ms between requests
    client = new ApiClient(apiContext, API_BASE_URL, {
      maxConcurrent: 3,
      minTime: 300,
    });
  });

  test.afterAll(async () => {
    // Cleanly drain the rate-limiter queue when all tests finish.
    await client.disconnect();
    // Dispose the Playwright request context to free up resources.
    await apiContext.dispose();
  });

  // ── GET /posts ────────────────────────────────────────────────
  test('TC-API-001: GET /posts returns 200 and a non-empty array', async () => {
    const response = await client.get('/posts');

    expect(response.status()).toBe(200);

    const posts = await response.json();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
  });

  // ── GET /posts/:id ────────────────────────────────────────────
  test('TC-API-002: GET /posts/1 returns the correct post', async () => {
    const post = await client.getJson('/posts/1');

    // The fake API always returns id=1 for this endpoint.
    expect(post.id).toBe(1);
    expect(typeof post.title).toBe('string');
    expect(post.title.length).toBeGreaterThan(0);
  });

  // ── POST /posts ───────────────────────────────────────────────
  test('TC-API-003: POST /posts creates a new post', async () => {
    const newPost = {
      title: 'Hello Playwright',
      body: 'This post was created by the API test suite.',
      userId: 1,
    };

    const created = await client.postJson('/posts', newPost);

    // JSONPlaceholder returns id=101 for any new post.
    expect(created.id).toBeDefined();
    expect(created.title).toBe(newPost.title);
    expect(created.body).toBe(newPost.body);
  });

  // ── PUT /posts/:id ────────────────────────────────────────────
  test('TC-API-004: PUT /posts/1 replaces the post', async () => {
    const updatedPost = {
      id: 1,
      title: 'Updated title',
      body: 'Updated body',
      userId: 1,
    };

    const response = await client.put('/posts/1', updatedPost);

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.title).toBe(updatedPost.title);
  });

  // ── PATCH /posts/:id ─────────────────────────────────────────
  test('TC-API-005: PATCH /posts/1 updates a single field', async () => {
    const response = await client.patch('/posts/1', { title: 'Patched title' });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.title).toBe('Patched title');
  });

  // ── DELETE /posts/:id ─────────────────────────────────────────
  test('TC-API-006: DELETE /posts/1 returns 200', async () => {
    const response = await client.delete('/posts/1');
    expect(response.status()).toBe(200);
  });

  // ── Error handling ────────────────────────────────────────────
  test('TC-API-007: GET /posts/99999 returns 404', async () => {
    const response = await client.get('/posts/99999');
    expect(response.status()).toBe(404);
  });

  // ── Rate limiting verification ────────────────────────────────
  test('TC-API-008: rate limiter handles 10 concurrent requests without error', async () => {
    // Fire 10 requests almost simultaneously.
    // The Bottleneck limiter will queue excess requests so the server
    // (and our tests) are never overwhelmed.
    const requests = Array.from({ length: 10 }, (_, i) =>
      client.get(`/posts/${i + 1}`)
    );

    const responses = await Promise.all(requests);

    // Every request should succeed.
    for (const response of responses) {
      expect(response.status()).toBe(200);
    }
  });

  // ── Query params ──────────────────────────────────────────────
  test('TC-API-009: GET /posts with query params filters results', async () => {
    const response = await client.get('/posts', {
      params: { userId: '1' },
    });

    expect(response.status()).toBe(200);
    const posts = await response.json();
    // All returned posts should belong to user 1.
    for (const post of posts) {
      expect(post.userId).toBe(1);
    }
  });
});
