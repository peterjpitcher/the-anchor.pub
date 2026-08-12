import { resolveMonthlyHeroFolder, MONTH_FOLDERS } from '@/lib/seasonal-utils'

/**
 * Switch-over dates for the twelve monthly hero photos.
 *
 * Every month takes over on its 1st, except December, which comes in early on
 * 12 November (owner, 12 August 2026). That matches the date the seasonal
 * christmas asset has always switched on, and leaves November's own photo
 * covering only 1 to 11 November, the Remembrance window.
 */

describe('resolveMonthlyHeroFolder', () => {
  it('should switch every ordinary month on its 1st and hold it to month end', () => {
    const cases: Array<[number, number, string]> = [
      [1, 1, 'january'], [1, 31, 'january'],
      [2, 1, 'february'], [2, 28, 'february'],
      [3, 1, 'march'], [3, 31, 'march'],
      [4, 1, 'april'], [4, 30, 'april'],
      [5, 1, 'may'], [5, 31, 'may'],
      [6, 1, 'june'], [6, 30, 'june'],
      [7, 1, 'july'], [7, 31, 'july'],
      [8, 1, 'august'], [8, 31, 'august'],
      [9, 1, 'september'], [9, 30, 'september'],
      [10, 1, 'october'], [10, 31, 'october']
    ]
    cases.forEach(([month, day, expected]) => {
      expect(resolveMonthlyHeroFolder(month, day)).toBe(expected)
    })
  })

  describe('the 12 November switch to December', () => {
    it('should still show November from the 1st to the 11th', () => {
      for (let day = 1; day <= 11; day++) {
        expect(resolveMonthlyHeroFolder(11, day)).toBe('november')
      }
    })

    it('should switch to December on the 12th, not the 13th', () => {
      expect(resolveMonthlyHeroFolder(11, 11)).toBe('november')
      expect(resolveMonthlyHeroFolder(11, 12)).toBe('december')
    })

    it('should stay on December for the rest of November', () => {
      for (let day = 12; day <= 30; day++) {
        expect(resolveMonthlyHeroFolder(11, day)).toBe('december')
      }
    })

    it('should stay on December through December itself', () => {
      expect(resolveMonthlyHeroFolder(12, 1)).toBe('december')
      expect(resolveMonthlyHeroFolder(12, 25)).toBe('december')
      expect(resolveMonthlyHeroFolder(12, 31)).toBe('december')
    })

    it('should hand back to January on 1 January', () => {
      expect(resolveMonthlyHeroFolder(1, 1)).toBe('january')
    })

    it('should not let the early switch leak into any other month', () => {
      // Day 12 or later in every month except November resolves to that month.
      for (let month = 1; month <= 12; month++) {
        if (month === 11) continue
        expect(resolveMonthlyHeroFolder(month, 12)).toBe(MONTH_FOLDERS[month - 1])
        expect(resolveMonthlyHeroFolder(month, 28)).toBe(MONTH_FOLDERS[month - 1])
      }
    })
  })

  it('should return null for a month outside 1 to 12 rather than throwing', () => {
    expect(resolveMonthlyHeroFolder(0, 1)).toBeNull()
    expect(resolveMonthlyHeroFolder(13, 1)).toBeNull()
  })
})
