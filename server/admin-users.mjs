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
  const rawRole = cleanText(body?.role, 20);
  const rawStatus = cleanText(body?.status, 20);
  const role = rawRole || 'viewer';
  const status = rawStatus || 'active';
  const password = String(body?.password ?? '');
  const errors = [];

  if (!/^[a-z0-9._-]{3,60}$/.test(username)) {
    errors.push('Ten dang nhap can tu 3-60 ky tu, chi gom chu thuong, so, dau cham, gach ngang hoac gach duoi.');
  }
  if (!displayName) errors.push('Vui long nhap ten hien thi.');
  if (!adminRoles.includes(role)) errors.push('Vai tro quan tri khong hop le.');
  if (!adminStatuses.includes(status)) errors.push('Trang thai tai khoan khong hop le.');
  if ((requirePassword || password) && password.length < 6) {
    errors.push('Mat khau can co it nhat 6 ky tu.');
  }

  return {
    ok: errors.length === 0,
    errors,
    user: { username, displayName, role, status, password },
  };
}

export function validateLastActiveAdminChange(users = [], targetId = '', nextUser = {}) {
  const currentActiveAdmins = users.filter((user) => isActiveAdmin(user));
  const target = users.find((user) => user.id === targetId);
  const targetWasActiveAdmin = isActiveAdmin(target);
  const targetWillBeActiveAdmin = nextUser.role === 'admin' && nextUser.status === 'active';

  if (targetWasActiveAdmin && !targetWillBeActiveAdmin && currentActiveAdmins.length <= 1) {
    return {
      ok: false,
      errors: ['Can giu lai it nhat mot tai khoan admin dang hoat dong.'],
    };
  }

  return { ok: true, errors: [] };
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

function isActiveAdmin(user = {}) {
  return user.role === 'admin' && user.status === 'active';
}

function cleanText(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}
