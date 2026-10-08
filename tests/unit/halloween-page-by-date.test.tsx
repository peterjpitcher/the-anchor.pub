/**
 * /halloween switches itself when the party is over (site review P13, DT-002
 * and C1-017).
 *
 * Before this, only the page title and description changed. The hero, the body,
 * the closing band, the social cards and all the questions and answers kept
 * saying "Saturday 31 October, 8pm till midnight", and the "been and gone" line
 * could never show because it sat inside a block that renders nothing when it
 * has no details. Two answers also named the 7 October quiz as still to come.
 *
 * The clock is pinned on both sides of the switch. Instants are written in UTC
 * so they mean the same under `npm test` (Europe/London) and `npm run test:utc`.
 * The clocks go back on 25 October 2026, so on these dates London is on GMT.
 */

import { render, cleanup } from '@testing-library/react'
import HalloweenPage, { generateMetadata } from '@/app/halloween/page'
import { getHalloweenCopy, isHalloweenPartyOver } from '@/lib/seasonal/halloween'

jest.mock('next/navigation', () => ({
  usePathname: () => '/halloween'
}))

const DAY_AFTER_QUIZ = '2026-10-08T09:00:00Z'
const LAST_MINUTE = '2026-11-01T00:29:00Z' // 00:29 on 1 November in London
const JUST_AFTER = '2026-11-01T00:31:00Z' // 00:31 on 1 November in London
const MORNING_AFTER = '2026-11-01T01:00:00Z'

function at(instant: string): { text: string; html: string; meta: string } {
  jest.useFakeTimers().setSystemTime(new Date(instant))
  const { container } = render(<HalloweenPage />)
  const result = {
    text: container.textContent ?? '',
    html: container.innerHTML,
    meta: JSON.stringify(generateMetadata())
  }
  cleanup()
  return result
}

afterEach(() => {
  jest.useRealTimers()
})

describe('/halloween before the party', () => {
  it('flips at half past midnight London time, not before', () => {
    expect(isHalloweenPartyOver(new Date(LAST_MINUTE))).toBe(false)
    expect(isHalloweenPartyOver(new Date(JUST_AFTER))).toBe(true)
  })

  it('still invites people on the night itself', () => {
    const { text, meta } = at(LAST_MINUTE)
    expect(text).toContain('Saturday 31 October')
    expect(text).toContain('8pm')
    expect(text).toContain('This year it is')
    expect(text).not.toContain('been and gone')
    expect(meta).toContain('Saturday 31 October')
  })

  it('does not name the 7 October quiz the day after it happened', () => {
    const { html, meta } = at(DAY_AFTER_QUIZ)
    expect(html).not.toMatch(/7 October/)
    expect(html).not.toMatch(/Hint of Halloween/)
    expect(meta).not.toMatch(/7 October/)
  })
})

describe('/halloween after the party', () => {
  it.each([JUST_AFTER, MORNING_AFTER, '2027-03-01T12:00:00Z'])(
    'says the party has been and gone, with no date, time or theme, at %s',
    (instant) => {
      const { text, html, meta } = at(instant)
      expect(text).toContain('been and gone')
      // html includes the FAQPage structured data, so this covers what Google reads too.
      for (const stale of ['31 October', '8pm', 'This year it is', 'House of Horrors', 'Free entry', 'free entry', '7 October']) {
        expect(html).not.toContain(stale)
        expect(meta).not.toContain(stale)
      }
    }
  )

  it('drops the food times, which were for 31 October 2026 only', () => {
    const { text } = at(MORNING_AFTER)
    expect(text).not.toMatch(/6pm|9pm|pizza is served|full menu runs/i)
    expect(text).not.toContain('Book a Table for Food')
  })

  it('promises nothing about next year beyond "once it is confirmed"', () => {
    const copy = getHalloweenCopy(new Date(MORNING_AFTER))
    const all = JSON.stringify(copy)
    expect(all).not.toMatch(/\b20\d{2}\b/)
    expect(all).toMatch(/confirmed/)
  })
})

describe('/halloween voice', () => {
  it('never says "cheeky" (SSOT section 1)', () => {
    expect(at(DAY_AFTER_QUIZ).text).not.toMatch(/cheeky/i)
    expect(at(MORNING_AFTER).text).not.toMatch(/cheeky/i)
  })
})
