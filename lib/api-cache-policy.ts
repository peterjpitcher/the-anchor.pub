/**
 * Which of the site's own /api answers may be stored, and what the rest are told.
 *
 * Nothing under /api is stored unless it is named here. It used to be the other
 * way round: middleware gave every GET a public lifetime unless its route
 * remembered to set a header of its own, and most did not. Live table
 * availability, parking availability, one customer's parking booking and the
 * phone lookup were all kept at the edge for a minute and replayed for up to
 * five more (site review, 7 October 2026).
 */

/**
 * The only /api reads the edge may keep, matched exactly.
 *
 * To be added here a route must be the same for every visitor (nothing
 * personal, nothing keyed by a phone number, an email or a booking reference)
 * and must not be an answer a guest acts on at once (no table, parking or seat
 * availability). Each also sends NO_STORE_HEADERS on its own failure answer,
 * because middleware cannot see how the route went and a stored failure
 * outlives the outage.
 *
 * Routes that set their own Cache-Control (reviews, the calendar files) are not
 * listed: a route's own header already wins over the middleware's.
 */
export const CACHEABLE_API_PATHS: readonly string[] = [
  '/api/events',
  '/api/event-categories',
  '/api/parking/rates',
]

export const CACHEABLE_API_CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=300'

/** The default for every other /api read. A route's own header replaces it. */
export const DEFAULT_API_CACHE_CONTROL = 'no-store, max-age=0'

export function isCacheableApiPath(pathname: string): boolean {
  return CACHEABLE_API_PATHS.includes(pathname)
}

/**
 * For a route whose answer is personal or is live availability. `private` as
 * well as `no-store`, so no shared store may keep it even if a later change
 * loosens one of the two. Set inside the route, so it does not depend on the
 * middleware running or on its list staying right.
 */
export const PRIVATE_NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store',
} as const

/** For the failure answer of a route that is otherwise allowed to be stored. */
export const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
} as const
