const URL_CONTEXT_FIELDS = new Set([
  'page_location', 'page_referrer', 'referrer', 'source_url',
  'page_path', 'page_source', 'landing_path',
])

/** URL context must not carry form prefills, tokens or other query/fragment data. */
function sanitizeUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined
  const input = value.trim()
  try {
    if (input.startsWith('/') && !input.startsWith('//')) {
      return new URL(input, 'https://tracking.invalid').pathname
    }
    const url = new URL(input)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined
    return `${url.origin}${url.pathname}`
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
