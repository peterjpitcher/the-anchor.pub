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
    // Both journeys must be reachable from the hero. Asserted on the mode each
    // button dispatches, not on its label: the party CTA was reworded to
    // "Check your date and get a quote" on 15 August 2026, and the same
    // free-to-reword rule already stated for the H1 below applies to buttons.
    expect(heroSource).toContain("dispatchChristmasOpenForm({ mode: 'party'")
    expect(heroSource).toContain("dispatchChristmasOpenForm({ mode: 'meal'")
    expect(heroSource).toContain('Book lunch or dinner')
    // The H1 must name both journeys, because a visitor who wants a sit-down
    // Christmas dinner bounces off a heading that only sells parties. The exact
    // wording is marketing copy and is free to change; naming both is the rule.
    const h1 = pageSource.match(/title="(Christmas[^"]*)"/)?.[1] ?? ''
    expect(h1).toMatch(/Christmas parties/i)
    expect(h1).toMatch(/Christmas dinner/i)
    // The meal journey is sold on courses chosen per guest. The blanket
    // pre-order rule went on 21 July 2026, and the whole-table course tier it
    // was replaced by went on 4 August 2026.
    expect(pageSource).toContain('Each guest picks 1, 2 or 3 courses')
    expect(pageSource).not.toMatch(/pre-order only/i)
    expect(pageSource).not.toMatch(/courses for groups of/i)
  })

  it('captures lunch and dinner with suitable machine-readable times', () => {
    expect(clientSource).toContain("export type MealService = 'lunch' | 'dinner'")
    expect(clientSource).toContain("{ value: '12:00', label: '12:00 pm' }")
    expect(clientSource).toContain("{ value: '18:30', label: '6:30 pm' }")
    expect(clientSource).toContain('Courses are chosen per person. A main each, starter and dessert optional.')
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

  it('captures the expected course count per guest, and keeps the wire values stable', () => {
    // The stored values are unchanged so the management app keeps reading the
    // enquiry it already understands. Only the wording moved to per person.
    expect(clientSource).toContain("export type CourseTier = 'undecided' | 'one_course' | 'two_course' | 'three_course'")
    expect(clientSource).toContain('courseTier: event.target.value as CourseTier')
    expect(clientSource).toContain('How many courses per guest?')
    expect(apiSource).toContain('const VALID_COURSE_TIERS')
    expect(apiSource).toContain("one_course: 'Mostly 1 course per guest'")
    expect(apiSource).toContain("two_course: 'Mostly 2 courses per guest'")
    expect(apiSource).toContain("three_course: 'Mostly 3 courses per guest'")
  })

  it('asks for a pre-order on every sit-down booking, whatever the courses', () => {
    // Owner-confirmed 2026-08-04: a main per guest is always captured, so the
    // old "one course needs no pre-order" branch no longer exists.
    expect(apiSource).toContain(
      "'Yes, per person. A main for every guest, starter and dessert optional.'"
    )
    expect(stripComments(apiSource)).not.toMatch(/pre-book only/i)
    expect(stripComments(clientSource)).not.toMatch(/pre-book only/i)
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
    // The three names below were invented testimonials that once shipped on this
    // page. They must never return, whatever else changes.
    expect(clientSource).not.toContain('Sarah T.')
    expect(clientSource).not.toContain('James R.')
    expect(clientSource).not.toContain('Michelle K.')

    // Testimonials themselves are allowed from 15 August 2026, when the owner
    // supplied the real Google review export. The rule this guard's name states
    // is traceability, so it enforces that rather than the blunt proxy of
    // banning the component: quotes must come from lib/google-reviews.ts and
    // may never be hand-written here. tests/unit/testimonials-are-real.test.ts
    // applies the same rule to every other page on the site.
    expect(clientSource).not.toMatch(/quote:\s*["'`]/)
    expect(clientSource).toContain('getReviewsByTopic')
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
