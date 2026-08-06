import { buildEventSchema } from '@/lib/structured-data/event-schema'
import { CATEGORY_ROUTES } from '@/lib/event-seo-strategy'

// These tests cover offer and action sanitisation, which only applies to an
// event that is still bookable. The date must therefore stay in the future.
// It was previously hardcoded to 2026-06-01, which silently became a past date
// and made every assertion here depend on when the suite was run.
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const futureStart = new Date(Date.now() + 30 * ONE_DAY_MS)
const futureEnd = new Date(futureStart.getTime() + 3 * 60 * 60 * 1000)

const minimalEvent = {
  id: 'test-1',
  name: 'Test Event',
  startDate: futureStart.toISOString(),
  endDate: futureEnd.toISOString(),
  offers: { price: '5', priceCurrency: 'GBP' }
} as any

const categoryPageUrl = `https://www.the-anchor.pub${Object.values(CATEGORY_ROUTES)[0]}`

describe('buildEventSchema', () => {
  it('includes a default ReserveAction when event has no potentialAction', () => {
    const schema = buildEventSchema(minimalEvent)
    const action = (schema as any).potentialAction
    expect(action?.['@type']).toBe('ReserveAction')
    expect(action?.target?.urlTemplate).toBe('https://www.the-anchor.pub/events/test-1')
  })

  it('preserves event.potentialAction when provided', () => {
    const eventWithAction = {
      ...minimalEvent,
      potentialAction: { '@type': 'ReserveAction', target: { urlTemplate: 'https://custom.url' } }
    }
    const schema = buildEventSchema(eventWithAction)
    const action = (schema as any).potentialAction
    expect(action?.target?.urlTemplate).toBe('https://custom.url')
  })
})

describe('buildEventSchema — multiple ticket types', () => {
  it('emits one Offer per type when prices differ', () => {
    const event = {
      ...minimalEvent,
      ticket_types: [
        { id: 'adult', name: 'Adult', price: 12, sort_order: 0 },
        { id: 'child', name: 'Child', price: 6, sort_order: 1 }
      ]
    }
    const schema = buildEventSchema(event) as any
    expect(Array.isArray(schema.offers)).toBe(true)
    expect(schema.offers).toHaveLength(2)
    expect(schema.offers[0]).toMatchObject({ '@type': 'Offer', name: 'Adult', price: '12.00', priceCurrency: 'GBP' })
    expect(schema.offers[1]).toMatchObject({ '@type': 'Offer', name: 'Child', price: '6.00' })
  })

  it('keeps a single Offer object when there is one type', () => {
    const event = {
      ...minimalEvent,
      ticket_types: [{ id: 'std', name: 'Standard', price: 5, sort_order: 0 }]
    }
    const schema = buildEventSchema(event) as any
    expect(Array.isArray(schema.offers)).toBe(false)
    expect(schema.offers['@type']).toBe('Offer')
  })
})

describe('buildEventSchema — booking URL sanitisation', () => {
  it('uses bookingUrl when it is a valid external URL', () => {
    const event = {
      ...minimalEvent,
      bookingUrl: 'https://designmynight.com/book/123'
    }
    const schema = buildEventSchema(event) as any
    expect(schema.offers.url).toBe('https://designmynight.com/book/123')
  })

  it('rejects bookingUrl pointing to a category page and falls back to eventUrl', () => {
    const event = {
      ...minimalEvent,
      slug: 'test-quiz',
      bookingUrl: categoryPageUrl
    }
    const schema = buildEventSchema(event) as any
    expect(schema.offers.url).not.toContain(Object.values(CATEGORY_ROUTES)[0])
    expect(schema.offers.url).toContain('/events/')
  })

  it('falls back to offers.url when bookingUrl is null', () => {
    const event = {
      ...minimalEvent,
      bookingUrl: null,
      offers: {
        ...minimalEvent.offers,
        url: 'https://designmynight.com/offers/456'
      }
    }
    const schema = buildEventSchema(event) as any
    expect(schema.offers.url).toBe('https://designmynight.com/offers/456')
  })

  it('rejects offers.url pointing to a category page', () => {
    const event = {
      ...minimalEvent,
      slug: 'test-quiz',
      bookingUrl: null,
      offers: {
        ...minimalEvent.offers,
        url: categoryPageUrl
      }
    }
    const schema = buildEventSchema(event) as any
    expect(schema.offers.url).toContain('/events/')
  })

  it('falls back to eventUrl when both bookingUrl and offers.url are absent', () => {
    const event = {
      ...minimalEvent,
      slug: 'my-event',
      bookingUrl: null,
      offers: { ...minimalEvent.offers, url: undefined }
    }
    const schema = buildEventSchema(event) as any
    expect(schema.offers.url).toBe('https://www.the-anchor.pub/events/my-event')
  })

  it('rejects internal management booking URLs', () => {
    const event = {
      ...minimalEvent,
      slug: 'managed-event',
      bookingUrl: 'https://management.orangejelly.co.uk/bookings/events/123'
    }
    const schema = buildEventSchema(event) as any

    expect(schema.offers.url).toBe('https://www.the-anchor.pub/events/managed-event')
  })
})

