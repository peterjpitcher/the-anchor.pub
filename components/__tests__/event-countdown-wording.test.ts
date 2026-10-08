/**
 * The words on the "Next Event" card.
 *
 * Two faults. "Tonight" or "tomorrow" was chosen from the hours left, so a 7pm
 * event read "Happening tomorrow" from midnight to 7am on the day itself. And
 * the day, date and time were formatted with no time zone, which in a browser is
 * the visitor's own: 7pm in London showed as 14:00 on a phone on New York time.
 *
 * Both are now decided on the London calendar and clock. The instants here are
 * fixed, so the answers must be the same in every zone this file runs in:
 * London (`npm test`), UTC (`npm run test:utc`), and Sydney and Los Angeles
 * (`npm run test:zones`), which stand in for a visitor's phone.
 */

import { getUrgencyCopy } from '../EventCountdownBanner'

jest.mock('next/navigation', () => ({ usePathname: () => '/find-us' }))

function copyFor(startDate: string, nowIso: string, name = 'Quiz Night') {
  const now = new Date(nowIso)
  const diffMs = new Date(startDate).getTime() - now.getTime()
  const hoursUntil = diffMs / 3_600_000
  const daysUntil = Math.floor(diffMs / 86_400_000)
  return getUrgencyCopy({ name, startDate }, daysUntil, hoursUntil, now)
}

describe('a 7pm event on Wednesday 7 October 2026 (18:00 UTC, British Summer Time)', () => {
  const quiz = '2026-10-07T18:00:00.000Z'

  it('is "tonight" at 6:30am on the day, never "tomorrow"', () => {
    const copy = copyFor(quiz, '2026-10-07T05:30:00Z')
    expect(copy.title).toBe('Happening tonight: Quiz Night')
    expect(copy.title).not.toMatch(/tomorrow/)
  })

  it('is "tonight" one minute after midnight on the day', () => {
    // 00:01 BST on 7 October is 23:01 UTC on the 6th: a UTC calendar would call it the 6th.
    expect(copyFor(quiz, '2026-10-06T23:01:00Z').title).toBe('Happening tonight: Quiz Night')
  })

  it('is "tomorrow" at 11pm the evening before', () => {
    // 23:00 BST on 6 October, 20 hours before.
    expect(copyFor(quiz, '2026-10-06T22:00:00Z').title).toBe('Happening tomorrow: Quiz Night')
  })

  it('gives the London date and time in the message', () => {
    const copy = copyFor(quiz, '2026-10-07T05:30:00Z')
    expect(copy.message).toMatch(/^Starts Wed,? 7 Oct at 7pm\. /)
  })

  it('names the London weekday and time two days out', () => {
    const copy = copyFor(quiz, '2026-10-05T12:00:00Z')
    expect(copy.title).toBe('Quiz Night is almost here')
    expect(copy.message).toMatch(/^Join us this Wednesday at 7pm\. /)
  })

  it('names the London weekday three days out', () => {
    expect(copyFor(quiz, '2026-10-04T10:00:00Z').title).toBe('Quiz Night this Wednesday')
  })
})

describe('a daytime event', () => {
  it('is "today", not "tonight", for a noon start read at 1am the same day', () => {
    // Noon GMT on Saturday 14 November 2026, read at 01:00 the same day.
    const copy = copyFor('2026-11-14T12:00:00.000Z', '2026-11-14T01:00:00Z', 'Family Lunch')
    expect(copy.title).toBe('Happening today: Family Lunch')
    expect(copy.message).toMatch(/^Starts Sat,? 14 Nov at 12pm\. /)
  })

  it('is "tonight" from 5pm', () => {
    expect(copyFor('2026-11-14T17:00:00.000Z', '2026-11-14T09:00:00Z', 'Tasting Night').title).toBe(
      'Happening tonight: Tasting Night'
    )
    expect(copyFor('2026-11-14T16:30:00.000Z', '2026-11-14T09:00:00Z', 'Tasting Night').title).toBe(
      'Happening today: Tasting Night'
    )
  })
})

describe('a Saturday 8pm event stays on Saturday for a phone on the other side of the world', () => {
  it('is Saturday at 8pm, in summer', () => {
    // 20:00 BST on Saturday 18 July 2026 is 19:00 UTC, and 05:00 on Sunday in Sydney.
    const copy = copyFor('2026-07-18T19:00:00.000Z', '2026-07-16T19:00:00Z', 'Karaoke')
    expect(copy.message).toMatch(/^Join us this Saturday at 8pm\. /)
  })
})

describe('the clock-change weekends', () => {
  it('reads a 7pm event on Sunday 25 October 2026 as tonight, at 7pm, through the repeated hour', () => {
    // 19:00 GMT. The clocks went back at 01:00 UTC that morning.
    const event = '2026-10-25T19:00:00.000Z'
    for (const now of ['2026-10-24T23:30:00Z', '2026-10-25T00:30:00Z', '2026-10-25T01:30:00Z', '2026-10-25T12:00:00Z']) {
      const copy = copyFor(event, now, 'Sunday Quiz')
      expect(copy.title).toBe('Happening tonight: Sunday Quiz')
      expect(copy.message).toMatch(/^Starts Sun,? 25 Oct at 7pm\. /)
    }
  })

  it('reads it as tomorrow on the Saturday evening before, still on summer time', () => {
    // 21:00 BST on Saturday 24 October: 22 hours earlier by the clock, 23 real hours.
    expect(copyFor('2026-10-25T19:00:00.000Z', '2026-10-24T20:00:00Z', 'Sunday Quiz').title).toBe(
      'Happening tomorrow: Sunday Quiz'
    )
  })

  it('reads a 7pm event on Sunday 28 March 2027 as tonight, at 7pm, either side of the change', () => {
    // 19:00 BST is 18:00 UTC. The clocks went forward at 01:00 UTC that morning.
    const event = '2027-03-28T18:00:00.000Z'
    for (const now of ['2027-03-28T00:30:00Z', '2027-03-28T01:30:00Z', '2027-03-28T12:00:00Z']) {
      const copy = copyFor(event, now, 'Sunday Quiz')
      expect(copy.title).toBe('Happening tonight: Sunday Quiz')
      expect(copy.message).toMatch(/^Starts Sun,? 28 Mar at 7pm\. /)
    }
  })

  it('reads it as tomorrow late on the Saturday before', () => {
    // 23:30 GMT on Saturday 27 March 2027.
    expect(copyFor('2027-03-28T18:00:00.000Z', '2027-03-27T23:30:00Z', 'Sunday Quiz').title).toBe(
      'Happening tomorrow: Sunday Quiz'
    )
  })
})
