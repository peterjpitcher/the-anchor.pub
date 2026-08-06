/**
 * Event JSON-LD lifecycle tests.
 *
 * Regression guard for the live bug on /events/music-bingo-2026-07-17: the page
 * displayed "This event has ended" while its markup emitted
 * `offers.availability: InStock`, a ReserveAction and a `validFrom` stamped at
 * request time. Markup that contradicts the visible page is the one failure
 * mode here with real downside, so it is locked in with tests.
 *
 * Note: schema.org has no "completed" event status. The EventStatusType
 * enumeration is Scheduled / Cancelled / Postponed / Rescheduled / MovedOnline.
 * A past event correctly stays EventScheduled; what must go is the live offer.
 */

import { buildEventSchema } from '@/lib/structured-data/event-schema'
import type { Event } from '@/lib/api'

const ONE_DAY_MS = 24 * 60 * 60 * 1000

function buildEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'evt-1',
    slug: 'music-bingo-test',
    name: 'Music Bingo',
    description: 'A music bingo night at The Anchor.',
    startDate: new Date(Date.now() + 7 * ONE_DAY_MS).toISOString(),
    event_status: 'scheduled',
    eventStatus: 'scheduled',
    remainingAttendeeCapacity: 24,
    offers: {
      '@type': 'Offer',
      price: '5',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString(),
      url: 'https://www.the-anchor.pub/events/music-bingo-test'
    },
    ...overrides
  } as Event
}

describe('buildEventSchema, upcoming events', () => {
  const schema = buildEventSchema(buildEvent())

  it('advertises the offer', () => {
    expect(schema.offers).toBeDefined()
    expect(schema.offers).toMatchObject({ availability: 'https://schema.org/InStock' })
  })

  it('includes a reserve action and remaining capacity', () => {
    expect(schema.potentialAction).toBeDefined()
    expect(schema.remainingAttendeeCapacity).toBe(24)
  })

  it('keeps eventStatus as scheduled', () => {
    expect(schema.eventStatus).toBe('https://schema.org/EventScheduled')
  })
})

describe('buildEventSchema, past events', () => {
  const schema = buildEventSchema(
    buildEvent({ startDate: new Date(Date.now() - 20 * ONE_DAY_MS).toISOString() })
  )

  it('omits offers entirely so nothing claims tickets are on sale', () => {
    expect(schema.offers).toBeUndefined()
  })

  it('omits the reserve action', () => {
    expect(schema.potentialAction).toBeUndefined()
  })

  it('omits remaining capacity, which would imply seats are still available', () => {
    expect(schema.remainingAttendeeCapacity).toBeUndefined()
  })

  it('still describes the event, so the page remains valid Event markup', () => {
    expect(schema['@type']).toBe('Event')
    expect(schema.name).toBe('Music Bingo')
    expect(schema.startDate).toBeDefined()
    expect(schema.location).toBeDefined()
  })

  it('leaves eventStatus as scheduled, since schema.org has no completed status', () => {
    expect(schema.eventStatus).toBe('https://schema.org/EventScheduled')
  })
})

describe('buildEventSchema, cancelled events', () => {
  const schema = buildEventSchema(
    buildEvent({
      startDate: new Date(Date.now() + 3 * ONE_DAY_MS).toISOString(),
      event_status: 'cancelled',
      eventStatus: 'cancelled'
    })
  )

  it('marks the event cancelled and drops the offer', () => {
    expect(schema.eventStatus).toBe('https://schema.org/EventCancelled')
    expect(schema.offers).toBeUndefined()
    expect(schema.potentialAction).toBeUndefined()
  })
})

describe('buildEventSchema, multi-ticket past events', () => {
  it('omits the per-ticket offer array too', () => {
    const schema = buildEventSchema(
      buildEvent({
        startDate: new Date(Date.now() - 40 * ONE_DAY_MS).toISOString(),
        ticket_types: [
          { name: 'Standard', price: 5 },
          { name: 'Premium', price: 12 }
        ]
      } as Partial<Event>)
    )
    expect(schema.offers).toBeUndefined()
  })
})
