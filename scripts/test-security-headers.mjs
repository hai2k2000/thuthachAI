import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { applySecurityHeaders } from '../server/security-headers.mjs';

const root = process.cwd();
const serverIndex = fs.readFileSync(path.join(root, 'server/index.mjs'), 'utf8');

function createResponse() {
  const headers = new Map();
  return {
    setHeader(name, value) {
      headers.set(name.toLowerCase(), value);
    },
    getHeader(name) {
      return headers.get(name.toLowerCase());
    },
  };
}

test('applies baseline security headers to API responses', () => {
  const response = createResponse();

  applySecurityHeaders({}, response, () => {});

  assert.equal(response.getHeader('x-content-type-options'), 'nosniff');
  assert.equal(response.getHeader('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(response.getHeader('x-frame-options'), 'DENY');
  assert.equal(response.getHeader('permissions-policy'), 'camera=(), microphone=(), geolocation=()');
  assert.equal(response.getHeader('cache-control'), 'no-store');
});

test('does not overwrite an explicit cache-control set by a route', () => {
  const response = createResponse();
  response.setHeader('cache-control', 'public, max-age=86400');

  applySecurityHeaders({}, response, () => {});

  assert.equal(response.getHeader('cache-control'), 'public, max-age=86400');
});

test('registers the security headers middleware before API routes', () => {
  assert.ok(serverIndex.includes("import { applySecurityHeaders } from './security-headers.mjs';"));
  assert.ok(serverIndex.includes('app.use(applySecurityHeaders);'));
  assert.ok(serverIndex.indexOf('app.use(applySecurityHeaders);') < serverIndex.indexOf("app.get('/api/submissions/health'"));
});
