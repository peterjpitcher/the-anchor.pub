import fs from 'fs'
import path from 'path'

function read(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

/**
 * After the redesign (Phase 2.1) every interior page renders the single
 * `InteriorHero` component. These regressions guard the migration: each page
 * still renders exactly one hero, carries the correct breadcrumb (`crumb`) and
 * title, and booking-led pages keep a booking-intent primary CTA
 * (`BookTableButton` / `/book-table`).
 */
describe('hero template regressions', () => {
  it('uses InteriorHero for christmas parties and removes legacy hero usage from client template', () => {
    const pageSource = read('app/christmas-parties/page.tsx')
    const clientSource = read('app/christmas-parties/client-components.tsx')

    expect(pageSource).toMatch(/<InteriorHero/)
    expect(pageSource).toMatch(/crumb="Christmas Parties"/)
    // The client template must not render its own hero band.
    expect(clientSource).not.toMatch(/<HeroSection\b/)
    expect(clientSource).not.toMatch(/<InteriorHero\b/)
  })

  it('uses InteriorHero for event detail pages', () => {
    const source = read('app/events/[id]/page.tsx')
    expect(source).toMatch(/<InteriorHero/)
    // Breadcrumb falls back to the What's On hub when an event has no category.
    expect(source).toMatch(/crumb=\{event\.category\?\.name \?\? "What's On"\}/)
  })

  it('keeps private-hire child pages on the InteriorHero with the correct crumb', () => {
    const engagement = read('app/private-hire/engagement-parties/page.tsx')
    const milestone = read('app/private-hire/milestone-birthdays/page.tsx')
    const genderReveal = read('app/private-hire/gender-reveal/page.tsx')
    const retirement = read('app/private-hire/retirement-parties/page.tsx')

    expect(engagement).toMatch(/<InteriorHero[\s\S]*?crumb="Engagement Parties"/)
    expect(milestone).toMatch(/<InteriorHero[\s\S]*?crumb="Milestone Birthdays"/)
    expect(genderReveal).toMatch(/<InteriorHero[\s\S]*?crumb="Gender Reveal"/)
    expect(retirement).toMatch(/<InteriorHero[\s\S]*?crumb="Retirement Parties"/)
  })

  it('uses booking-intent primary CTAs on terminal hero templates', () => {
    const terminal2 = read('app/near-heathrow/terminal-2/page.tsx')
    const terminal3 = read('app/near-heathrow/terminal-3/page.tsx')
    const terminal5 = read('app/near-heathrow/terminal-5/page.tsx')

    expect(terminal2).toMatch(/<InteriorHero[\s\S]*?crumb="Near Heathrow"[\s\S]*?actions=\{[\s\S]*?<BookTableButton/)
    expect(terminal3).toMatch(/<InteriorHero[\s\S]*?crumb="Near Heathrow"[\s\S]*?actions=\{[\s\S]*?<BookTableButton/)
    expect(terminal5).toMatch(/<InteriorHero[\s\S]*?crumb="Near Heathrow"[\s\S]*?actions=\{[\s\S]*?<BookTableButton/)
  })

  it('uses booking-intent primary CTAs on local pub hero templates', () => {
    const bedfont = read('app/bedfont-pub/page.tsx')
    const egham = read('app/egham-pub/page.tsx')
    const feltham = read('app/feltham-pub/page.tsx')
    const staines = read('app/staines-pub/page.tsx')
    const heathrowHotels = read('app/heathrow-hotels-pub/page.tsx')

    expect(bedfont).toMatch(/<InteriorHero[\s\S]*?crumb="Bedfont"[\s\S]*?actions=\{[\s\S]*?<BookTableButton/)
    expect(egham).toMatch(/<InteriorHero[\s\S]*?crumb="Egham"[\s\S]*?actions=\{[\s\S]*?<BookTableButton/)
    expect(feltham).toMatch(/<InteriorHero[\s\S]*?crumb="Feltham"[\s\S]*?actions=\{[\s\S]*?<BookTableButton/)
    expect(staines).toMatch(/<InteriorHero[\s\S]*?crumb="Staines"[\s\S]*?actions=\{[\s\S]*?<BookTableButton/)
    expect(heathrowHotels).toMatch(/<InteriorHero[\s\S]*?crumb="Hotels"[\s\S]*?actions=\{[\s\S]*?<BookTableButton/)
  })
})
