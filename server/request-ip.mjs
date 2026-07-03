export function getRequestIp(request = {}) {
  const realIp = firstHeaderValue(request.get?.('x-real-ip'));
  if (realIp) return realIp;

  const forwardedFor = String(request.get?.('x-forwarded-for') || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  if (forwardedFor.length) return cleanIp(forwardedFor.at(-1));

  return cleanIp(request.socket?.remoteAddress || request.ip || '');
}

function firstHeaderValue(value) {
  return cleanIp(String(value || '').split(',')[0]);
}

function cleanIp(value) {
  return String(value || '').trim().slice(0, 120);
}
