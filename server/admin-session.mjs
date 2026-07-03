import { createHmac, timingSafeEqual } from 'node:crypto';

const allowedRoles = new Set(['admin', 'judge', 'viewer']);
const defaultTtlMs = 12 * 60 * 60 * 1000;

export function createAdminSessionToken({
  user,
  secret,
  now = Date.now(),
  ttlMs = defaultTtlMs,
} = {}) {
  const cleanSecret = String(secret || '');
  if (!cleanSecret) {
    throw new Error('Admin session secret is required.');
  }

  const issuedAt = Math.floor(Number(now) / 1000);
  const expiresAt = Math.floor((Number(now) + positiveInteger(ttlMs, defaultTtlMs)) / 1000);
  const payload = {
    sub: cleanText(user?.id, 120),
    username: cleanText(user?.username, 120),
    role: normalizeRole(user?.role),
    iat: issuedAt,
    exp: expiresAt,
  };

  if (!payload.sub || !payload.username) {
    throw new Error('Admin session user is incomplete.');
  }

  const encodedPayload = encodeJson(payload);
  return `${encodedPayload}.${signPayload(encodedPayload, cleanSecret)}`;
}

export function verifyAdminSessionToken(token, {
  secret,
  now = Date.now(),
} = {}) {
  const cleanSecret = String(secret || '');
  const [encodedPayload, signature] = String(token || '').split('.');
  if (!cleanSecret || !encodedPayload || !signature) {
    return { ok: false, reason: 'missing_token' };
  }

  const expectedSignature = signPayload(encodedPayload, cleanSecret);
  if (!safeEqual(signature, expectedSignature)) {
    return { ok: false, reason: 'invalid_signature' };
  }

  const payload = decodeJson(encodedPayload);
  if (!payload || !payload.sub || !payload.username || !allowedRoles.has(payload.role)) {
    return { ok: false, reason: 'invalid_payload' };
  }

  const timestamp = Math.floor(Number(now) / 1000);
  if (!Number.isFinite(payload.exp) || timestamp >= payload.exp) {
    return { ok: false, reason: 'expired' };
  }

  return {
    ok: true,
    user: {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    },
  };
}

export function hasAdminRole(user, allowed = []) {
  const role = normalizeRole(user?.role);
  return allowed.includes(role);
}

function signPayload(encodedPayload, secret) {
  return createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');
}

function encodeJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function decodeJson(value) {
  try {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function normalizeRole(value) {
  const role = cleanText(value, 20);
  return allowedRoles.has(role) ? role : 'viewer';
}

function cleanText(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

function positiveInteger(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.floor(number);
}
