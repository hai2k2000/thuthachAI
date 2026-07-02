import path from 'node:path';

const backupNamePattern = /^ai-challenge-hub-\d{8}-\d{6}\.tar\.gz$/;

export function resolveBackupConfig({
  rootDir = process.cwd(),
  env = process.env,
} = {}) {
  const dataDir = path.resolve(env.SUBMISSIONS_DATA_DIR || path.join(rootDir, 'storage'));
  const backupDir = path.resolve(env.BACKUP_DIR || path.join(dataDir, 'backups'));

  return {
    rootDir: path.resolve(rootDir),
    dataDir,
    dbPath: path.join(dataDir, 'submissions.sqlite'),
    uploadDir: path.join(dataDir, 'uploads'),
    backupDir,
    retentionDays: positiveInteger(env.BACKUP_RETENTION_DAYS, 14),
  };
}

export function buildBackupArchiveName(date = new Date()) {
  const stamp = date.toISOString()
    .replaceAll('-', '')
    .replaceAll(':', '')
    .replace('T', '-')
    .slice(0, 15);
  return `ai-challenge-hub-${stamp}.tar.gz`;
}

export function listExpiredBackupFiles(files, {
  now = new Date(),
  retentionDays = 14,
} = {}) {
  const cutoff = now.getTime() - positiveInteger(retentionDays, 14) * 24 * 60 * 60 * 1000;

  return files
    .filter((file) => backupNamePattern.test(file.name))
    .filter((file) => Number(file.mtimeMs || 0) < cutoff)
    .map((file) => file.name);
}

function positiveInteger(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.floor(number);
}
