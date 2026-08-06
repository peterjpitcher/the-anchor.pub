/**
 * Event presentation resolver tests.
 *
 * These lock in the rule that every booking-related surface on an event page
 * is switched off once the event is over, and that the JSON-LD agrees with the
 * visible page. The bug this prevents: `/events/music-bingo-2026-07-17` showed
 * "This event has ended" to visitors while emitting
 * `offers.availability: InStock` to search engines, and still rendered a
 * booking policy card, booking FAQs, a "Ready to book" CTA and a
 * "Status: Scheduled" row.
 */

import { getEventPhase, getEventPresentation } from '@/lib/event-presentation'

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const FIXED_NOW = Date.UTC(2026, 4, 1, 12, 0, 0) // 2026-05-01T12:00:00Z

function isoDaysAgo(days: number): string {
  return new Date(FIXED_NOW - days * ONE_DAY_MS).toISOString()
}

function isoDaysFromNow(days: number): string {
  return new Date(FIXED_NOW + days * ONE_DAY_MS).toISOString()
}

const UPCOMING = { startDate: isoDaysFromNow(7), event_status: 'scheduled', eventStatus: 'scheduled' }
const ENDED = { startDate: isoDaysAgo(20), event_status: 'scheduled', eventStatus: 'scheduled' }
const CANCELLED_FUTURE = { startDate: isoDaysFromNow(3), event_status: 'cancelled', eventStatus: 'cancelled' }
const CANCELLED_PAST = { startDate: isoDaysAgo(3), event_status: 'cancelled', eventStatus: 'cancelled' }

describe('getEventPhase', () => {
  it('classifies a future scheduled event as upcoming', () => {
    expect(getEventPhase(UPCOMING, FIXED_NOW)).toBe('upcoming')
  })

  it('classifies a past scheduled event as ended', () => {
    expect(getEventPhase(ENDED, FIXED_NOW)).toBe('ended')
  })

  it('classifies a cancelled event as cancelled regardless of date', () => {
    expect(getEventPhase(CANCELLED_FUTURE, FIXED_NOW)).toBe('cancelled')
    expect(getEventPhase(CANCELLED_PAST, FIXED_NOW)).toBe('cancelled')
  })

  it('treats a sold out future event as still upcoming', () => {
    const soldOut = { startDate: isoDaysFromNow(2), event_status: 'sold_out', eventStatus: 'sold_out' }
    expect(getEventPhase(soldOut, FIXED_NOW)).toBe('upcoming')
  })
})

describe('getEventPresentation, ended events', () => {
  const presentation = getEventPresentation(ENDED, FIXED_NOW)

  it('switches off every booking surface', () => {
    expect(presentation.showBookingForm).toBe(false)
    expect(presentation.showBookingPolicy).toBe(false)
    expect(presentation.showBookingFaqs).toBe(false)
    expect(presentation.showBookingCtaBand).toBe(false)
    expect(presentation.showShareButton).toBe(false)
  })

  it('hides the "Status: Scheduled" row so the page cannot read as still going ahead', () => {
    expect(presentation.showStatusRow).toBe(false)
  })

  it('presents the facts strip as a historical record', () => {
    expect(presentation.factsVariant).toBe('historic')
  })

  it('omits offers from the JSON-LD so schema cannot contradict the page', () => {
    expect(presentation.includeSchemaOffers).toBe(false)
  })

  it('reports hasEnded', () => {
    expect(presentation.hasEnded).toBe(true)
  })
})

describe('getEventPresentation, upcoming events', () => {
  const presentation = getEventPresentation(UPCOMING, FIXED_NOW)

  it('shows the full booking experience', () => {
    expect(presentation).toMatchObject({
      phase: 'upcoming',
      hasEnded: false,
      showBookingForm: true,
      showBookingPolicy: true,
      showBookingFaqs: true,
      showBookingCtaBand: true,
      showShareButton: true,
      showStatusRow: true,
      factsVariant: 'live',
      includeSchemaOffers: true
    })
  })

  it('hides only the form, not the policy, when bookings are disabled', () => {
    const noBooking = { ...UPCOMING, bookings_enabled: false }
    const result = getEventPresentation(noBooking, FIXED_NOW)
    expect(result.showBookingForm).toBe(false)
    // The visitor can still ring up, so the policy and FAQs stay useful.
    expect(result.showBookingPolicy).toBe(true)
    expect(result.showBookingFaqs).toBe(true)
    expect(result.includeSchemaOffers).toBe(true)
  })

  it('hides the form once the online sales cutoff has passed', () => {
    const cutoffPassed = { ...UPCOMING, booking_cutoff_at: isoDaysAgo(1) }
    const result = getEventPresentation(cutoffPassed, FIXED_NOW)
    expect(result.showBookingForm).toBe(false)
    expect(result.showBookingPolicy).toBe(true)
  })
})

describe('getEventPresentation, cancelled events', () => {
  it('switches off booking surfaces but keeps the status row visible', () => {
    const result = getEventPresentation(CANCELLED_FUTURE, FIXED_NOW)
    expect(result.showBookingForm).toBe(false)
    expect(result.showBookingPolicy).toBe(false)
    expect(result.showBookingCtaBand).toBe(false)
    expect(result.includeSchemaOffers).toBe(false)
    // "Cancelled" is information the visitor needs.
    expect(result.showStatusRow).toBe(true)
  })

  it('reports hasEnded only when the date has also passed', () => {
    expect(getEventPresentation(CANCELLED_FUTURE, FIXED_NOW).hasEnded).toBe(false)
    expect(getEventPresentation(CANCELLED_PAST, FIXED_NOW).hasEnded).toBe(true)
  })
})
