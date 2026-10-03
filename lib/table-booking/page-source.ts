/**
 * The page source of a website table booking: which of our pages it came from
 * and which advert, as six short labels.
 *
 * The labels are read from the address of the page the guest books on and
 * from nowhere else: no cookie, no localStorage, no sessionStorage, and they
 * are not stored in the browser. That is why they can be sent whatever the
 * guest chose about cookies (owner decision, 25 September 2026). They go to
 * the management app only, to sit with the booking. They are never sent to
 * CheersAI or to Meta: that forward keeps its own consent-gated record
 * (lib/booking-attribution.ts) exactly as it was.
 *
 * Because they sit against a named booking they are personal data, and the
 * privacy notice says so (app/privacy-policy/page.tsx).
 *
 * They are reporting hints, nothing more. A label never changes a booking,
 * and a bad one is dropped quietly: it is never a reason to refuse a booking.
 */

export const PAGE_SOURCE_FIELDS = [
  'booking_source',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'short_code'
] as const

export type PageSourceField = (typeof PAGE_SOURCE_FIELDS)[number]

export type PageSource = Partial<Record<PageSourceField, string>>

/** The longest each label may be. The management app applies the same limits. */
export const PAGE_SOURCE_LIMITS: Record<PageSourceField, number> = {
  booking_source: 80,
  utm_source: 80,
  utm_medium: 80,
  utm_campaign: 160,
  utm_content: 160,
  short_code: 32
}

/** The labels that come straight off the address. `booking_source` is `?source=`. */
const ADDRESS_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'short_code'] as const

const DEFAULT_BOOKING_SOURCE = 'direct'

/** A trimmed, length-limited string, or undefined for anything else. */
function cleanLabel(value: unknown, limit: number): string | undefined {
  if (typeof value !== 'string') return undefined
  const cleaned = value.trim().slice(0, limit).trim()
  return cleaned.length > 0 ? cleaned : undefined
}

/**
 * Build the labels in the browser, at submit time, from the current page
 * address. `searchParams` is the address's query (`useSearchParams()`).
 *
 * Only the five ad tags above are read. `fbclid`, `gclid` and every other
 * parameter are left behind.
 */
export function buildPageSource(
  bookingSource: string | null | undefined,
  searchParams: Pick<URLSearchParams, 'get'> | null | undefined
): PageSource {
  const pageSource: PageSource = {
    booking_source: cleanLabel(bookingSource, PAGE_SOURCE_LIMITS.booking_source) ?? DEFAULT_BOOKING_SOURCE
  }

  for (const field of ADDRESS_FIELDS) {
    const value = cleanLabel(searchParams?.get(field), PAGE_SOURCE_LIMITS[field])
    if (value) pageSource[field] = value
  }

  return pageSource
}

/**
 * Read a `page_source` that arrived from a browser, keeping only what is safe
 * to pass on. Lenient on purpose:
 *
 * - anything that is not a plain object gives no labels at all;
 * - each of the six fields is kept only if it is a string, then trimmed and
 *   cut to its limit;
 * - a blank or wrong-type value is dropped;
 * - every other key is dropped.
 *
 * It never throws and never reports an error, so it can never be the reason a
 * booking is refused.
 */
export function sanitisePageSource(input: unknown): PageSource {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {}

  const record = input as Record<string, unknown>
  const pageSource: PageSource = {}

  for (const field of PAGE_SOURCE_FIELDS) {
    const value = cleanLabel(record[field], PAGE_SOURCE_LIMITS[field])
    if (value) pageSource[field] = value
  }

  return pageSource
}
