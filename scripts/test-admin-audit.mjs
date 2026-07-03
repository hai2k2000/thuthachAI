import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildAdminAuditRecord,
  normalizeAdminAuditDetails,
  toPublicAdminAuditLog,
} from '../server/admin-audit.mjs';

test('normalizes audit details without leaking sensitive values', () => {
  const details = normalizeAdminAuditDetails({
    username: 'judge01',
    password: 'secret',
    token: 'raw-token',
    nested: {
      passwordHash: 'hash',
      role: 'judge',
    },
  });

  assert.deepEqual(details, {
    username: 'judge01',
    nested: {
      role: 'judge',
    },
  });
});

test('builds insertable admin audit records with safe actor and request metadata', () => {
  const record = buildAdminAuditRecord({
    actor: {
      id: 'USR-ADMIN',
      username: 'admin',
      role: 'admin',
    },
    action: 'submission.review.update',
    targetType: 'submission',
    targetId: 'TD-20260701-ABC123XY',
    details: {
      score: 90,
      token: 'must-not-leak',
    },
    ip: '203.0.113.10',
    userAgent: 'node-test',
    now: new Date('2026-07-03T04:00:00.000Z'),
    idFactory: () => 'abc123def456',
  });

  assert.equal(record.id, 'AUD-ABC123DEF456');
  assert.equal(record.createdAt, '2026-07-03T04:00:00.000Z');
  assert.equal(record.actorId, 'USR-ADMIN');
  assert.equal(record.actorUsername, 'admin');
  assert.equal(record.actorRole, 'admin');
  assert.equal(record.action, 'submission.review.update');
  assert.equal(record.targetType, 'submission');
  assert.equal(record.targetId, 'TD-20260701-ABC123XY');
  assert.equal(record.detailsJson, '{"score":90}');
  assert.equal(record.ip, '203.0.113.10');
  assert.equal(record.userAgent, 'node-test');
});

test('maps audit rows to public API output and tolerates invalid details json', () => {
  const log = toPublicAdminAuditLog({
    id: 'AUD-1',
    created_at: '2026-07-03T04:00:00.000Z',
    actor_id: 'USR-ADMIN',
    actor_username: 'admin',
    actor_role: 'admin',
    action: 'admin.user.update',
    target_type: 'admin_user',
    target_id: 'USR-JUDGE',
    details_json: '{invalid',
    ip: '203.0.113.10',
    user_agent: 'node-test',
  });

  assert.deepEqual(log, {
    id: 'AUD-1',
    createdAt: '2026-07-03T04:00:00.000Z',
    actor: {
      id: 'USR-ADMIN',
      username: 'admin',
      role: 'admin',
    },
    action: 'admin.user.update',
    targetType: 'admin_user',
    targetId: 'USR-JUDGE',
    details: {},
    ip: '203.0.113.10',
    userAgent: 'node-test',
  });
});