describe('buildEventSchema — potentialAction sanitisation', () => {
  it('rejects potentialAction with category page urlTemplate', () => {
    const event = {
      ...minimalEvent,
      potentialAction: {
        '@type': 'ReserveAction' as const,
        target: {
          '@type': 'EntryPoint' as const,
          urlTemplate: categoryPageUrl,
          inLanguage: 'en-GB'
        },
        result: { '@type': 'Reservation' as const, name: 'Booking' }
      }
    }
    const schema = buildEventSchema(event) as any
    // Should fall back to the default ReserveAction, not the category URL
    expect(schema.potentialAction.target.urlTemplate).not.toContain(
      Object.values(CATEGORY_ROUTES)[0]
    )
  })

  it('preserves potentialAction with valid external URL', () => {
    const event = {
      ...minimalEvent,
      potentialAction: {
        '@type': 'ReserveAction' as const,
        target: {
          '@type': 'EntryPoint' as const,
          urlTemplate: 'https://booking.example.com/reserve',
          inLanguage: 'en-GB'
        },
        result: { '@type': 'Reservation' as const, name: 'Booking' }
      }
    }
    const schema = buildEventSchema(event) as any
    expect(schema.potentialAction.target.urlTemplate).toBe(
      'https://booking.example.com/reserve'
    )
  })

  it('rejects potentialAction with internal management urlTemplate', () => {
    const event = {
      ...minimalEvent,
      slug: 'managed-event',
      potentialAction: {
        '@type': 'ReserveAction' as const,
        target: {
          '@type': 'EntryPoint' as const,
          urlTemplate: 'https://management.orangejelly.co.uk/bookings/events/123',
          inLanguage: 'en-GB'
        },
        result: { '@type': 'Reservation' as const, name: 'Booking' }
      }
    }
    const schema = buildEventSchema(event) as any

    expect(schema.potentialAction.target.urlTemplate).toBe(
      'https://www.the-anchor.pub/events/managed-event'
    )
  })
})

describe('buildEventSchema — mainEntityOfPage sanitisation', () => {
  it('overrides mainEntityOfPage @id when it points to a category page', () => {
    const event = {
      ...minimalEvent,
      slug: 'test-quiz',
      mainEntityOfPage: {
        '@type': 'WebPage' as const,
        '@id': categoryPageUrl
      }
    }
    const schema = buildEventSchema(event) as any
    expect(schema.mainEntityOfPage['@id']).toContain('/events/')
    expect(schema.mainEntityOfPage['@id']).not.toContain(
      Object.values(CATEGORY_ROUTES)[0]
    )
  })

  it('preserves mainEntityOfPage with valid event URL', () => {
    const event = {
      ...minimalEvent,
      mainEntityOfPage: {
        '@type': 'WebPage' as const,
        '@id': 'https://www.the-anchor.pub/events/test-event'
      }
    }
    const schema = buildEventSchema(event) as any
    expect(schema.mainEntityOfPage['@id']).toBe(
      'https://www.the-anchor.pub/events/test-event'
    )
  })
})
