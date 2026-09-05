import {
  getEasterSunday,
  getMotheringSunday,
  getValentinesDay,
  getFathersDay
} from '@/lib/recurring-dates'
import { getHeaderPromoCtas } from '@/lib/header-promos'

/**
 * The point of these is that the header links keep working in years nobody has
 * thought about yet, so the coverage runs well past the current one.
 */

describe('getEasterSunday', () => {
  // Published Gregorian Easter dates. If the computus is ever "simplified",
  // these catch it.
  it.each([
    [2024, '2024-03-31'],
    [2025, '2025-04-20'],
    [2026, '2026-04-05'],
    [2027, '2027-03-28'],
    [2028, '2028-04-16'],
    [2029, '2029-04-01'],
    [2030, '2030-04-21'],
    [2031, '2031-04-13'],
    [2032, '2032-03-28'],
    [2033, '2033-04-17'],
    [2038, '2038-04-25'], // latest possible date in this range
    [2035, '2035-03-25']  // earliest in this range
  ])('should place Easter %i on %s', (year, expected) => {
    expect(getEasterSunday(year)).toBe(expected)
  })

  it('should always land on a Sunday', () => {
    for (let year = 2024; year <= 2060; year++) {
      const d = new Date(`${getEasterSunday(year)}T00:00:00Z`)
      expect(d.getUTCDay()).toBe(0)
    }
  })

  it('should always fall between 22 March and 25 April', () => {
    for (let year = 2024; year <= 2060; year++) {
      const [, month, day] = getEasterSunday(year).split('-').map(Number)
      const ok = (month === 3 && day >= 22) || (month === 4 && day <= 25)
      expect(ok).toBe(true)
    }
  })
})

describe('getMotheringSunday', () => {
  it.each([
    [2025, '2025-03-30'],
    [2026, '2026-03-15'],
    [2027, '2027-03-07'],
    [2028, '2028-03-26']
  ])('should place UK Mothering Sunday %i on %s', (year, expected) => {
    expect(getMotheringSunday(year)).toBe(expected)
  })

  it('should always be a Sunday, exactly 21 days before Easter', () => {
    for (let year = 2024; year <= 2060; year++) {
      const mothering = new Date(`${getMotheringSunday(year)}T00:00:00Z`)
      const easter = new Date(`${getEasterSunday(year)}T00:00:00Z`)
      expect(mothering.getUTCDay()).toBe(0)
      expect((easter.getTime() - mothering.getTime()) / 86400000).toBe(21)
    }
  })

  it('should never be the US Mother\'s Day in May', () => {
    for (let year = 2024; year <= 2060; year++) {
      expect(getMotheringSunday(year).slice(5, 7)).not.toBe('05')
    }
  })
})

describe('getValentinesDay', () => {
  it('should always be 14 February', () => {
    expect(getValentinesDay(2027)).toBe('2027-02-14')
    expect(getValentinesDay(2031)).toBe('2031-02-14')
  })
})

describe('getFathersDay', () => {
  it.each([
    [2026, '2026-06-21'],
    [2027, '2027-06-20'],
    [2028, '2028-06-18']
  ])('should place UK Father\'s Day %i on %s', (year, expected) => {
    expect(getFathersDay(year)).toBe(expected)
  })

  it('should always be the third Sunday of June', () => {
    for (let year = 2024; year <= 2060; year++) {
      const d = new Date(`${getFathersDay(year)}T00:00:00Z`)
      expect(d.getUTCDay()).toBe(0)
      expect(d.getUTCMonth()).toBe(5)
      expect(d.getUTCDate()).toBeGreaterThanOrEqual(15)
      expect(d.getUTCDate()).toBeLessThanOrEqual(21)
    }
  })
})

describe('getHeaderPromoCtas', () => {
  const utcNoon = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d, 12, 0, 0))

  it('should carry both this year and next, so a lead window can cross 31 December', () => {
    // Valentine's has the default 56-day lead, so on 28 December the entry that
    // matters is next February's. If only the current year were emitted, the
    // link would vanish for the whole run-up.
    const promos = getHeaderPromoCtas(utcNoon(2027, 11, 28))
    const valentines = promos.filter((p) => p.label === "Valentine's Day").map((p) => p.startsOn)
    expect(valentines).toContain('2027-02-14')
    expect(valentines).toContain('2028-02-14')
  })

  it('should never emit a date from a year that has been and gone', () => {
    const promos = getHeaderPromoCtas(utcNoon(2030, 5, 1))
    promos
      .filter((p) => p.label !== 'Christmas')
      .forEach((p) => {
        expect(Number(p.startsOn.slice(0, 4))).toBeGreaterThanOrEqual(2030)
      })
  })

  it('should still produce a full set decades out, with no hardcoded year left', () => {
    const promos = getHeaderPromoCtas(utcNoon(2045, 0, 15))
    expect(promos.some((p) => p.startsOn === '2045-02-14')).toBe(true)
    expect(promos.some((p) => p.label === "Mother's Day" && p.startsOn.startsWith('2045-'))).toBe(true)
  })

  it('should take Christmas from the SSOT window, not the calendar', () => {
    const christmas = getHeaderPromoCtas(utcNoon(2026, 7, 12)).find((p) => p.label === 'Christmas')
    expect(christmas).toBeDefined()
    // Whatever the SSOT says, start must precede end.
    expect(christmas!.startsOn < christmas!.endsOn).toBe(true)
    expect(christmas!.leadDays).toBeGreaterThan(90)
  })

  it('should no longer carry the expired World Cup entry', () => {
    const labels = getHeaderPromoCtas(utcNoon(2026, 7, 12)).map((p) => p.label)
    expect(labels).not.toContain('World Cup 2026')
  })

  it('should give every promo a valid ISO window with start on or before end', () => {
    getHeaderPromoCtas(utcNoon(2029, 3, 3)).forEach((p) => {
      expect(p.startsOn).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(p.endsOn).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(p.startsOn <= p.endsOn).toBe(true)
      expect(p.href.startsWith('/')).toBe(true)
    })
  })
})


describe('Nations Championship header promotion', () => {
  it('follows Christmas and covers the owner-approved run through Finals Weekend only', () => {
    const promos = getHeaderPromoCtas(new Date('2026-09-05T12:00:00Z'))
    const index = promos.findIndex(p => p.label === 'Nations Championship')
    expect(promos[index - 1].label).toBe('Christmas')
    expect(promos[index]).toMatchObject({ href: '/live-sport/nations-championship', startsOn: '2026-09-05', endsOn: '2026-11-29', leadDays: 0 })
    expect(getHeaderPromoCtas(new Date('2027-09-05T12:00:00Z')).some(p => p.label === 'Nations Championship')).toBe(false)
  })
})
