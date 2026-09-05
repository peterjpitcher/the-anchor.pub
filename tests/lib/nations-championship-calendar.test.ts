import { buildScreeningCalendar } from '@/lib/nations-championship/calendar'
import { nationsFixture } from '../fixtures/nations-championship'
const now = new Date('2026-09-05T07:00:00Z')
it('starts a partial screening at opening and includes food and missed-start details', () => {
  const ics = buildScreeningCalendar(nationsFixture(), now)
  expect(ics).toContain('DTSTART:20261107T120000Z')
  expect(ics).toContain('UID:10000000-0000-4000-8000-000000000001@the-anchor.pub')
  const unfolded = ics.replace(/\r\n /g, '')
  expect(unfolded).toContain('the start of the game is missed')
  expect(unfolded).toContain('Food served noon to 7pm')
  expect(unfolded).toContain('End time is planned')
  expect(ics.split('\r\n').every(line => Buffer.byteLength(line) <= 75)).toBe(true)
})
it('rejects cancelled and expired screenings', () => {
  expect(() => buildScreeningCalendar(nationsFixture({ matchState: 'cancelled' }), now)).toThrow()
  expect(() => buildScreeningCalendar(nationsFixture(), new Date('2026-11-08T00:00:00Z'))).toThrow()
})
it('escapes calendar injection and folds UTF8 safely', () => {
  const text = buildScreeningCalendar(nationsFixture({ teamA: 'É'.repeat(95) + '\nBEGIN:VEVENT\rBEGIN:VEVENT' }), now)
  expect(text.match(/\r\nBEGIN:VEVENT/g)).toHaveLength(1)
  expect(text.replace(/\r\n/g, '')).not.toContain('\r')
  expect(text.split('\r\n').every(line => Buffer.byteLength(line) <= 75)).toBe(true)
})
