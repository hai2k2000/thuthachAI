import assert from 'node:assert/strict';
import test from 'node:test';

import { getRequestIp } from '../server/request-ip.mjs';

function requestWith(headers = {}, fallback = '127.0.0.1') {
  return {
    get(name) {
      return headers[name.toLowerCase()] || '';
    },
    socket: {
      remoteAddress: fallback,
    },
    ip: fallback,
  };
}

test('prefers x-real-ip from the trusted reverse proxy over spoofable x-forwarded-for', () => {
  const request = requestWith({
    'x-real-ip': '203.0.113.20',
    'x-forwarded-for': '1.2.3.4, 203.0.113.20',
  });

  assert.equal(getRequestIp(request), '203.0.113.20');
});

test('uses the last x-forwarded-for hop when x-real-ip is unavailable', () => {
  const request = requestWith({
    'x-forwarded-for': '1.2.3.4, 198.51.100.10',
  });

  assert.equal(getRequestIp(request), '198.51.100.10');
});

test('falls back to the socket remote address when proxy headers are unavailable', () => {
  assert.equal(getRequestIp(requestWith({}, '::1')), '::1');
});
