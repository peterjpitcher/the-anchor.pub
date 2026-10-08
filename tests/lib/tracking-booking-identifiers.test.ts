/**
 * No booking reference or booking id reaches Google Analytics.
 *
 * A reference is how the pub finds a named booking. Six events carried one,
 * and the purchase event used it as its transaction id, so an analytics
 * session could be joined to a person against the rule at the top of
 * lib/gtm-events.ts (site review, 7 October 2026).
 *
 * Every helper is driven with a reference and an id, and what lands in the
 * dataLayer and in the queue for /api/analytics is searched for both. A sale
 * is still counted once: the same booking always gives the same sale id.
 */
jest.mock('@/lib/cookies', () => ({ canUseCookieCategory: jest.fn(() => true) }))
jest.mock('@/lib/booking-attribution', () => ({ getBookingAttributionPayload: () => ({}) }))
jest.mock('@/lib/tracking/ga4-identity', () => ({ getGa4Identity: () => ({}) }))
jest.mock('@/lib/meta-pixel', () => ({ trackMetaBookingPurchase: jest.fn() }))

import * as gtmEvents from '@/lib/gtm-events'
import { dispatchTrackingEvent } from '@/lib/tracking/dispatcher'
import { trackMetaBookingPurchase } from '@/lib/meta-pixel'
import {
  analyticsSaleId,
  BOOKING_IDENTIFIER_FIELDS,
  isAnalyticsSaleId,
  stripBookingIdentifiers,
} from '@/lib/tracking/booking-identifiers'

const REFERENCE = 'TB-FIXTURE-REF-91'
const BOOKING_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae7'

function pushed(): Record<string, unknown>[] {
  return (window.dataLayer ?? []) as Record<string, unknown>[]
}

function expectNoIdentifier(payloads: unknown) {
  const serialised = JSON.stringify(payloads)
  expect(serialised).not.toContain(REFERENCE)
  expect(serialised).not.toContain(BOOKING_ID)
  for (const field of BOOKING_IDENTIFIER_FIELDS) expect(serialised).not.toContain(`"${field}"`)
}

beforeEach(() => {
  window.dataLayer = []
  jest.clearAllMocks()
})

describe('analyticsSaleId', () => {
  it('gives the same id for the same booking, and a different one for another', () => {
    expect(analyticsSaleId(REFERENCE)).toBe(analyticsSaleId(REFERENCE))
    expect(analyticsSaleId(` ${REFERENCE} `)).toBe(analyticsSaleId(REFERENCE))
    expect(analyticsSaleId(REFERENCE)).not.toBe(analyticsSaleId('TB-FIXTURE-REF-92'))
    expect(analyticsSaleId(BOOKING_ID)).not.toBe(analyticsSaleId(REFERENCE))
  })

  it('never contains the booking it was made from', () => {
    for (const key of [REFERENCE, BOOKING_ID, 'TB-1', '12345678']) {
      const saleId = analyticsSaleId(key) as string
      expect(isAnalyticsSaleId(saleId)).toBe(true)
      expect(saleId).toMatch(/^sale_[0-9a-f]{16}$/)
      expect(saleId.toLowerCase()).not.toContain(key.toLowerCase())
    }
  })

  it('changes nothing when applied a second time (browser, then server)', () => {
    const once = analyticsSaleId(REFERENCE)
    expect(analyticsSaleId(once)).toBe(once)
  })

  it('does not collide across a few thousand references', () => {
    const seen = new Set<string>()
    for (let index = 0; index < 5000; index += 1) seen.add(analyticsSaleId(`TB-${index}`) as string)
    expect(seen.size).toBe(5000)
  })

  it.each([undefined, null, '', '   ', {}, [], true])('gives nothing for %p', value => {
    expect(analyticsSaleId(value)).toBeUndefined()
  })
})

describe('stripBookingIdentifiers', () => {
  it('removes every identifier field and turns transaction_id into a sale id', () => {
    const cleaned = stripBookingIdentifiers({
      event: 'purchase',
      booking_reference: REFERENCE,
      booking_id: BOOKING_ID,
      table_booking_id: BOOKING_ID,
      bookingReference: REFERENCE,
      bookingId: BOOKING_ID,
      tableBookingId: BOOKING_ID,
      transaction_id: REFERENCE,
      value: 100,
      party_size: 4,
    })

    expect(cleaned).toEqual({
      event: 'purchase',
      transaction_id: analyticsSaleId(REFERENCE),
      value: 100,
      party_size: 4,
    })
    expectNoIdentifier(cleaned)
  })

  it('drops a transaction_id it cannot use rather than passing it on', () => {
    expect(stripBookingIdentifiers({ event: 'purchase', transaction_id: { ref: REFERENCE } })).toEqual({
      event: 'purchase',
    })
  })
})

