export function isSqliteUniqueConstraintError(error) {
  const code = String(error?.code || error?.name || '').toUpperCase();
  const message = String(error?.message || '').toUpperCase();
  return code.includes('SQLITE_CONSTRAINT_UNIQUE')
    || message.includes('UNIQUE CONSTRAINT FAILED')
    || message.includes('SQLITE_CONSTRAINT_UNIQUE');
}
