import { recordablePath } from '../web-vitals-record'

const URL_CONTEXT_FIELDS = new Set([
  'page_location', 'page_referrer', 'referrer', 'source_url',
  'page_path', 'page_source', 'landing_path',
])

/**
 * URL context must not carry form prefills, tokens or other query/fragment
 * data, and must not carry a booking id in the path either.
 *
 * The path goes through `recordablePath`, the rule page speed records already
 * follow: the parking confirmation address ends in the booking id, which is
 * the only key to that booking, and it was being sent with every event fired
 * on that page (site review, 7 October 2026). An id segment becomes "[id]". A
 * path that is not a plain site path at all (one with an email address typed
 * into it, say) is dropped: the field goes for one of our own paths, and only
 * the site is kept for a full address.
 */
function sanitizeUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined
  const input = value.trim()
  try {
    if (input.startsWith('/') && !input.startsWith('//')) {
      return recordablePath(new URL(input, 'https://tracking.invalid').pathname) ?? undefined
    }
    const url = new URL(input)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined
    return `${url.origin}${recordablePath(url.pathname) ?? ''}`
  } catch {
    return undefined
  }
}

/** Keep approved campaign fields separate; only URL context is reduced here. */
export function sanitizeTrackingUrlContext(payload: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(payload).flatMap(([key, value]) => {
    if (!URL_CONTEXT_FIELDS.has(key)) return [[key, value]]
    const sanitized = sanitizeUrl(value)
    return sanitized === undefined ? [] : [[key, sanitized]]
  }))
}
