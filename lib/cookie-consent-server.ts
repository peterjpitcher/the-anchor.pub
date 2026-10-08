/**
 * The visitor's cookie choice, read on the server from the request itself.
 *
 * The routes that pass tracking data on to Google and to our marketing system
 * used to take the browser's word for it: a flag in the request body said
 * whether consent had been given. The choice is stored in a cookie the browser
 * sends with every same-site request, so the server can read it directly and
 * does. A body that claims consent the cookie does not show is not believed.
 *
 * It fails closed. No cookie, a cookie that will not parse, or a category that
 * is anything other than exactly `true` all mean "not allowed".
 *
 * The cookie's name and shape are set in lib/cookies.ts (CONSENT_COOKIE_NAME,
 * CookieConsent). Change one, change the other.
 */

const CONSENT_COOKIE_PATTERN = /(?:^|;\s*)anchor-cookie-consent=([^;]+)/

export type ConsentedCategory = 'analytics' | 'marketing'

export function cookieHeaderAllows(
  cookieHeader: string | null | undefined,
  category: ConsentedCategory
): boolean {
  if (!cookieHeader) return false

  const match = cookieHeader.match(CONSENT_COOKIE_PATTERN)
  if (!match?.[1]) return false

  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(match[1]))
    if (!parsed || typeof parsed !== 'object') return false
    return (parsed as Record<string, unknown>)[category] === true
  } catch {
    return false
  }
}

export function requestAllowsCookieCategory(
  request: { headers: { get(name: string): string | null } },
  category: ConsentedCategory
): boolean {
  return cookieHeaderAllows(request.headers.get('cookie'), category)
}
