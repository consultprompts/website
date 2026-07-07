/**
 * Returns the URL only if it parses as absolute http(s); otherwise null.
 * Guards every stored/user-provided URL rendered as an <a href> against
 * javascript:/data: injection.
 */
export function safeUrl(raw?: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === 'http:' || u.protocol === 'https:' ? raw : null;
  } catch {
    return null;
  }
}
