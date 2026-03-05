import { quizNightEventSeries, bingoEventSeries, specialAnnouncementSchema, webSiteSchema } from '@/lib/schema'
import { getEnhancedSchemas } from '@/lib/schema-with-reviews'

// Mock next/cache so unstable_cache passes through the function directly in tests
jest.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
}))

// Mock the API so tests don't make real network calls
jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: jest.fn().mockResolvedValue(null),
  },
}))

describe('schema dates', () => {
  it('quizNightEventSeries endDate is in the future', () => {
    const endDate = new Date(quizNightEventSeries.endDate as string)
    expect(endDate.getTime()).toBeGreaterThan(Date.now() + 90 * 24 * 60 * 60 * 1000)
  })

  it('bingoEventSeries endDate is in the future', () => {
    const endDate = new Date(bingoEventSeries.endDate as string)
    expect(endDate.getTime()).toBeGreaterThan(Date.now() + 90 * 24 * 60 * 60 * 1000)
  })

  it('specialAnnouncementSchema expires in the future', () => {
    const expires = new Date(specialAnnouncementSchema.expires as string)
    expect(expires.getTime()).toBeGreaterThan(Date.now() + 90 * 24 * 60 * 60 * 1000)
  })
})

describe('webSiteSchema', () => {
  it('does not include a potentialAction SearchAction', () => {
    expect(webSiteSchema).not.toHaveProperty('potentialAction')
  })
})

describe('priceRange', () => {
  it('localBusinessSchema uses pound-sign priceRange', async () => {
    const schemas = await getEnhancedSchemas()
    expect((schemas.localBusinessSchema as any).priceRange).toBe('££')
  })
})

describe('acceptsReservations', () => {
  it('localBusinessSchema acceptsReservations is boolean true', async () => {
    const schemas = await getEnhancedSchemas()
    expect((schemas.localBusinessSchema as any).acceptsReservations).toBe(true)
    expect(typeof (schemas.localBusinessSchema as any).acceptsReservations).toBe('boolean')
  })
})

describe('ReserveAction', () => {
  it('localBusinessSchema has potentialAction ReserveAction targeting /book-table', async () => {
    const schemas = await getEnhancedSchemas()
    const action = (schemas.localBusinessSchema as any).potentialAction
    expect(action?.['@type']).toBe('ReserveAction')
    expect(action?.target?.urlTemplate).toBe('https://www.the-anchor.pub/book-table')
    expect(action?.result?.['@type']).toBe('FoodEstablishmentReservation')
  })
})

describe('event series ReserveAction', () => {
  it('quizNightEventSeries has potentialAction ReserveAction', () => {
    const action = (quizNightEventSeries as any).potentialAction
    expect(action?.['@type']).toBe('ReserveAction')
    expect(action?.target?.urlTemplate).toBe('https://www.the-anchor.pub/book-table')
  })

  it('bingoEventSeries has potentialAction ReserveAction', () => {
    const action = (bingoEventSeries as any).potentialAction
    expect(action?.['@type']).toBe('ReserveAction')
    expect(action?.target?.urlTemplate).toBe('https://www.the-anchor.pub/book-table')
  })
})
