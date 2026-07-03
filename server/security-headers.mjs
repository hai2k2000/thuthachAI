export function applySecurityHeaders(_request, response, next) {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (!response.getHeader?.('Cache-Control')) {
    response.setHeader('Cache-Control', 'no-store');
  }

  next();
}
