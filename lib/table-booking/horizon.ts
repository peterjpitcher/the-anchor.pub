/**
 * How far ahead a guest may book online (owner decision 4: twelve months).
 *
 * The browser `max` attribute on a date input is a courtesy, not a control: it
 * is trivially bypassed and some mobile browsers ignore it for typed values. So
 * the same rule is applied here and enforced again server-side in the website
 * proxies, which is the only place it actually binds.
 *
 * All arithmetic is done on YYYY-MM-DD strings. Nothing here parses a date with
 * `new Date(value)`, which would re-introduce the browser-local timezone drift
 * that the Europe/London helpers exist to prevent.
 */

export const BOOKING_HORIZON_MONTHS = 12

export const BOOKING_HORIZON_MESSAGE =
  'We take bookings up to 12 months ahead. Please choose an earlier date, or give us a ring on 01753 682707 and we will help.'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function daysInMonth(year: number, month: number): number {
  // month is 1-12. Day 0 of the next month is the last day of this one.
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

/**
 * The latest date a guest may pick, given London today. Returns '' for a value
 * that is not an ISO date, so a caller can leave the input unbounded rather
 * than bound it to nonsense.
 */
export function maxBookingIsoDate(todayIsoDate: string): string {
  if (!ISO_DATE.test(todayIsoDate)) return ''

  const [year, month, day] = todayIsoDate.split('-').map((part) => Number.parseInt(part, 10))
  const totalMonths = month - 1 + BOOKING_HORIZON_MONTHS
  const targetYear = year + Math.floor(totalMonths / 12)
  const targetMonth = (totalMonths % 12) + 1
  // 29 February plus twelve months is 28 February, not 1 March.
  const targetDay = Math.min(day, daysInMonth(targetYear, targetMonth))

  return `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`
}

/**
 * True when the requested date is further ahead than we take online bookings.
 * A malformed value is not "beyond the horizon"; the existing format checks own
 * that failure and say something more useful about it.
 */
export function isBeyondBookingHorizon(value: string, todayIsoDate: string): boolean {
  if (!ISO_DATE.test(value)) return false
  const max = maxBookingIsoDate(todayIsoDate)
  if (!max) return false
  return value > max
}
