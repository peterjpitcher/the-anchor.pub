import { buildEventSchema } from '@/lib/structured-data/event-schema'

const minimalEvent = {
  id: 'test-1',
  name: 'Test Event',
  startDate: '2026-06-01T19:00:00Z',
  endDate: '2026-06-01T22:00:00Z',
  offers: { price: '5', priceCurrency: 'GBP' }
} as any

describe('buildEventSchema', () => {
  it('includes a default ReserveAction when event has no potentialAction', () => {
    const schema = buildEventSchema(minimalEvent)
    const action = (schema as any).potentialAction
    expect(action?.['@type']).toBe('ReserveAction')
    expect(action?.target?.urlTemplate).toBe('https://www.the-anchor.pub/book-table')
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
