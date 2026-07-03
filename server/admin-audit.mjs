import { randomUUID } from 'node:crypto';

const sensitiveKeys = new Set([
  'authorization',
  'password',
  'password_hash',
  'passwordHash',
  'token',
  'x-admin-token',
]);

export function buildAdminAuditRecord({
  actor = {},
  action = '',
  targetType = '',
  targetId = '',
  details = {},
  ip = '',
  userAgent = '',
  now = new Date(),
  idFactory = defaultIdFactory,
} = {}) {
  const cleanAction = cleanText(action, 120);
  const createdAt = now instanceof Date ? now.toISOString() : new Date(now).toISOString();

  return {
    id: `AUD-${cleanText(idFactory(), 24).replace(/-/g, '').toUpperCase()}`,
    createdAt,
    actorId: cleanText(actor.id, 120),
    actorUsername: cleanText(actor.username, 120),
    actorRole: cleanText(actor.role, 40),
    action: cleanAction,
    targetType: cleanText(targetType, 80),
    targetId: cleanText(targetId, 160),
    detailsJson: JSON.stringify(normalizeAdminAuditDetails(details)),
    ip: cleanText(ip, 120),
    userAgent: cleanText(userAgent, 300),
  };
}

export function normalizeAdminAuditDetails(value, depth = 0) {
  if (depth > 4) return '[truncated]';
  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => normalizeAdminAuditDetails(item, depth + 1));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !sensitiveKeys.has(String(key)))
        .map(([key, item]) => [cleanText(key, 80), normalizeAdminAuditDetails(item, depth + 1)]),
    );
  }
  if (typeof value === 'string') return cleanText(value, 1000);
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'boolean' || value === null) return value;
  return '';
}

export function toPublicAdminAuditLog(row = {}) {
  return {
    id: row.id,
    createdAt: row.created_at,
    actor: {
      id: row.actor_id || '',
      username: row.actor_username || '',
      role: row.actor_role || '',
    },
    action: row.action || '',
    targetType: row.target_type || '',
    targetId: row.target_id || '',
    details: parseDetails(row.details_json),
    ip: row.ip || '',
    userAgent: row.user_agent || '',
  };
}

function parseDetails(value) {
  try {
    const parsed = JSON.parse(value || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function cleanText(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

function defaultIdFactory() {
  return randomUUID();
}
