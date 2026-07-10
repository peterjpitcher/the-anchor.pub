import fs from 'fs'
import path from 'path'
import { normaliseChristmasEnquiryTime } from '@/lib/christmas-enquiry'

function read(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('/christmas-parties booking journeys', () => {
  const pageSource = read('app/christmas-parties/page.tsx')
  const clientSource = read('app/christmas-parties/client-components.tsx')
  const heroSource = read('app/christmas-parties/christmas-hero-ctas.tsx')
  const apiSource = read('app/api/enquiry/christmas/route.ts')

  it('offers distinct party and pre-order meal journeys from the hero', () => {
    expect(heroSource).toContain("type ChristmasHeroMode = 'party' | 'meal'")
    expect(heroSource).toContain('Plan a Christmas party')
    expect(heroSource).toContain('Book lunch or dinner')
    expect(pageSource).toContain('Christmas parties and festive dining near Heathrow')
    expect(pageSource).toContain('sit-down Christmas lunch or dinner by pre-order')
  })

  it('captures lunch and dinner with suitable machine-readable times', () => {
    expect(clientSource).toContain("export type MealService = 'lunch' | 'dinner'")
    expect(clientSource).toContain("{ value: '12:00', label: '12:00 pm' }")
    expect(clientSource).toContain("{ value: '18:30', label: '6:30 pm' }")
    expect(clientSource).toContain('All sit-down Christmas lunches and dinners are pre-order only.')
    expect(clientSource).toContain('min={CHRISTMAS_BOOKING_START}')
    expect(clientSource).toContain('max={CHRISTMAS_BOOKING_END}')
  })

  it('keeps journey, service, format and source in the enquiry path', () => {
    expect(clientSource).toContain("journey: context.mode === 'meal' ? 'christmas_meal' : 'christmas_party'")
    expect(clientSource).toContain("service: context.mode === 'meal' ? context.service : undefined")
    expect(clientSource).toContain('source: context.source')
    expect(apiSource).toContain('Website Christmas journey:')
    expect(apiSource).toContain('Website CTA source:')
  })

  it('does not publish testimonials without a traceable approved source', () => {
    expect(clientSource).not.toContain('TestimonialSection')
    expect(clientSource).not.toContain('Sarah T.')
    expect(clientSource).not.toContain('James R.')
    expect(clientSource).not.toContain('Michelle K.')
  })
})

describe('Christmas management time normalisation', () => {
  it.each([
    ['18:30', '18:30'],
    ['6:30 pm', '18:30'],
    ['12:00 pm', '12:00'],
    ['12:00 am', '00:00'],
    ['Flexible', undefined],
    ['', undefined]
  ])('normalises %s to %s', (input, expected) => {
    expect(normaliseChristmasEnquiryTime(input)).toBe(expected)
  })
})
