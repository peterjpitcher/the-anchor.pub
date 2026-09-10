/**
 * The Christmas 2 and 3 course deadline, as the website needs it.
 *
 * Two and three courses need everyone's choices by noon London time, seven
 * days before the booking (SSOT §7). After that only the 1 course tier can be
 * booked, because it needs no pre-order (owner decision, 10 September 2026).
 *
 * The management app owns the rule and is what refuses a late booking
 * (`christmas_course_policy_v01`, fed by `booking_periods.preorder_cutoff_days`).
 * This copy only stops a form offering what would be refused, so it answers
 * "available" whenever it cannot tell. It has no imports on purpose: client
 * components use it, and must not pull the whole SSOT into the browser.
 */

/** Days before a Christmas booking that the 2 and 3 course choices are due. */
export const CHRISTMAS_PREORDER_CUTOFF_DAYS = 7

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** A calendar date moved by whole days. Calendar arithmetic only, so no clock is involved. */
function shiftIsoDate(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const shifted = new Date(Date.UTC(year, month - 1, day) + days * MILLISECONDS_PER_DAY)
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`
}

/** London wall-clock time as YYYY-MM-DDTHH:mm, so it compares against a local deadline. */
function londonWallClock(base: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    // h23, not `hour12: false`, which renders midnight as "24".
    hourCycle: 'h23'
  }).formatToParts(base)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(entry => entry.type === type)?.value ?? '00'
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`
}

/** Can the 2 and 3 course tiers still be booked for this date? */
export function christmasMultipleCoursesAvailable(bookingIsoDate: string, now: Date = new Date()): boolean {
  const date = typeof bookingIsoDate === 'string' ? bookingIsoDate.trim() : ''
  if (!ISO_DATE_PATTERN.test(date)) return true
  const closesOn = shiftIsoDate(date, -CHRISTMAS_PREORDER_CUTOFF_DAYS)
  return londonWallClock(now) < `${closesOn}T12:00`
}

/** What a guest is told when their date is inside the deadline. */
export const LATE_CHRISTMAS_ONE_COURSE_NOTE =
  "Your date is less than a week away, so it's the 1 course menu, with no pre-order. Two and three courses need everyone's choices by noon, 7 days before."
