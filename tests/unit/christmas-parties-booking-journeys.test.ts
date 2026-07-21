import fs from 'fs'
import path from 'path'
import { normaliseChristmasEnquiryTime } from '@/lib/christmas-enquiry'

function read(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

/** Source with block and line comments removed, so notes about retired
 * products do not read as the products still being offered. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

describe('/christmas-parties booking journeys', () => {
  const pageSource = read('app/christmas-parties/page.tsx')
  const clientSource = read('app/christmas-parties/client-components.tsx')
  const heroSource = read('app/christmas-parties/christmas-hero-ctas.tsx')
  const apiSource = read('app/api/enquiry/christmas/route.ts')

  it('offers distinct party and sit-down meal journeys from the hero', () => {
    expect(heroSource).toContain("type ChristmasHeroMode = 'party' | 'meal'")
    expect(heroSource).toContain('Plan a Christmas party')
    expect(heroSource).toContain('Book lunch or dinner')
    expect(pageSource).toContain('Christmas parties near Heathrow, Staines and Surrey')
    // The meal journey is now sold on the three course tiers rather than on a
    // blanket pre-order rule, which was retired on 21 July 2026.
    expect(pageSource).toContain('1, 2 or 3 courses')
    expect(pageSource).not.toMatch(/pre-order only/i)
  })

  it('captures lunch and dinner with suitable machine-readable times', () => {
    expect(clientSource).toContain("export type MealService = 'lunch' | 'dinner'")
    expect(clientSource).toContain("{ value: '12:00', label: '12:00 pm' }")
    expect(clientSource).toContain("{ value: '18:30', label: '6:30 pm' }")
    expect(clientSource).toContain('1 course is pre-book only. 2 and 3 course are pre-book and pre-order.')
  })

  it('bounds both enquiry date pickers by the season, not by hardcoded dates', () => {
    // The window is owner-confirmed data, so the form must read it from the
    // season prop. Two date inputs exist (main form and lightbox) and both are
    // bounded, including the 24 hour notice floor carried in minEnquiryDate.
    const minBounds = clientSource.match(/min=\{season\.minEnquiryDate\}/g) || []
    const maxBounds = clientSource.match(/max=\{season\.maxEnquiryDate\}/g) || []

    expect(minBounds).toHaveLength(2)
    expect(maxBounds).toHaveLength(2)
    expect(clientSource).not.toContain('CHRISTMAS_BOOKING_START')
    expect(clientSource).not.toContain('CHRISTMAS_BOOKING_END')
    expect(clientSource).not.toContain('2026-11-01')
    expect(clientSource).not.toContain('2026-12-23')
  })

  it('captures the course tier so the pre-order rule can be applied per booking', () => {
    expect(clientSource).toContain("export type CourseTier = 'undecided' | 'one_course' | 'two_course' | 'three_course'")
    expect(clientSource).toContain('courseTier: event.target.value as CourseTier')
    expect(apiSource).toContain('const VALID_COURSE_TIERS')
    expect(apiSource).toContain("one_course: '1 course (pre-book only, no pre-order)'")
    expect(apiSource).toContain("two_course: '2 course (pre-book and pre-order)'")
    expect(apiSource).toContain("three_course: '3 course (pre-book and pre-order)'")
  })

  it('does not accept discontinued party formats', () => {
    // Comments deliberately record what was withdrawn, so only live code and
    // copy are checked here.
    const clientCode = stripComments(clientSource)
    const apiCode = stripComments(apiSource)

    expect(apiCode).not.toContain('shared_party')
    expect(clientCode).not.toContain('shared_party')
    expect(clientCode).not.toMatch(/party\s+night/i)
    expect(clientCode).not.toMatch(/trimmings\s+board/i)
    expect(clientCode).not.toMatch(/\bxl\s+board\b/i)
    expect(clientCode).not.toMatch(/\bbundle\s+a\b/i)
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
