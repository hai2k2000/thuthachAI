export function createRateLimitStore() {
  return new Map();
}

export function checkRateLimit(store, {
  key,
  limit,
  windowMs,
  now = Date.now(),
} = {}) {
  if (!store || typeof store.get !== 'function' || typeof store.set !== 'function') {
    throw new TypeError('A rate limit store is required.');
  }

  const safeKey = String(key || 'anonymous');
  const safeLimit = positiveInteger(limit, 1);
  const safeWindowMs = positiveInteger(windowMs, 60_000);
  const timestamp = positiveInteger(now, Date.now());
  const current = store.get(safeKey);

  if (!current || timestamp >= current.resetAt) {
    const resetAt = timestamp + safeWindowMs;
    store.set(safeKey, { count: 1, resetAt });
    pruneExpiredEntries(store, timestamp);
    return buildResult({ allowed: true, count: 1, limit: safeLimit, resetAt, now: timestamp });
  }

  if (current.count >= safeLimit) {
    return buildResult({ allowed: false, count: current.count, limit: safeLimit, resetAt: current.resetAt, now: timestamp });
  }

  current.count += 1;
  store.set(safeKey, current);
  return buildResult({ allowed: true, count: current.count, limit: safeLimit, resetAt: current.resetAt, now: timestamp });
}

export function createRateLimitMiddleware({
  store = createRateLimitStore(),
  keyPrefix = 'api',
  limit = 60,
  windowMs = 60_000,
  now = () => Date.now(),
  getKey = defaultRequestKey,
  message = 'Qua nhieu yeu cau. Vui long thu lai sau it phut.',
} = {}) {
  return (request, response, next) => {
    const clientKey = String(getKey(request) || 'anonymous');
    const result = checkRateLimit(store, {
      key: `${keyPrefix}:${clientKey}`,
      limit,
      windowMs,
      now: now(),
    });

    response.setHeader('X-RateLimit-Limit', String(result.limit));
    response.setHeader('X-RateLimit-Remaining', String(result.remaining));
    response.setHeader('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));

    if (result.allowed) {
      next();
      return;
    }

    response.setHeader('Retry-After', String(result.retryAfterSeconds));
    response.status(429).json({ ok: false, errors: [message] });
  };
}

function buildResult({ allowed, count, limit, resetAt, now }) {
  return {
    allowed,
    limit,
    remaining: Math.max(0, limit - count),
    resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
  };
}

function defaultRequestKey(request = {}) {
  const forwarded = String(request.get?.('x-forwarded-for') || '').split(',')[0].trim();
  return forwarded || request.ip || request.socket?.remoteAddress || 'anonymous';
}

function positiveInteger(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.floor(number);
}

function pruneExpiredEntries(store, now) {
  if (store.size < 10_000) return;
  for (const [key, value] of store.entries()) {
    if (!value || now > value.resetAt) {
      store.delete(key);
    }
  }
}
