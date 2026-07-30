import {
  formatEventLocalTime,
  getEventDateRangeUtc,
  getEventLocalIsoDate,
} from '@/lib/event-calendar'

/**
 * The "there are events on this date" panel beside the booking form: what an
 * event looks like once normalised, and how a raw /api/events response becomes
 * a list of them.
 *
 * Two filters are load-bearing and easy to lose. An event whose London date is
 * not the date being asked about must be dropped, because the panel offers a
 * one-tap switch to booking it. And a cancelled event must be dropped, because
 * the tap would take a guest to a booking form for something that is not
 * happening.
 */

export type SuggestedEvent = {
  id: string
  slug: string | null
  name: string
  startDate: string
  shortDescription: string | null
  seatsRemaining: number | null
  priceLabel: string | null
}

export function getLondonIsoDate(dateTimeValue: string): string | null {
  return getEventLocalIsoDate(dateTimeValue)
}

export function formatEventTimeLabel(dateTimeValue: string): string {
  return formatEventLocalTime(dateTimeValue, { includeMinutesWhenZero: true })
}

export function formatEventPriceLabel(value: unknown, currency?: string): string | null {
  const parsedValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
      ? Number.parseFloat(value)
      : Number.NaN

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) return null

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'GBP'
  }).format(parsedValue)
}

export function normalizeSuggestedEvents(payload: any, targetDate: string): SuggestedEvent[] {
  const root = payload?.data || payload
  const rawEvents: unknown[] = Array.isArray(root?.events)
    ? root.events
    : Array.isArray(root)
    ? root
    : []

  const normalized: SuggestedEvent[] = []

  for (const rawEvent of rawEvents) {
    if (!rawEvent || typeof rawEvent !== 'object') continue
    const source = rawEvent as Record<string, unknown>

    const id = typeof source.id === 'string' ? source.id.trim() : ''
    if (!id) continue

    const name = typeof source.name === 'string' ? source.name.trim() : ''
    if (!name) continue

    const startDate =
      typeof source.startDate === 'string'
        ? source.startDate
        : typeof source.start_date === 'string'
        ? source.start_date
        : ''
    if (!startDate) continue

    if (getLondonIsoDate(startDate) !== targetDate) continue

    const status =
      typeof source.eventStatus === 'string'
        ? source.eventStatus
        : typeof source.event_status === 'string'
        ? source.event_status
        : ''

    if (status.toLowerCase().includes('cancel')) continue

    const shortDescription =
      typeof source.shortDescription === 'string'
        ? source.shortDescription
        : typeof source.description === 'string'
        ? source.description
        : null

    const offers =
      source.offers && typeof source.offers === 'object'
        ? (source.offers as Record<string, unknown>)
        : null

    const remainingAttendeeCapacityRaw =
      typeof source.remainingAttendeeCapacity === 'number'
        ? source.remainingAttendeeCapacity
        : typeof source.remainingAttendeeCapacity === 'string'
        ? Number.parseInt(source.remainingAttendeeCapacity, 10)
        : typeof source.remaining_attendee_capacity === 'number'
        ? source.remaining_attendee_capacity
        : typeof source.remaining_attendee_capacity === 'string'
        ? Number.parseInt(source.remaining_attendee_capacity, 10)
        : Number.NaN

    normalized.push({
      id,
      slug: typeof source.slug === 'string' && source.slug.trim().length > 0 ? source.slug.trim() : null,
      name,
      startDate,
      shortDescription,
      seatsRemaining: Number.isFinite(remainingAttendeeCapacityRaw)
        ? Number(remainingAttendeeCapacityRaw)
        : null,
      priceLabel: formatEventPriceLabel(
        offers?.price,
        typeof offers?.priceCurrency === 'string' ? offers.priceCurrency : 'GBP'
      )
    })
  }

  return normalized.sort((left, right) => {
    const leftTime = getEventDateRangeUtc(left).start.getTime()
    const rightTime = getEventDateRangeUtc(right).start.getTime()
    return leftTime - rightTime
  })
}