describe('the dispatcher', () => {
  it('corrects an event that forgets the rule, in the dataLayer and in what is sent on', () => {
    // No sendBeacon, so the batch goes by fetch and its body can be read here.
    Object.defineProperty(navigator, 'sendBeacon', { configurable: true, value: undefined })
    const originalFetch = global.fetch
    const fetchMock = jest.fn().mockResolvedValue({ ok: true })
    ;(global as any).fetch = fetchMock

    try {
      dispatchTrackingEvent({
        event: 'a_future_event',
        booking_reference: REFERENCE,
        booking_id: BOOKING_ID,
        transaction_id: REFERENCE,
      })
      window.dispatchEvent(new Event('pagehide'))

      expect(pushed()).toHaveLength(1)
      expect(pushed()[0].transaction_id).toBe(analyticsSaleId(REFERENCE))
      expectNoIdentifier(pushed())

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchMock.mock.calls[0][0]).toBe('/api/analytics')
      const sent = JSON.parse(String(fetchMock.mock.calls[0][1].body))
      expect(sent.events).toHaveLength(1)
      expect(sent.events[0].event).toBe('a_future_event')
      expect(sent.events[0].transaction_id).toBe(analyticsSaleId(REFERENCE))
      expectNoIdentifier(sent)
    } finally {
      global.fetch = originalFetch
    }
  })
})

describe('every booking helper in lib/gtm-events.ts', () => {
  it('table booking: funnel, completed, Sunday roast completed', () => {
    for (const step of ['view', 'start', 'availability_check', 'details_entered', 'submit', 'success', 'error'] as const) {
      gtmEvents.trackTableBookingFunnel({
        step,
        partySize: 4,
        bookingDate: '2026-11-08',
        bookingTime: '13:00',
        bookingReference: REFERENCE,
        bookingType: 'sunday_roast',
        source: 'fixture',
        deviceType: 'mobile',
      })
    }

    const names = pushed().map(payload => payload.event)
    expect(names).toEqual(expect.arrayContaining([
      'table_booking_funnel',
      'table_booking_completed',
      'sunday_roast_booking_completed',
    ]))
    expectNoIdentifier(pushed())
  })

  it('table booking: the Meta conversion still gets the reference, which is how it matches the server copy', () => {
    gtmEvents.trackTableBookingFunnel({
      step: 'success',
      partySize: 2,
      bookingReference: REFERENCE,
      source: 'fixture',
      deviceType: 'desktop',
    })

    expect(trackMetaBookingPurchase).toHaveBeenCalledWith(expect.objectContaining({ eventId: REFERENCE }))
    expectNoIdentifier(pushed())
  })

  it('event booking: every funnel step', () => {
    for (const step of ['form_view', 'cta_click', 'phone_entered', 'submit', 'confirmed', 'blocked'] as const) {
      gtmEvents.trackEventBookingFunnelStep({
        step,
        eventId: 'event-fixture',
        eventName: 'Fixture night',
        bookingId: BOOKING_ID,
        source: 'fixture',
      })
    }

    expect(pushed().length).toBeGreaterThanOrEqual(6)
    expectNoIdentifier(pushed())
  })

  it('event booking: completed and purchase, with the sale counted under one stable id', () => {
    const complete = () =>
      gtmEvents.trackEventBookingComplete({
        eventId: 'event-fixture',
        eventName: 'Fixture night',
        tickets: 2,
        totalValue: 20,
        bookingId: BOOKING_ID,
      })
    complete()
    complete()

    const purchases = pushed().filter(payload => payload.event === 'purchase')
    expect(purchases).toHaveLength(2)
    expect(purchases[0].transaction_id).toBe(analyticsSaleId(BOOKING_ID))
    expect(purchases[1].transaction_id).toBe(purchases[0].transaction_id)
    // The event's own id is a show, not a person, and stays.
    expect(purchases[0].event_id).toBe('event-fixture')
    expect(pushed().some(payload => payload.event === 'event_booking_completed')).toBe(true)
    expectNoIdentifier(pushed())
  })

  it('a purchase with no booking id carries no transaction_id at all', () => {
    gtmEvents.trackEventBookingComplete({
      eventId: 'event-fixture',
      eventName: 'Fixture night',
      tickets: 1,
      bookingId: null,
    })

    const purchase = pushed().find(payload => payload.event === 'purchase')
    expect(purchase).toBeDefined()
    expect(purchase).not.toHaveProperty('transaction_id')
  })
})
