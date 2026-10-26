/**
 * What a link to /book-table can fill in for the guest: the date, a time, the
 * party size, an explicit drinks-only choice and a Nations Championship game.
 *
 * Read in the browser, from the address, by the booking form. The page used to
 * read these on the server, which made Next.js build it afresh for every
 * visitor instead of serving a cached copy (review BK-200). The rules are the
 * ones the page applied.
 */

export type BookingPrefill = {
  date?: string
  time?: string
  partySize?: number
  drinksOnly?: boolean
}

type SearchParamsLike = Pick<URLSearchParams, 'get'> | null | undefined

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function readPartySize(value: string | null): number | undefined {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return undefined
  return Math.min(Math.max(parsed, 1), 20)
}

export function readBookingPrefill(params: SearchParamsLike): BookingPrefill {
  if (!params) return {}
  return {
    date: params.get('date') ?? undefined,
    time: params.get('time') ?? undefined,
    partySize: readPartySize(params.get('party_size')),
    // Only the explicit drinks value opts into bar seating. Other purpose
    // values cannot override the live slot's food availability.
    drinksOnly: params.get('purpose') === 'drinks'
  }
}

/**
 * The game a link asks to book for, when it is shaped like one. Anything else
 * is ignored rather than sent on to look up, as the server lookup did.
 */
export function readFixtureId(params: SearchParamsLike): string | null {
  const value = params?.get('fixture_id')?.trim() ?? ''
  return UUID.test(value) ? value : null
}

/** What the form says when a game in a link cannot be confirmed. */
export const FIXTURE_UNCONFIRMED_MESSAGE =
  'We cannot confirm this game right now. You can make a normal table booking below or check the tournament page.'
