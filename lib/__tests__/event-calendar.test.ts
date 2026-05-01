import {
  formatEventLocalDate,
  formatEventLocalTime,
  getEventLocalIsoDate
} from '@/lib/event-calendar'

describe('event calendar local formatting', () => {
  it('treats API timestamps as UK local wall time during BST', () => {
    const value = '2026-05-06T19:00:00+00:00'

    expect(getEventLocalIsoDate(value)).toBe('2026-05-06')
    expect(formatEventLocalTime(value)).toBe('7pm')
    expect(formatEventLocalDate(value, {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })).toBe('Wed 6 May')
  })

  it('keeps winter GMT event times unchanged', () => {
    expect(formatEventLocalTime('2026-01-14T19:30:00+00:00')).toBe('7:30pm')
  })
})
