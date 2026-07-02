import assert from 'node:assert/strict';
import test from 'node:test';

test('creates a stable voter key per submission and device', async () => {
  const communityVotes = await import('../server/community-votes.mjs').catch(() => null);
  assert.ok(communityVotes, 'community vote utilities must exist');

  const first = communityVotes.createVoterKey({
    submissionId: 'TD-20260701-ABC123XY',
    deviceId: 'device-001',
    ip: '203.0.113.10',
    userAgent: 'Browser A',
    secret: 'test-secret',
  });
  const repeated = communityVotes.createVoterKey({
    submissionId: 'TD-20260701-ABC123XY',
    deviceId: 'device-001',
    ip: '203.0.113.10',
    userAgent: 'Browser A',
    secret: 'test-secret',
  });
  const otherSubmission = communityVotes.createVoterKey({
    submissionId: 'TD-20260702-DEF456ZZ',
    deviceId: 'device-001',
    ip: '203.0.113.10',
    userAgent: 'Browser A',
    secret: 'test-secret',
  });

  assert.equal(first, repeated);
  assert.notEqual(first, otherSubmission);
  assert.match(first, /^[a-f0-9]{64}$/);
});

test('normalizes community vote input and rejects invalid reactions', async () => {
  const communityVotes = await import('../server/community-votes.mjs');

  const valid = communityVotes.normalizeCommunityVoteInput({
    deviceId: ' DEVICE.001 ',
    reaction: 'creative',
  });
  const invalid = communityVotes.normalizeCommunityVoteInput({
    deviceId: 'x',
    reaction: 'spam',
  });

  assert.equal(valid.ok, true);
  assert.equal(valid.vote.deviceId, 'DEVICE.001');
  assert.equal(valid.vote.reaction, 'creative');
  assert.equal(invalid.ok, false);
  assert.ok(invalid.errors.length >= 2);
});

test('summarizes community vote counts by reaction', async () => {
  const communityVotes = await import('../server/community-votes.mjs');

  const summary = communityVotes.summarizeCommunityVotes([
    { reaction: 'favorite' },
    { reaction: 'creative' },
    { reaction: 'favorite' },
    { reaction: 'useful' },
  ]);

  assert.equal(summary.total, 4);
  assert.deepEqual(summary.reactions, {
    favorite: 2,
    useful: 1,
    creative: 1,
    applicable: 0,
    inspiring: 0,
  });
});
