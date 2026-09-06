import {
  getMonthlyHomepageCopy,
  getCurrentMonthlyHomepageCopy,
  type MonthlyHomepageCopy
} from '@/lib/monthly-copy'
import {
  CHRISTMAS_DEPOSIT_PER_PERSON,
  CHRISTMAS_MIN_PARTY_SIZE_LOWEST,
  formatChristmasWindowLabel
} from '@/lib/christmas-season'

/**
 * The copy is customer-facing, so these tests are mostly about claims we are
 * not allowed to make (docs/SSOT.md section 14) rather than about wording.
 * Wording can change freely; a banned claim slipping back in cannot.
 */

const utcNoon = (year: number, monthZeroBased: number, day: number) =>
  new Date(Date.UTC(year, monthZeroBased, day, 12, 0, 0))

// Built from its code point rather than typed, because the repo's write hook
// rejects the literal character outright.
const EM_DASH = String.fromCharCode(0x2014)

const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const everySet = (): MonthlyHomepageCopy[] => ALL_MONTHS.map(getMonthlyHomepageCopy)
const allText = (c: MonthlyHomepageCopy) =>
  [c.script, c.lead, c.primaryCta, c.secondaryCta, c.bandTitle, c.bandCopy, ...c.badges].join(' ')

describe('getMonthlyHomepageCopy', () => {
  it('should return a complete set for all twelve months', () => {
    everySet().forEach((c) => {
      expect(c.script.length).toBeGreaterThan(0)
      expect(c.lead.length).toBeGreaterThan(0)
      expect(c.primaryCta.length).toBeGreaterThan(0)
      expect(c.secondaryCta.length).toBeGreaterThan(0)
      expect(c.secondaryHref.startsWith('/')).toBe(true)
      expect(c.badges).toHaveLength(4)
      expect(c.bandTitle.length).toBeGreaterThan(0)
      expect(c.bandCopy.length).toBeGreaterThan(0)
    })
  })

  it('should give every month a distinct script line, so the site never looks stale', () => {
    const scripts = everySet().map((c) => c.script)
    expect(new Set(scripts).size).toBe(12)
  })

  it('should fall back to the evergreen August set for an out-of-range month', () => {
    expect(getMonthlyHomepageCopy(0)).toEqual(getMonthlyHomepageCopy(8))
    expect(getMonthlyHomepageCopy(13)).toEqual(getMonthlyHomepageCopy(8))
    expect(getMonthlyHomepageCopy(NaN)).toEqual(getMonthlyHomepageCopy(8))
  })

  describe('SSOT banned claims (docs/SSOT.md section 14)', () => {
    it.each([
      ['mulled wine', /mulled/i],
      ['air conditioning or climate control', /air.?condition|climate.?control|year.?round comfort/i],
      ['best or premier claims', /\b(best|premier)\b/i],
      ['a founding year other than 1751', /18\d\d|since the 1800s/i],
      ['Sunday roast pre-order or a Saturday cutoff', /pre.?order|cut.?off/i],
      ['shared Christmas party nights', /party night/i],
      ['gluten free as a claim', /gluten.?free/i],
      ['wedding receptions', /wedding/i],
      ['Sky or TNT sports', /\bsky\b|\btnt\b/i]
    ])('should never say %s', (_label, pattern) => {
      everySet().forEach((c) => {
        expect(allText(c)).not.toMatch(pattern)
      })
    })

    it('should never use an em dash, which is banned in all copy', () => {
      everySet().forEach((c) => {
        expect(allText(c)).not.toContain(EM_DASH)
      })
    })
  })

  describe('Christmas figures come from christmas-season.ts, never typed', () => {
    it('should interpolate the live window into November and December', () => {
      const label = formatChristmasWindowLabel()
      expect(getMonthlyHomepageCopy(11).lead).toContain(label)
      expect(getMonthlyHomepageCopy(12).lead).toContain(label)
    })

    it('should interpolate the live minimum party size, not a literal', () => {
      const min = String(CHRISTMAS_MIN_PARTY_SIZE_LOWEST)
      ;[10, 11, 12].forEach((m) => {
        expect(allText(getMonthlyHomepageCopy(m))).toContain(min)
      })
    })

    it('should interpolate the live deposit into November', () => {
      expect(getMonthlyHomepageCopy(11).bandCopy).toContain(`£${CHRISTMAS_DEPOSIT_PER_PERSON}`)
    })

    it('should not mention Christmas at all before October', () => {
      ;[1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((m) => {
        expect(allText(getMonthlyHomepageCopy(m))).not.toMatch(/christmas|festive/i)
      })
    })

    it('should start the Christmas push in October, in the band only', () => {
      const october = getMonthlyHomepageCopy(10)
      expect(october.bandCopy).toMatch(/festive/i)
      // The hero stays about autumn.
      expect(october.script).not.toMatch(/christmas|festive/i)
      expect(october.lead).not.toMatch(/christmas|festive/i)
    })
  })

  describe('December stays true after festive service ends on the 20th', () => {
    // The owner's decorated window runs to 31 December but festive service
    // finishes on the 20th, so nothing in December may imply a festive table is
    // still bookable. The primary CTA is the plain booking ask for that reason.
    it('should not offer a festive-specific primary action', () => {
      expect(getMonthlyHomepageCopy(12).primaryCta).not.toMatch(/festive/i)
    })

    it('should not claim festive service is still running', () => {
      const december = getMonthlyHomepageCopy(12)
      expect(december.bandCopy).not.toMatch(/festive (sittings|service) (until|to)/i)
      expect(december.bandCopy).toMatch(/New Year/i)
    })
  })

  describe('primary action destination', () => {
    it('should route through the booking flow for every month except November', () => {
      ALL_MONTHS.filter((m) => m !== 11).forEach((m) => {
        expect(getMonthlyHomepageCopy(m).primaryHref).toBeUndefined()
      })
    })

    it('should send November to the Christmas page instead', () => {
      expect(getMonthlyHomepageCopy(11).primaryHref).toBe('/christmas-parties')
    })
  })
})

describe('getCurrentMonthlyHomepageCopy', () => {
  it('should resolve the month in Europe/London, not UTC', () => {
    // 23:30 UTC on 31 August is already 1 September in London (BST), so this
    // must return the September set, not August's.
    const lateAugust = new Date(Date.UTC(2026, 7, 31, 23, 30, 0))
    expect(getCurrentMonthlyHomepageCopy(lateAugust)).toEqual(getMonthlyHomepageCopy(9))
  })

  it('should stay in December at 23:30 UTC on 31 December (GMT, no offset)', () => {
    const newYearsEve = new Date(Date.UTC(2026, 11, 31, 23, 30, 0))
    expect(getCurrentMonthlyHomepageCopy(newYearsEve)).toEqual(getMonthlyHomepageCopy(12))
  })

  it.each([
    ['mid January', utcNoon(2027, 0, 15), 1],
    ['mid June', utcNoon(2027, 5, 15), 6],
    ['1 November', utcNoon(2026, 10, 1), 11]
  ])('should pick the right set for %s', (_label, date, expected) => {
    expect(getCurrentMonthlyHomepageCopy(date)).toEqual(getMonthlyHomepageCopy(expected))
  })

  it('should default to the current date when no argument is given', () => {
    expect(getCurrentMonthlyHomepageCopy().script.length).toBeGreaterThan(0)
  })
})
