/**
 * Which management app API key a server route sends (BK-108, customer bookings
 * review of 24 October 2026).
 *
 * The management app counts each key's calls against one hourly allowance. The
 * site used a single key for everything, so every page read (events, menus,
 * hours, table availability) and every booking and payment shared one budget,
 * and a flood of reads could leave nothing for a guest trying to book or pay.
 *
 * Bookings and payments now send their own key, ANCHOR_BOOKINGS_API_KEY, which
 * has its own allowance in the management app. Reads keep ANCHOR_API_KEY.
 *
 * Until the second key exists, the bookings key falls back to ANCHOR_API_KEY,
 * so a deploy before the key is set changes nothing for guests. Server-only:
 * neither name carries NEXT_PUBLIC_, so neither is ever sent to a browser.
 */

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

/** The key for reads: events, menus, hours, availability, booking periods. */
export function getAnchorReadApiKey(): string | undefined {
  return clean(process.env.ANCHOR_API_KEY)
}

/** The key for creating bookings, enquiries and payments. */
export function getAnchorBookingsApiKey(): string | undefined {
  return clean(process.env.ANCHOR_BOOKINGS_API_KEY) ?? clean(process.env.ANCHOR_API_KEY)
}

/** Whether bookings and payments have their own allowance yet (for the health check). */
export function hasSeparateBookingsApiKey(): boolean {
  return clean(process.env.ANCHOR_BOOKINGS_API_KEY) !== undefined
}
