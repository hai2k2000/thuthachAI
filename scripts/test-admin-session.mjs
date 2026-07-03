import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createAdminSessionToken,
  hasAdminRole,
  verifyAdminSessionToken,
} from '../server/admin-session.mjs';

test('creates and verifies an admin session token with role claims', () => {
  const token = createAdminSessionToken({
    user: {
      id: 'USR-ADMIN',
      username: 'admin',
      role: 'admin',
    },
    secret: 'test-secret',
    now: 1_000,
    ttlMs: 60_000,
  });

  const session = verifyAdminSessionToken(token, {
    secret: 'test-secret',
    now: 2_000,
  });

  assert.equal(session.ok, true);
  assert.equal(session.user.id, 'USR-ADMIN');
  assert.equal(session.user.username, 'admin');
  assert.equal(session.user.role, 'admin');
});

test('rejects tampered admin session tokens', () => {
  const token = createAdminSessionToken({
    user: {
      id: 'USR-JUDGE',
      username: 'judge01',
      role: 'judge',
    },
    secret: 'test-secret',
    now: 1_000,
    ttlMs: 60_000,
  });
  const [payloadPart, signaturePart] = token.split('.');
  const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
  payload.role = 'admin';
  const tamperedToken = `${Buffer.from(JSON.stringify(payload)).toString('base64url')}.${signaturePart}`;

  const session = verifyAdminSessionToken(tamperedToken, {
    secret: 'test-secret',
    now: 2_000,
  });

  assert.equal(session.ok, false);
  assert.equal(session.reason, 'invalid_signature');
});

test('rejects admin session tokens with extra segments', () => {
  const token = createAdminSessionToken({
    user: {
      id: 'USR-ADMIN',
      username: 'admin',
      role: 'admin',
    },
    secret: 'test-secret',
    now: 1_000,
    ttlMs: 60_000,
  });

  const session = verifyAdminSessionToken(`${token}.extra`, {
    secret: 'test-secret',
    now: 2_000,
  });

  assert.equal(session.ok, false);
  assert.equal(session.reason, 'invalid_format');
});

test('rejects expired admin session tokens', () => {
  const token = createAdminSessionToken({
    user: {
      id: 'USR-VIEWER',
      username: 'viewer01',
      role: 'viewer',
    },
    secret: 'test-secret',
    now: 1_000,
    ttlMs: 1_000,
  });

  const session = verifyAdminSessionToken(token, {
    secret: 'test-secret',
    now: 3_000,
  });

  assert.equal(session.ok, false);
  assert.equal(session.reason, 'expired');
});

test('checks admin role permissions explicitly', () => {
  assert.equal(hasAdminRole({ role: 'admin' }, ['admin']), true);
  assert.equal(hasAdminRole({ role: 'judge' }, ['admin']), false);
  assert.equal(hasAdminRole({ role: 'judge' }, ['admin', 'judge']), true);
  assert.equal(hasAdminRole({ role: 'viewer' }, ['admin', 'judge']), false);
});
