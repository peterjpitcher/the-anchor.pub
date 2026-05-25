import {
  getAircraftOverheadNoteForDateTime,
  getPlaneSpottingWindowForDate,
  getTodayPlaneSpottingWindow,
} from '@/lib/heathrow-runway-alternation'

describe('heathrow runway alternation', () => {
  it('returns until 3pm for the week commencing 18 May 2026', () => {
    const result = getPlaneSpottingWindowForDate('2026-05-18')

    expect(result.window).toBe('until_3pm')
    expect(result.statusText).toBe('Planes: expected until 3pm')
    expect(result.weekCommencing).toBe('2026-05-18')
  })

  it('returns from 3pm for the week commencing 25 May 2026', () => {
    const result = getPlaneSpottingWindowForDate('2026-05-25')

    expect(result.window).toBe('from_3pm')
    expect(result.statusText).toBe('Planes: expected from 3pm')
    expect(result.weekCommencing).toBe('2026-05-25')
  })

  it('continues alternating for future dates beyond 2026', () => {
    const oneWeek = getPlaneSpottingWindowForDate('2027-01-04')
    const nextWeek = getPlaneSpottingWindowForDate('2027-01-11')

    expect(oneWeek.window).not.toBe('unknown')
    expect(nextWeek.window).not.toBe('unknown')
    expect(oneWeek.window).not.toBe(nextWeek.window)
  })

  it('uses the Monday week for Sunday dates', () => {
    const sunday = getPlaneSpottingWindowForDate('2026-05-24')
    const monday = getPlaneSpottingWindowForDate('2026-05-18')

    expect(sunday.window).toBe(monday.window)
    expect(sunday.weekCommencing).toBe('2026-05-18')
  })

  it('returns unknown for invalid dates', () => {
    const result = getPlaneSpottingWindowForDate('2026-02-31')

    expect(result.window).toBe('unknown')
    expect(result.weekCommencing).toBeNull()
  })

  it('returns neutral time-specific booking copy inside and outside the expected window', () => {
    expect(getAircraftOverheadNoteForDateTime('2026-05-18', '14:00')).toBe(
      'Aircraft overhead are expected around this time. Weather and Heathrow operations dependent, not guaranteed.'
    )
    expect(getAircraftOverheadNoteForDateTime('2026-05-18', '16:00')).toBe(
      'Aircraft overhead is usually expected until 3pm on this date. Weather and Heathrow operations dependent, not guaranteed.'
    )
    expect(getAircraftOverheadNoteForDateTime('2026-05-25', '16:00')).toBe(
      'Aircraft overhead are expected around this time. Weather and Heathrow operations dependent, not guaranteed.'
    )
  })

  it('derives today from Europe/London date', () => {
    const result = getTodayPlaneSpottingWindow(new Date('2026-05-24T23:30:00.000Z'))

    expect(result.weekCommencing).toBe('2026-05-25')
    expect(result.window).toBe('from_3pm')
  })
})
