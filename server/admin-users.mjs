import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const adminRoles = ['admin', 'judge', 'viewer'];
export const adminStatuses = ['active', 'locked'];

export function createPasswordHash(password, salt = randomBytes(16).toString('hex')) {
  const cleanPassword = String(password ?? '');
  return `${salt}:${scryptSync(cleanPassword, salt, 32).toString('hex')}`;
}

export function verifyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash || '').split(':');
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(String(password ?? ''), salt, 32);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export function normalizeAdminUserInput(body, { requirePassword = false } = {}) {
  const username = cleanText(body?.username, 60).toLowerCase();
  const displayName = cleanText(body?.displayName || body?.display_name || username, 120);
  const role = adminRoles.includes(cleanText(body?.role, 20)) ? cleanText(body?.role, 20) : 'viewer';
  const status = adminStatuses.includes(cleanText(body?.status, 20)) ? cleanText(body?.status, 20) : 'active';
  const password = String(body?.password ?? '');
  const errors = [];

  if (!/^[a-z0-9._-]{3,60}$/.test(username)) {
    errors.push('Ten dang nhap can tu 3-60 ky tu, chi gom chu thuong, so, dau cham, gach ngang hoac gach duoi.');
  }
  if (!displayName) errors.push('Vui long nhap ten hien thi.');
  if ((requirePassword || password) && password.length < 6) {
    errors.push('Mat khau can co it nhat 6 ky tu.');
  }

  return {
    ok: errors.length === 0,
    errors,
    user: { username, displayName, role, status, password },
  };
}

export function toPublicAdminUser(row) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
  };
}

function cleanText(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}
