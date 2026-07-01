import { timingSafeEqual } from 'node:crypto';

export function buildAdminLoginResponse(credentials, config) {
  const expectedUsername = cleanText(config?.username);
  const expectedPassword = String(config?.password ?? '');
  const token = String(config?.token ?? '');

  if (!expectedUsername || !expectedPassword || !token) {
    return {
      status: 503,
      body: { ok: false, errors: ['Chua cau hinh tai khoan quan tri.'] },
    };
  }

  const username = cleanText(credentials?.username);
  const password = String(credentials?.password ?? '');

  if (!safeEqual(username, expectedUsername) || !safeEqual(password, expectedPassword)) {
    return {
      status: 401,
      body: { ok: false, errors: ['Sai tai khoan hoac mat khau quan tri.'] },
    };
  }

  return {
    status: 200,
    body: { ok: true, token, username: expectedUsername },
  };
}

function cleanText(value) {
  return String(value ?? '').trim();
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}
