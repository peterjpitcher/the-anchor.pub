import {
  formatEventLocalDate,
  formatEventLocalTime,
  getEventLocalIsoDate
} from '@/lib/event-calendar'

describe('event calendar local formatting', () => {
  // The management API sends a real UTC instant. An event stored as 19:00 on 29 July arrives as
  // 18:00Z, because 19:00 BST is 18:00 UTC. The offset must be applied, not discarded.
  //
  // This suite previously asserted that '2026-05-06T19:00:00+00:00' rendered as '7pm', which
  // treated the timestamp as wall time and threw the offset away. That made every event on the
  // site read an hour early for the whole of British Summer Time. The bug was invisible in
  // winter, when the offset is zero, and the only offset-bearing test used a January date.
  it('converts a UTC instant to London time during BST', () => {
    const value = '2026-07-29T18:00:00.000Z'

    expect(formatEventLocalTime(value)).toBe('7pm')
    expect(getEventLocalIsoDate(value)).toBe('2026-07-29')
    expect(
      formatEventLocalDate(value, { weekday: 'short', day: 'numeric', month: 'short' })
    ).toBe('Wed 29 Jul')
  })

  it('applies a written-out zero offset rather than stripping it', () => {
    // 19:00 UTC in May is 20:00 in London, not 19:00.
    expect(formatEventLocalTime('2026-05-06T19:00:00+00:00')).toBe('8pm')
    expect(getEventLocalIsoDate('2026-05-06T19:00:00+00:00')).toBe('2026-05-06')
  })

  it('keeps winter GMT event times unchanged', () => {
    expect(formatEventLocalTime('2026-01-14T19:30:00+00:00')).toBe('7:30pm')
    expect(getEventLocalIsoDate('2026-01-14T19:30:00+00:00')).toBe('2026-01-14')
  })

  it('rolls the date back when a BST instant lands before London midnight', () => {
    // 23:30Z on 29 July is 00:30 on 30 July in London.
    expect(getEventLocalIsoDate('2026-07-29T23:30:00.000Z')).toBe('2026-07-30')
    expect(formatEventLocalTime('2026-07-29T23:30:00.000Z')).toBe('12:30am')
  })

  it('still reads a naive string as London wall time', () => {
    // Door times and `${event.date}T${event.time}` fallbacks carry no offset.
    expect(formatEventLocalTime('2026-01-01T19:00')).toBe('7pm')
    expect(formatEventLocalTime('2026-07-29T19:00:00')).toBe('7pm')
    expect(getEventLocalIsoDate('2026-07-29T19:00:00')).toBe('2026-07-29')
  })

  it('handles a non-zero offset', () => {
    // 19:00 at +02:00 is 17:00 UTC, which is 18:00 in London during BST.
    expect(formatEventLocalTime('2026-07-29T19:00:00+02:00')).toBe('6pm')
  })

  it('returns the fallback for unusable input', () => {
    expect(formatEventLocalTime('')).toBe('Time TBC')
    expect(getEventLocalIsoDate('')).toBeNull()
  })
})
