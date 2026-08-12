import { withDailyShareMarker } from '@/lib/share-url'

describe('withDailyShareMarker', () => {
  it('adds the current London date to an event share URL', () => {
    expect(withDailyShareMarker(
      'https://www.the-anchor.pub/events/music-bingo',
      Date.parse('2026-08-12T22:30:00.000Z')
    )).toBe('https://www.the-anchor.pub/events/music-bingo?share=2026-08-12')
  })

  it('changes at London midnight during British Summer Time', () => {
    expect(withDailyShareMarker(
      'https://www.the-anchor.pub/events/music-bingo',
      Date.parse('2026-08-12T23:30:00.000Z')
    )).toBe('https://www.the-anchor.pub/events/music-bingo?share=2026-08-13')
  })

  it('preserves existing query parameters and relative URLs', () => {
    expect(withDailyShareMarker(
      '/events/music-bingo?source=page#booking',
      Date.parse('2026-08-12T12:00:00.000Z')
    )).toBe('/events/music-bingo?source=page&share=2026-08-12#booking')
  })
})
