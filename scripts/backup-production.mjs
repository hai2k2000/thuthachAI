import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildBackupArchiveName,
  listExpiredBackupFiles,
  resolveBackupConfig,
} from '../server/backup-utils.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = resolveBackupConfig({ rootDir });
const archiveName = buildBackupArchiveName(new Date());
const archivePath = path.join(config.backupDir, archiveName);
const stagingDir = path.join(config.backupDir, `.staging-${process.pid}`);

try {
  ensureBackupInputs(config);
  fs.rmSync(stagingDir, { recursive: true, force: true });
  fs.mkdirSync(stagingDir, { recursive: true });
  fs.copyFileSync(config.dbPath, path.join(stagingDir, 'submissions.sqlite'));

  const result = spawnSync('tar', [
    '-czf',
    archivePath,
    '-C',
    stagingDir,
    'submissions.sqlite',
    '-C',
    config.dataDir,
    'uploads',
  ], { encoding: 'utf8' });

  if (result.status !== 0) {
    throw new Error(`tar failed: ${result.stderr || result.stdout || 'unknown error'}`);
  }

  const removed = cleanupOldBackups(config);
  console.log(JSON.stringify({
    ok: true,
    archive: archivePath,
    removed,
    retentionDays: config.retentionDays,
  }));
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    error: error.message,
  }));
  process.exitCode = 1;
} finally {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}

function ensureBackupInputs({ dbPath, uploadDir, backupDir }) {
  fs.mkdirSync(backupDir, { recursive: true });
  fs.mkdirSync(uploadDir, { recursive: true });

  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database not found: ${dbPath}`);
  }
}

function cleanupOldBackups({ backupDir, retentionDays }) {
  const files = fs.readdirSync(backupDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const filePath = path.join(backupDir, entry.name);
      return {
        name: entry.name,
        mtimeMs: fs.statSync(filePath).mtimeMs,
      };
    });
  const expired = listExpiredBackupFiles(files, { retentionDays });

  for (const name of expired) {
    fs.rmSync(path.join(backupDir, name), { force: true });
  }

  return expired;
}
