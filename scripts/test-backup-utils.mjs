import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import {
  buildBackupArchiveName,
  listExpiredBackupFiles,
  resolveBackupConfig,
} from '../server/backup-utils.mjs';

test('resolves production backup paths with safe defaults', () => {
  const config = resolveBackupConfig({
    rootDir: '/opt/ai-challenge-hub',
    env: {},
  });

  assert.equal(config.dataDir, path.resolve('/opt/ai-challenge-hub/storage'));
  assert.equal(config.dbPath, path.resolve('/opt/ai-challenge-hub/storage/submissions.sqlite'));
  assert.equal(config.uploadDir, path.resolve('/opt/ai-challenge-hub/storage/uploads'));
  assert.equal(config.backupDir, path.resolve('/opt/ai-challenge-hub/storage/backups'));
  assert.equal(config.retentionDays, 14);
});

test('honors backup environment overrides', () => {
  const config = resolveBackupConfig({
    rootDir: '/srv/app',
    env: {
      SUBMISSIONS_DATA_DIR: '/data/thuthachai',
      BACKUP_DIR: '/backup/thuthachai',
      BACKUP_RETENTION_DAYS: '30',
    },
  });

  assert.equal(config.dataDir, path.resolve('/data/thuthachai'));
  assert.equal(config.backupDir, path.resolve('/backup/thuthachai'));
  assert.equal(config.retentionDays, 30);
});

test('creates archive names that are sortable by timestamp', () => {
  assert.equal(
    buildBackupArchiveName(new Date('2026-07-02T03:04:05.000Z')),
    'ai-challenge-hub-20260702-030405.tar.gz',
  );
});

test('selects only old ai challenge backup archives for retention cleanup', () => {
  const now = new Date('2026-07-20T00:00:00.000Z');
  const files = [
    { name: 'ai-challenge-hub-20260701-000000.tar.gz', mtimeMs: new Date('2026-07-01T00:00:00.000Z').getTime() },
    { name: 'ai-challenge-hub-20260710-000000.tar.gz', mtimeMs: new Date('2026-07-10T00:00:00.000Z').getTime() },
    { name: 'manual-note.txt', mtimeMs: new Date('2026-06-01T00:00:00.000Z').getTime() },
  ];

  assert.deepEqual(
    listExpiredBackupFiles(files, { now, retentionDays: 14 }),
    ['ai-challenge-hub-20260701-000000.tar.gz'],
  );
});
