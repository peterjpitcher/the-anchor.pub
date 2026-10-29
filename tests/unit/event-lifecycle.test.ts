import { isEventBookingClosed } from '@/lib/event-lifecycle'

const ev = (cutoff: string | null) => ({ booking_cutoff_at: cutoff }) as const

describe('isEventBookingClosed', () => {
  it('is false when no cutoff is set', () => {
    expect(isEventBookingClosed(ev(null))).toBe(false)
    expect(isEventBookingClosed({})).toBe(false)
  })

  it('is false when the cutoff is in the future', () => {
    expect(isEventBookingClosed(ev(new Date(Date.now() + 3_600_000).toISOString()))).toBe(false)
  })

  it('is true when the cutoff is in the past', () => {
    expect(isEventBookingClosed(ev(new Date(Date.now() - 3_600_000).toISOString()))).toBe(true)
  })

  it('is false when the cutoff is not a valid date', () => {
    expect(isEventBookingClosed(ev('not-a-date'))).toBe(false)
  })
})

import { getEventBookingBlockReason } from '@/lib/event-lifecycle'
import { isBookableEvent } from '@/lib/event-normalization'

// BK-035 and BK-089 (customer bookings review, 24 October 2026; owner decision D11). The website
// hides the booking form whenever the management app would refuse the booking.
describe('getEventBookingBlockReason and the management app', () => {
  const future = new Date(Date.now() + 7 * 24 * 3_600_000).toISOString()
  const base = { event_status: 'scheduled', eventStatus: 'https://schema.org/EventScheduled', startDate: future, bookings_enabled: true } as const

  it('blocks a postponed night, which has no date to book', () => {
    expect(getEventBookingBlockReason({ ...base, event_status: 'postponed' })).toBe('postponed')
    expect(isBookableEvent({ ...base, event_status: 'postponed', endDate: future } as never)).toBe(false)
  })

  it('blocks when the management app says the night cannot be booked online', () => {
    expect(getEventBookingBlockReason({ ...base, bookable: false, booking_closed_reason: 'booking_closed' })).toBe('closed')
    expect(isBookableEvent({ ...base, bookable: false, endDate: future } as never)).toBe(false)
  })

  it('leaves a passed sales close time to its own panel', () => {
    expect(getEventBookingBlockReason({ ...base, bookable: false, booking_closed_reason: 'sales_closed' })).toBeNull()
  })

  it('keeps working when an older response has no bookable field', () => {
    expect(getEventBookingBlockReason(base)).toBeNull()
    expect(isBookableEvent({ ...base, endDate: future } as never)).toBe(true)
  })
})
