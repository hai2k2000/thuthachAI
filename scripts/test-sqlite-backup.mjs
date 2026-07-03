import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import { backupSqliteDatabase } from '../server/sqlite-backup.mjs';

test('creates a readable sqlite backup snapshot with VACUUM INTO', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sqlite-backup-'));
  const sourcePath = path.join(tempDir, 'source.sqlite');
  const backupPath = path.join(tempDir, 'backup.sqlite');
  const source = new DatabaseSync(sourcePath);
  source.exec('CREATE TABLE submissions (id TEXT PRIMARY KEY, title TEXT NOT NULL)');
  source.prepare('INSERT INTO submissions (id, title) VALUES (?, ?)').run('TD-1', 'Bai du thi');
  source.close();

  backupSqliteDatabase(sourcePath, backupPath);

  const backup = new DatabaseSync(backupPath, { readOnly: true });
  try {
    const row = backup.prepare('SELECT id, title FROM submissions').get();
    assert.deepEqual({ ...row }, { id: 'TD-1', title: 'Bai du thi' });
  } finally {
    backup.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('refuses to overwrite the source database path', () => {
  assert.throws(
    () => backupSqliteDatabase('/tmp/source.sqlite', '/tmp/source.sqlite'),
    /Backup destination must differ/,
  );
});
