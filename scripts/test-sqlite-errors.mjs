import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import { isSqliteUniqueConstraintError } from '../server/sqlite-errors.mjs';

test('detects sqlite unique constraint errors from real node:sqlite exceptions', () => {
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE users (username TEXT UNIQUE)');
  const insert = db.prepare('INSERT INTO users (username) VALUES (?)');
  insert.run('admin');

  let error = null;
  try {
    insert.run('admin');
  } catch (nextError) {
    error = nextError;
  } finally {
    db.close();
  }

  assert.ok(error);
  assert.equal(isSqliteUniqueConstraintError(error), true);
});

test('detects sqlite unique constraint errors from normalized error metadata', () => {
  assert.equal(isSqliteUniqueConstraintError({ code: 'SQLITE_CONSTRAINT_UNIQUE' }), true);
  assert.equal(isSqliteUniqueConstraintError({ message: 'UNIQUE constraint failed: community_votes.submission_id, community_votes.voter_key' }), true);
  assert.equal(isSqliteUniqueConstraintError({ code: 'ERR_SQLITE_ERROR', message: 'database is locked' }), false);
  assert.equal(isSqliteUniqueConstraintError(new Error('plain error')), false);
});
