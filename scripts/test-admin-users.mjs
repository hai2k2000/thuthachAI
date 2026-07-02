import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createPasswordHash,
  normalizeAdminUserInput,
  toPublicAdminUser,
  verifyPassword,
} from '../server/admin-users.mjs';

test('hashes and verifies admin user passwords', () => {
  const hash = createPasswordHash('thoidai123', 'fixed-salt');

  assert.equal(verifyPassword('thoidai123', hash), true);
  assert.equal(verifyPassword('wrong-password', hash), false);
});

test('normalizes valid admin user input', () => {
  const result = normalizeAdminUserInput({
    username: ' Judge.One ',
    displayName: 'Ban giam khao',
    role: 'judge',
    status: 'active',
    password: 'secret123',
  }, { requirePassword: true });

  assert.equal(result.ok, true);
  assert.equal(result.user.username, 'judge.one');
  assert.equal(result.user.role, 'judge');
});

test('rejects short usernames and missing passwords when creating admin users', () => {
  const result = normalizeAdminUserInput({
    username: 'ad',
    displayName: '',
    role: 'owner',
    password: '123',
  }, { requirePassword: true });

  assert.equal(result.ok, false);
  assert.ok(result.errors.length >= 2);
});

test('does not expose password hashes in public admin user output', () => {
  const user = toPublicAdminUser({
    id: 'USR-1',
    username: 'admin',
    display_name: 'Administrator',
    role: 'admin',
    status: 'active',
    password_hash: 'secret',
    created_at: '2026-07-02T00:00:00.000Z',
  });

  assert.deepEqual(Object.keys(user), ['id', 'username', 'displayName', 'role', 'status', 'createdAt']);
});
