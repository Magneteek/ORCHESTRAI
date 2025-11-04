/**
 * Security Headers Configuration
 *
 * Implements OWASP recommended security headers
 */

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string;
  strictTransportSecurity?: string;
  xFrameOptions?: string;
  xContentTypeOptions?: string;
  referrerPolicy?: string;
  permissionsPolicy?: string;
}

/**
 * Get Content Security Policy header value
 */
export function getCSP(nonce?: string): string {
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com ${nonce ? `'nonce-${nonce}'` : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.facebook.com https://*.fbcdn.net https://api.anthropic.com",
    "frame-src 'self' https://www.facebook.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ];

  return cspDirectives.join('; ');
}

/**
 * Default security headers
 */
export const DEFAULT_SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'X-DNS-Prefetch-Control': 'on',
};

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: Response, config: SecurityHeadersConfig = {}): Response {
  const headers = new Headers(response.headers);

  // Apply default headers
  Object.entries(DEFAULT_SECURITY_HEADERS).forEach(([key, value]) => {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  });

  // Apply CSP
  if (config.contentSecurityPolicy) {
    headers.set('Content-Security-Policy', config.contentSecurityPolicy);
  } else {
    headers.set('Content-Security-Policy', getCSP());
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
