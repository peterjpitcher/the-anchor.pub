import fs from 'fs'
import path from 'path'

function read(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('hero template regressions', () => {
  it('uses HeroWrapper for christmas parties and removes direct HeroSection usage from client template', () => {
    const pageSource = read('app/christmas-parties/page.tsx')
    const clientSource = read('app/christmas-parties/client-components.tsx')

    expect(pageSource).toMatch(/<HeroWrapper/)
    expect(clientSource).not.toMatch(/<HeroSection\b/)
  })

  it('uses HeroWrapper for event detail pages', () => {
    const source = read('app/events/[id]/page.tsx')
    expect(source).toMatch(/<HeroWrapper/)
  })

  it('keeps private-hire child pages on promo hero variant', () => {
    const engagement = read('app/private-hire/engagement-parties/page.tsx')
    const milestone = read('app/private-hire/milestone-birthdays/page.tsx')
    const genderReveal = read('app/private-hire/gender-reveal/page.tsx')
    const retirement = read('app/private-hire/retirement-parties/page.tsx')

    expect(engagement).toMatch(/route="\/private-hire\/engagement-parties"[\s\S]*?variant="promo"/)
    expect(milestone).toMatch(/route="\/private-hire\/milestone-birthdays"[\s\S]*?variant="promo"/)
    expect(genderReveal).toMatch(/route="\/private-hire\/gender-reveal"[\s\S]*?variant="promo"/)
    expect(retirement).toMatch(/route="\/private-hire\/retirement-parties"[\s\S]*?variant="promo"/)
  })

  it('uses booking-intent primary CTAs on terminal hero templates', () => {
    const terminal2 = read('app/near-heathrow/terminal-2/page.tsx')
    const terminal3 = read('app/near-heathrow/terminal-3/page.tsx')
    const terminal5 = read('app/near-heathrow/terminal-5/page.tsx')

    expect(terminal2).toMatch(/route="\/near-heathrow\/terminal-2"[\s\S]*?primaryCta=\{[\s\S]*?<BookTableButton/)
    expect(terminal3).toMatch(/route="\/near-heathrow\/terminal-3"[\s\S]*?primaryCta=\{[\s\S]*?<BookTableButton/)
    expect(terminal5).toMatch(/route="\/near-heathrow\/terminal-5"[\s\S]*?primaryCta=\{[\s\S]*?<BookTableButton/)
  })

  it('uses booking-intent primary CTAs on local pub hero templates', () => {
    const bedfont = read('app/bedfont-pub/page.tsx')
    const egham = read('app/egham-pub/page.tsx')
    const feltham = read('app/feltham-pub/page.tsx')
    const staines = read('app/staines-pub/page.tsx')
    const heathrowHotels = read('app/heathrow-hotels-pub/page.tsx')

    expect(bedfont).toMatch(/route="\/bedfont-pub"[\s\S]*?primaryCta=\{[\s\S]*?<BookTableButton/)
    expect(egham).toMatch(/route="\/egham-pub"[\s\S]*?primaryCta=\{[\s\S]*?<BookTableButton/)
    expect(feltham).toMatch(/route="\/feltham-pub"[\s\S]*?primaryCta=\{[\s\S]*?<BookTableButton/)
    expect(staines).toMatch(/route="\/staines-pub"[\s\S]*?primaryCta=\{[\s\S]*?<BookTableButton/)
    expect(heathrowHotels).toMatch(/route="\/heathrow-hotels-pub"[\s\S]*?primaryCta=\{[\s\S]*?<BookTableButton/)
  })
})
