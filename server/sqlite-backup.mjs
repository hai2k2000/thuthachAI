import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export function backupSqliteDatabase(sourcePath, destinationPath) {
  const source = path.resolve(String(sourcePath || ''));
  const destination = path.resolve(String(destinationPath || ''));

  if (!source || !destination) {
    throw new Error('SQLite backup source and destination are required.');
  }
  if (source === destination) {
    throw new Error('Backup destination must differ from source database.');
  }
  if (!fs.existsSync(source)) {
    throw new Error(`Database not found: ${source}`);
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.rmSync(destination, { force: true });

  const db = new DatabaseSync(source, { readOnly: true });
  try {
    db.exec(`VACUUM INTO ${quoteSqliteString(destination)}`);
  } finally {
    db.close();
  }
}

function quoteSqliteString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}
