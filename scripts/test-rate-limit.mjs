import assert from 'node:assert/strict';
import test from 'node:test';

import {
  checkRateLimit,
  createRateLimitMiddleware,
  createRateLimitStore,
} from '../server/rate-limit.mjs';

test('allows requests within the limit and blocks the next request in the same window', () => {
  const store = createRateLimitStore();
  const options = { key: 'submit:127.0.0.1', limit: 2, windowMs: 60_000, now: 1_000 };

  assert.equal(checkRateLimit(store, options).allowed, true);
  assert.equal(checkRateLimit(store, { ...options, now: 2_000 }).allowed, true);

  const blocked = checkRateLimit(store, { ...options, now: 3_000 });

  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.equal(blocked.retryAfterSeconds, 58);
});

test('resets the request count after the window expires', () => {
  const store = createRateLimitStore();
  const options = { key: 'contact:127.0.0.1', limit: 1, windowMs: 10_000, now: 1_000 };

  assert.equal(checkRateLimit(store, options).allowed, true);
  assert.equal(checkRateLimit(store, { ...options, now: 5_000 }).allowed, false);

  const afterReset = checkRateLimit(store, { ...options, now: 11_001 });

  assert.equal(afterReset.allowed, true);
  assert.equal(afterReset.remaining, 0);
});

test('resets the request count exactly at the reset boundary', () => {
  const store = createRateLimitStore();
  const options = { key: 'forum:127.0.0.1', limit: 1, windowMs: 10_000, now: 1_000 };

  assert.equal(checkRateLimit(store, options).allowed, true);

  const atBoundary = checkRateLimit(store, { ...options, now: 11_000 });

  assert.equal(atBoundary.allowed, true);
});

test('tracks different keys independently', () => {
  const store = createRateLimitStore();

  assert.equal(checkRateLimit(store, { key: 'vote:a', limit: 1, windowMs: 60_000, now: 1_000 }).allowed, true);
  assert.equal(checkRateLimit(store, { key: 'vote:a', limit: 1, windowMs: 60_000, now: 2_000 }).allowed, false);
  assert.equal(checkRateLimit(store, { key: 'vote:b', limit: 1, windowMs: 60_000, now: 2_000 }).allowed, true);
});

test('middleware returns a Vietnamese 429 response when a client exceeds the limit', () => {
  const store = createRateLimitStore();
  const middleware = createRateLimitMiddleware({
    store,
    keyPrefix: 'login',
    limit: 1,
    windowMs: 60_000,
    now: () => 1_000,
    getKey: () => '127.0.0.1',
    message: 'Qua nhieu yeu cau. Vui long thu lai sau it phut.',
  });
  const request = {};
  let nextCalls = 0;
  const firstResponse = createFakeResponse();
  const secondResponse = createFakeResponse();

  middleware(request, firstResponse, () => {
    nextCalls += 1;
  });
  middleware(request, secondResponse, () => {
    nextCalls += 1;
  });

  assert.equal(nextCalls, 1);
  assert.equal(secondResponse.statusCode, 429);
  assert.equal(secondResponse.headers['retry-after'], '60');
  assert.deepEqual(secondResponse.body, {
    ok: false,
    errors: ['Qua nhieu yeu cau. Vui long thu lai sau it phut.'],
  });
});

function createFakeResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) {
      this.headers[String(name).toLowerCase()] = String(value);
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}
