import assert from 'node:assert/strict';
import test from 'node:test';

import { buildAdminLoginResponse } from '../server/admin-auth.mjs';

test('accepts configured admin credentials and returns the admin token', () => {
  const result = buildAdminLoginResponse(
    { username: 'admin', password: 'correct-password' },
    { username: 'admin', password: 'correct-password', token: 'admin-token' },
  );

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true, token: 'admin-token', username: 'admin' });
});

test('rejects invalid admin credentials without exposing the token', () => {
  const result = buildAdminLoginResponse(
    { username: 'admin', password: 'wrong-password' },
    { username: 'admin', password: 'correct-password', token: 'admin-token' },
  );

  assert.equal(result.status, 401);
  assert.equal(result.body.ok, false);
  assert.equal('token' in result.body, false);
});

test('reports missing admin login configuration', () => {
  const result = buildAdminLoginResponse(
    { username: 'admin', password: 'correct-password' },
    { username: 'admin', password: '', token: 'admin-token' },
  );

  assert.equal(result.status, 503);
  assert.equal(result.body.ok, false);
});
