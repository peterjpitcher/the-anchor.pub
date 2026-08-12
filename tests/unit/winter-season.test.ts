import { getSeasonalSkin, getSeasonalSkinStyle } from '@/lib/winter-season'

/**
 * Boundary coverage for lib/winter-season.ts.
 *
 * Every case is asserted in Europe/London. Noon UTC is safe across both GMT and
 * BST because London is never more than one hour ahead of UTC, so 12:00 UTC can
 * never land on the previous or next London day. The BST/GMT crossing itself is
 * covered explicitly below, plus a pair of midnight-adjacent cases where a UTC
 * server would disagree with London.
 */

const utcNoon = (year: number, monthZeroBased: number, day: number) =>
  new Date(Date.UTC(year, monthZeroBased, day, 12, 0, 0))

const FORCE_KEY = 'NEXT_PUBLIC_FORCE_WINTER_SKIN'
type MutableEnv = Record<string, string | undefined>
const originalForce = process.env[FORCE_KEY]

afterEach(() => {
  if (originalForce === undefined) {
    delete (process.env as MutableEnv)[FORCE_KEY]
  } else {
    ;(process.env as MutableEnv)[FORCE_KEY] = originalForce
  }
})

describe('getSeasonalSkin', () => {
  describe('dark window (1 September to 31 March)', () => {
    it.each([
      ['31 August, last day off', utcNoon(2026, 7, 31), 'off'],
      ['1 September, first dark day', utcNoon(2026, 8, 1), 'dark'],
      ['30 September', utcNoon(2026, 8, 30), 'dark'],
      ['1 October', utcNoon(2026, 9, 1), 'dark'],
      ['31 October, last dark-only day', utcNoon(2026, 9, 31), 'dark'],
      ['1 January', utcNoon(2027, 0, 1), 'dark'],
      ['28 February', utcNoon(2027, 1, 28), 'dark'],
      ['31 March, last dark day', utcNoon(2027, 2, 31), 'dark'],
      ['1 April, skin off again', utcNoon(2027, 3, 1), 'off'],
      ['15 June, high summer', utcNoon(2027, 5, 15), 'off']
    ])('%s', (_label, date, expected) => {
      expect(getSeasonalSkin(date).stage).toBe(expected)
    })

    it('should keep lights and frost at zero for the whole dark-only window', () => {
      const septemberToOctober = [
        utcNoon(2026, 8, 1),
        utcNoon(2026, 8, 30),
        utcNoon(2026, 9, 1),
        utcNoon(2026, 9, 31),
        utcNoon(2027, 0, 15),
        utcNoon(2027, 2, 31)
      ]
      septemberToOctober.forEach((date) => {
        const skin = getSeasonalSkin(date)
        expect(skin.dark).toBe(true)
        expect(skin.lights).toBe(0)
        expect(skin.frost).toBe(0)
      })
    })
  })

  describe('festive window (1 November to 31 December)', () => {
    it.each([
      ['31 October, no lights yet', utcNoon(2026, 9, 31), 'dark'],
      ['1 November, lights on from day one', utcNoon(2026, 10, 1), 'festive'],
      ['11 November, no Remembrance hold-back', utcNoon(2026, 10, 11), 'festive'],
      ['12 November', utcNoon(2026, 10, 12), 'festive'],
      ['30 November', utcNoon(2026, 10, 30), 'festive'],
      ['1 December', utcNoon(2026, 11, 1), 'festive'],
      ['31 December, last festive day', utcNoon(2026, 11, 31), 'festive'],
      ['1 January, back to dark only', utcNoon(2027, 0, 1), 'dark']
    ])('%s', (_label, date, expected) => {
      expect(getSeasonalSkin(date).stage).toBe(expected)
    })

    it('should run lights and frost at full strength across both months', () => {
      ;[utcNoon(2026, 10, 1), utcNoon(2026, 10, 15), utcNoon(2026, 11, 31)].forEach((date) => {
        expect(getSeasonalSkin(date)).toEqual({
          stage: 'festive',
          dark: true,
          lights: 1,
          frost: 1
        })
      })
    })
  })

  describe('London time, not UTC', () => {
    it('should still be off at 23:30 UTC on 31 August, because London is 00:30 on 1 September (BST)', () => {
      // A UTC server reads 31 August and says "off". London is already in
      // September, so the skin must be on.
      const date = new Date(Date.UTC(2026, 7, 31, 23, 30, 0))
      expect(getSeasonalSkin(date).stage).toBe('dark')
    })

    it('should not turn the lights on early at 23:30 UTC on 31 October (GMT, no offset)', () => {
      // GMT by late October, so London agrees with UTC here and it is still
      // 31 October. Guards against an accidental fixed +1 offset.
      const date = new Date(Date.UTC(2026, 9, 31, 23, 30, 0))
      expect(getSeasonalSkin(date).stage).toBe('dark')
    })

    it('should turn the lights on at 00:30 UTC on 1 November', () => {
      const date = new Date(Date.UTC(2026, 10, 1, 0, 30, 0))
      expect(getSeasonalSkin(date).stage).toBe('festive')
    })

    it('should hold the skin on across the BST to GMT crossing in late October', () => {
      // Clocks go back on 25 October 2026. Either side must stay 'dark'.
      expect(getSeasonalSkin(new Date(Date.UTC(2026, 9, 25, 0, 30, 0))).stage).toBe('dark')
      expect(getSeasonalSkin(new Date(Date.UTC(2026, 9, 25, 2, 30, 0))).stage).toBe('dark')
    })

    it('should hold the skin on across the GMT to BST crossing in late March', () => {
      // Clocks go forward on 28 March 2027, still inside the dark window.
      expect(getSeasonalSkin(new Date(Date.UTC(2027, 2, 28, 0, 30, 0))).stage).toBe('dark')
      expect(getSeasonalSkin(new Date(Date.UTC(2027, 2, 28, 2, 30, 0))).stage).toBe('dark')
    })
  })

  describe('preview override (NEXT_PUBLIC_FORCE_WINTER_SKIN)', () => {
    it.each(['off', 'dark', 'festive'])('should honour a forced "%s" stage', (stage) => {
      ;(process.env as MutableEnv)[FORCE_KEY] = stage
      // A July date that would otherwise resolve to 'off'.
      expect(getSeasonalSkin(utcNoon(2027, 6, 15)).stage).toBe(stage)
    })

    it('should ignore an unrecognised value and fall back to the date', () => {
      ;(process.env as MutableEnv)[FORCE_KEY] = 'sparkly'
      expect(getSeasonalSkin(utcNoon(2026, 10, 15)).stage).toBe('festive')
      expect(getSeasonalSkin(utcNoon(2027, 6, 15)).stage).toBe('off')
    })

    it('should ignore an empty value', () => {
      ;(process.env as MutableEnv)[FORCE_KEY] = ''
      expect(getSeasonalSkin(utcNoon(2027, 6, 15)).stage).toBe('off')
    })
  })

  it('should default to the current date when no argument is given', () => {
    expect(['off', 'dark', 'festive']).toContain(getSeasonalSkin().stage)
  })
})

describe('getSeasonalSkinStyle', () => {
  it('should emit no custom properties when the skin is off', () => {
    expect(getSeasonalSkinStyle(getSeasonalSkin(utcNoon(2027, 6, 15)))).toEqual({})
  })

  it('should emit zeroed intensities during the dark-only window', () => {
    expect(getSeasonalSkinStyle(getSeasonalSkin(utcNoon(2026, 8, 15)))).toEqual({
      '--winter-lights': '0',
      '--winter-frost': '0'
    })
  })

  it('should emit full intensities during the festive window', () => {
    expect(getSeasonalSkinStyle(getSeasonalSkin(utcNoon(2026, 11, 15)))).toEqual({
      '--winter-lights': '1',
      '--winter-frost': '1'
    })
  })
})
