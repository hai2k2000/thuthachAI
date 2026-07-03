import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createPasswordHash,
  normalizeAdminUserInput,
  validateLastActiveAdminChange,
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

test('rejects invalid admin roles and statuses instead of silently downgrading them', () => {
  const result = normalizeAdminUserInput({
    username: 'operator',
    displayName: 'Operator',
    role: 'owner',
    status: 'disabled',
    password: 'secret123',
  }, { requirePassword: true });

  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('Vai tro quan tri khong hop le.'));
  assert.ok(result.errors.includes('Trang thai tai khoan khong hop le.'));
});

test('keeps viewer and active as defaults when role/status are omitted', () => {
  const result = normalizeAdminUserInput({
    username: 'viewer.one',
    displayName: 'Viewer One',
    password: 'secret123',
  }, { requirePassword: true });

  assert.equal(result.ok, true);
  assert.equal(result.user.role, 'viewer');
  assert.equal(result.user.status, 'active');
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

test('prevents locking or demoting the last active admin account', () => {
  const users = [
    { id: 'USR-1', role: 'admin', status: 'active' },
    { id: 'USR-2', role: 'judge', status: 'active' },
  ];

  const locked = validateLastActiveAdminChange(users, 'USR-1', { role: 'admin', status: 'locked' });
  const demoted = validateLastActiveAdminChange(users, 'USR-1', { role: 'viewer', status: 'active' });

  assert.equal(locked.ok, false);
  assert.equal(demoted.ok, false);
  assert.deepEqual(locked.errors, ['Can giu lai it nhat mot tai khoan admin dang hoat dong.']);
});

test('allows admin role/status changes when another active admin remains', () => {
  const users = [
    { id: 'USR-1', role: 'admin', status: 'active' },
    { id: 'USR-2', role: 'admin', status: 'active' },
  ];

  const result = validateLastActiveAdminChange(users, 'USR-1', { role: 'viewer', status: 'locked' });

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});
