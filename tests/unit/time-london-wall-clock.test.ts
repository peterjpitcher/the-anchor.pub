import {
  formatLondonDateTime,
  londonIsoDate,
  londonWallClock,
  londonWallClockToInstant,
  parseLondonDate,
  toLondonDateTimeLocal
} from '@/lib/time-london'

// A date and time typed into a form is UK time, whatever the device is set to.
//
// Nothing here reads the process time zone, so the answers are the same under
// `npm test` (London), `npm run test:utc` (UTC, the serverless runtime) and
// `npm run test:zones` (Sydney and Los Angeles, standing in for a visitor's phone).

describe('londonWallClockToInstant', () => {
  it('reads a winter time as Greenwich Mean Time', () => {
    expect(londonWallClockToInstant('2026-11-10T10:00')?.toISOString()).toBe('2026-11-10T10:00:00.000Z')
  })

  it('reads a summer time as British Summer Time, an hour ahead of UTC', () => {
    expect(londonWallClockToInstant('2026-07-10T10:00')?.toISOString()).toBe('2026-07-10T09:00:00.000Z')
  })

  it('accepts seconds', () => {
    expect(londonWallClockToInstant('2026-07-10T10:00:30')?.toISOString()).toBe('2026-07-10T09:00:30.000Z')
  })

  it('reads midnight in summer as 11pm UTC the day before', () => {
    expect(londonWallClockToInstant('2026-07-10T00:00')?.toISOString()).toBe('2026-07-09T23:00:00.000Z')
  })

  describe('the day the clocks go back, Sunday 25 October 2026', () => {
    it('is still summer time at 00:59', () => {
      expect(londonWallClockToInstant('2026-10-25T00:59')?.toISOString()).toBe('2026-10-24T23:59:00.000Z')
    })

    it('reads the hour that happens twice as its first pass', () => {
      expect(londonWallClockToInstant('2026-10-25T01:30')?.toISOString()).toBe('2026-10-25T00:30:00.000Z')
    })

    it('is winter time from 02:00', () => {
      expect(londonWallClockToInstant('2026-10-25T02:00')?.toISOString()).toBe('2026-10-25T02:00:00.000Z')
      expect(londonWallClockToInstant('2026-10-25T12:00')?.toISOString()).toBe('2026-10-25T12:00:00.000Z')
    })

    it('makes the day 25 hours long, midnight to midnight', () => {
      const start = londonWallClockToInstant('2026-10-25T00:00') as Date
      const end = londonWallClockToInstant('2026-10-26T00:00') as Date
      expect((end.getTime() - start.getTime()) / 3_600_000).toBe(25)
    })
  })

  describe('the day the clocks go forward, Sunday 28 March 2027', () => {
    it('is winter time at 00:59', () => {
      expect(londonWallClockToInstant('2027-03-28T00:59')?.toISOString()).toBe('2027-03-28T00:59:00.000Z')
    })

    it('reads the hour that never happens as the same time an hour later', () => {
      // 01:30 does not exist; a London clock shows 02:30 at this instant.
      const instant = londonWallClockToInstant('2027-03-28T01:30') as Date
      expect(instant.toISOString()).toBe('2027-03-28T01:30:00.000Z')
      expect(toLondonDateTimeLocal(instant)).toBe('2027-03-28T02:30')
    })

    it('is summer time from 02:00', () => {
      expect(londonWallClockToInstant('2027-03-28T02:00')?.toISOString()).toBe('2027-03-28T01:00:00.000Z')
      expect(londonWallClockToInstant('2027-03-28T12:00')?.toISOString()).toBe('2027-03-28T11:00:00.000Z')
    })

    it('makes the day 23 hours long, midnight to midnight', () => {
      const start = londonWallClockToInstant('2027-03-28T00:00') as Date
      const end = londonWallClockToInstant('2027-03-29T00:00') as Date
      expect((end.getTime() - start.getTime()) / 3_600_000).toBe(23)
    })
  })

  it.each(['', 'tomorrow', '2026-11-10', '2026-11-10 10:00', '2026-13-01T10:00', '2026-02-30T10:00', '2026-11-10T24:00', '2026-11-10T10:60'])(
    'returns null for %p',
    (value) => {
      expect(londonWallClockToInstant(value)).toBeNull()
    }
  )
})

describe('toLondonDateTimeLocal', () => {
  it('prints an instant on the London clock', () => {
    expect(toLondonDateTimeLocal(new Date('2026-11-10T10:00:00Z'))).toBe('2026-11-10T10:00')
    expect(toLondonDateTimeLocal(new Date('2026-07-10T09:00:00Z'))).toBe('2026-07-10T10:00')
  })

  it('prints midnight as 00, never 24', () => {
    expect(toLondonDateTimeLocal(new Date('2026-07-09T23:00:00Z'))).toBe('2026-07-10T00:00')
    expect(toLondonDateTimeLocal(new Date('2026-12-01T00:30:00Z'))).toBe('2026-12-01T00:30')
  })

  it.each([
    '2026-10-24T23:30',
    '2026-10-25T00:30',
    '2026-10-25T02:30',
    '2026-10-25T12:00',
    '2027-03-27T23:30',
    '2027-03-28T00:30',
    '2027-03-28T02:30',
    '2027-03-28T12:00',
    '2026-07-01T08:15',
    '2026-12-25T15:00'
  ])('round-trips %s through an instant', (typed) => {
    expect(toLondonDateTimeLocal(londonWallClockToInstant(typed) as Date)).toBe(typed)
  })
})

describe('londonWallClock, londonIsoDate and formatLondonDateTime', () => {
  it('gives the London date either side of midnight in summer', () => {
    // 23:30 UTC on 9 July is 00:30 on 10 July in London.
    expect(londonIsoDate(new Date('2026-07-09T23:30:00Z'))).toBe('2026-07-10')
    expect(londonIsoDate(new Date('2026-07-09T22:30:00Z'))).toBe('2026-07-09')
    expect(londonWallClock(new Date('2026-07-09T23:30:00Z'))).toEqual({ year: 2026, month: 7, day: 10, hour: 0, minute: 30 })
  })

  it('gives the London date on both clock-change days', () => {
    expect(londonIsoDate(new Date('2026-10-24T23:30:00Z'))).toBe('2026-10-25')
    expect(londonIsoDate(new Date('2026-10-25T23:30:00Z'))).toBe('2026-10-25')
    expect(londonIsoDate(new Date('2027-03-28T22:59:00Z'))).toBe('2027-03-28')
    expect(londonIsoDate(new Date('2027-03-28T23:00:00Z'))).toBe('2027-03-29')
  })

  it('formats a summary line in UK time', () => {
    expect(formatLondonDateTime(new Date('2026-07-10T09:00:00Z'))).toMatch(/^10 Jul 2026,? (at )?10:00$/)
    expect(formatLondonDateTime(new Date('2026-11-10T10:00:00Z'))).toMatch(/^10 Nov 2026,? (at )?10:00$/)
  })
})

describe('parseLondonDate', () => {
  it('is a calendar-date anchor at 00:00 UTC, as its callers rely on', () => {
    expect(parseLondonDate('2026-07-10').toISOString()).toBe('2026-07-10T00:00:00.000Z')
  })
})
