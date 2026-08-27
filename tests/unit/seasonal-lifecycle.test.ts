import { isHalloweenPartyOver, HALLOWEEN_PARTY_ENDS } from '@/lib/seasonal/halloween'
import fs from 'fs'
import path from 'path'

/**
 * Seasonal pages go wrong on a date certain, and nothing prompts anyone.
 *
 * /halloween stated "Saturday 31 October, 8pm till midnight, free entry" as
 * flat fact with no date logic at all, in the body AND the metadata. On 1
 * November it would have kept inviting people to a party that had happened.
 * /quiz-night/themed hardcoded `status: 'upcoming'`, so on 26 September it
 * would still have advertised the 25 September quiz as the next one.
 *
 * Neither would have failed any test, because the failure is the passage of
 * time rather than a code path.
 */
describe('Halloween party lifecycle', () => {
  it('is upcoming the afternoon before', () => {
    expect(isHalloweenPartyOver(new Date('2026-10-31T15:00:00'))).toBe(false)
  })

  it('is still upcoming at 10pm on the night, when people are deciding', () => {
    expect(isHalloweenPartyOver(new Date('2026-10-31T22:00:00'))).toBe(false)
  })

  it('is over once the night has finished', () => {
    expect(isHalloweenPartyOver(new Date('2026-11-01T09:00:00'))).toBe(true)
  })

  it('is over a year later, rather than quietly coming round again', () => {
    expect(isHalloweenPartyOver(new Date('2027-10-30T12:00:00'))).toBe(true)
  })

  it('ends after midnight, not at the advertised start time', () => {
    expect(HALLOWEEN_PARTY_ENDS.getHours()).toBeGreaterThanOrEqual(0)
    expect(isHalloweenPartyOver(new Date('2026-10-31T20:00:00'))).toBe(false)
  })
})

describe('themed quiz hub derives status rather than storing it', () => {
  const src = fs.readFileSync(
    path.join(process.cwd(), 'app/quiz-night/themed/page.tsx'),
    'utf8',
  )

  it('does not hardcode an upcoming/past status on any night', () => {
    expect(src).not.toMatch(/status:\s*'(upcoming|past)'/)
  })

  it('derives status from the event date in the slug', () => {
    expect(src).toMatch(/isUpcoming/)
    expect(src).toMatch(/\(\\d\{4\}-\\d\{2\}-\\d\{2\}\)\$|\\d\{4\}-\\d\{2\}-\\d\{2\}/)
  })

  it('has something to say when nothing themed is booked in', () => {
    // Silently hiding the section leaves a page about themed quiz nights with
    // no way to attend one, which reads as abandoned.
    expect(src).toMatch(/upcoming\.length === 0/)
    expect(src).toMatch(/Nothing themed booked in/)
  })

  it('no longer asserts a specific next date in the FAQ', () => {
    expect(src).not.toMatch(/The next one is our Only Fools and Horses quiz on Friday 25 September/)
  })
})
