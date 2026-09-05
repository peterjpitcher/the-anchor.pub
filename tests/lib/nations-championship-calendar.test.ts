import { buildScreeningCalendar } from '@/lib/nations-championship/calendar'
import { nationsFixture, approvedNationsFixture, sundayNationsFixture } from '../fixtures/nations-championship'
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

it('marks a late approved booking window and closing, without inventing a final whistle', () => {
  const calendar = buildScreeningCalendar(approvedNationsFixture(true), now).replace(/\r\n /g, '')
  expect(calendar).toContain('DTEND:20261107T220000Z')
  expect(calendar).toContain('booking window, not the final whistle'.replace(',', '\\,'))
  expect(calendar).toContain('Viewing ends when the pub closes')
  expect(calendar).not.toContain('the start of the game is missed')
})

it('includes the Sunday roast menu and actual service hours in the calendar', () => {
  const calendar = buildScreeningCalendar(sundayNationsFixture(), now).replace(/\r\n /g, '')
  expect(calendar).toContain('Menu: https://www.the-anchor.pub/sunday-roast')
  expect(calendar).toContain('Food served 1pm to 6pm')
  expect(calendar).not.toContain('/food-menu')
})
