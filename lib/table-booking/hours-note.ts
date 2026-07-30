import {
  formatTimeNoSeconds,
  getEffectiveDayHours,
  isKitchenClosed,
  isVenueClosed,
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
    businessHours.specialHours
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

  const kitchen = effective.kitchen
  const kitchenIsClosed = isKitchenClosed(effective)
  let kitchenRange: string | null = null
  if (
    !kitchenIsClosed &&
    kitchen &&
    typeof kitchen === 'object' &&
    'opens' in kitchen &&
    'closes' in kitchen
  ) {
    const k = kitchen as { opens?: string; closes?: string }
    if (k.opens && k.closes) {
      kitchenRange = `${formatTimeNoSeconds(k.opens)}–${formatTimeNoSeconds(k.closes)}`
    }
  }

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
