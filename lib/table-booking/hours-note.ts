import {
  formatTimeNoSeconds,
  getEffectiveDayHours,
  getKitchenWindows,
  isVenueClosed,
  type UpcomingHoursVersion,
} from '@/lib/hours-utils'
/**
 * The bar and kitchen summary shown above the party-size field on the Find step.
 *
 * ADVISORY ONLY. Nothing here decides what is bookable or what a slot may be
 * booked for; that is the availability route's answer, read via
 * lib/table-booking/purpose. This is published opening hours, so a guest can see
 * why a day looks quiet before they search.
 */

export type BookingHoursNote = {
  summary: string
  footer: string | null
}

// Taken from getEffectiveDayHours rather than re-declared, because hours-utils
// keeps DayHours and SpecialDay private and this only ever forwards them.
export type PublishedHours = {
  regularHours: Parameters<typeof getEffectiveDayHours>[1]
  specialHours?: Parameters<typeof getEffectiveDayHours>[2]
  // A guest can pick a date months out, and the weekly schedule is
  // effective-dated, so the note has to be read off the schedule that governs
  // the chosen date rather than off this week's.
  upcomingVersions?: UpcomingHoursVersion[] | null
}

/** null while hours are still loading, when the date is invalid, or when there is nothing to say. */
export function buildBookingHoursNote(
  date: string,
  businessHours: PublishedHours | null
): BookingHoursNote | null {
  if (!businessHours || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null

  const effective = getEffectiveDayHours(
    date,
    businessHours.regularHours,
    businessHours.specialHours,
    businessHours.upcomingVersions
  )

  if (isVenueClosed(effective)) {
    return {
      summary: "We're closed all day on this date.",
      footer: 'Please pick another date when we’re open.'
    }
  }

  const barRange =
    effective.opens && effective.closes
      ? `${formatTimeNoSeconds(effective.opens)}–${formatTimeNoSeconds(effective.closes)}`
      : null

  // Sittings, not the flattened span: the availability route marks the gap
  // between lunch and dinner drinks-only, so promising food across it here
  // would contradict the very form this note sits on.
  const kitchenWindows = getKitchenWindows(effective)
  const kitchenIsClosed = kitchenWindows.length === 0
  const kitchenRange = kitchenWindows
    .map((window) => `${formatTimeNoSeconds(window.opens)}–${formatTimeNoSeconds(window.closes)}`)
    .join(', ')

  const parts: string[] = []
  if (barRange) parts.push(`Bar open ${barRange}`)
  if (kitchenIsClosed) parts.push('Kitchen closed today')
  else if (kitchenRange) parts.push(`Kitchen open ${kitchenRange}`)

  if (parts.length === 0) return null

  return {
    summary: parts.join(' · '),
    footer: null
  }
}
