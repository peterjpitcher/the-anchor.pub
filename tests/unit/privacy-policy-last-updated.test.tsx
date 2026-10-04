/**
 * The privacy notice printed `new Date()` at render, so "Last updated" showed
 * today's date on every view and never said when the notice had changed. The
 * date is now a hand-maintained constant in `lib/legal-pages.ts`.
 *
 * These tests fix the clock at several instants and check that the rendered
 * date is the constant every time. The expected text is built here from a
 * month table, not by calling the formatter the page uses, so a broken
 * formatter cannot agree with itself and pass.
 *
 * A hand-maintained date goes stale the first time someone edits the notice
 * and forgets it, so the last test fingerprints the notice's words. Change the
 * words without touching `lib/legal-pages.ts` and it fails.
 *
 * Run in both zones: `npm test` (Europe/London) and `npm run test:utc` (UTC,
 * which is what the serverless runtime uses).
 */

import { createHash } from 'crypto'
import { render, screen } from '@testing-library/react'
import PrivacyPolicyPage from '@/app/privacy-policy/page'
import { PRIVACY_POLICY_LAST_UPDATED, PRIVACY_POLICY_WORDS_FINGERPRINT } from '@/lib/legal-pages'
import { formatLondonLongDate } from '@/lib/time-london'

jest.mock('next/navigation', () => ({
  usePathname: () => '/privacy-policy'
}))

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

/** "2026-09-12" to "12 September 2026", with no Date and no Intl involved. */
function longDateByHand(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return `${day} ${MONTHS[month - 1]} ${year}`
}

function renderedLastUpdated(): { line: string; time: HTMLElement | null } {
  const { unmount } = render(<PrivacyPolicyPage />)
  const paragraph = screen.getByText(/^Last updated:/)
  const result = {
    line: paragraph.textContent ?? '',
    time: paragraph.querySelector('time')
  }
  unmount()
  return result
}

// All three are earlier than the notice's date can ever be, because that date
// only moves forward, so a page that reads the clock cannot pass by
// coincidence. The second is 00:30 on 1 July in London while it is still
// 30 June in UTC, the instant where the two test zones disagree about what
// "today" is.
const CLOCKS = [
  { label: 'a spring afternoon', instant: '2021-03-15T14:30:00Z' },
  { label: 'just after midnight in London, still yesterday in UTC', instant: '2024-06-30T23:30:00Z' },
  { label: 'the last second of a year', instant: '2025-12-31T23:59:59Z' }
]

describe('privacy notice "Last updated" date', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('holds a real calendar date in YYYY-MM-DD', () => {
    expect(PRIVACY_POLICY_LAST_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(() => formatLondonLongDate(PRIVACY_POLICY_LAST_UPDATED)).not.toThrow()
  })

  it.each(CLOCKS)('renders the constant with the clock at $label', ({ instant }) => {
    jest.useFakeTimers().setSystemTime(new Date(instant))

    const { line, time } = renderedLastUpdated()

    expect(line).toBe(`Last updated: ${longDateByHand(PRIVACY_POLICY_LAST_UPDATED)}`)
    expect(time).not.toBeNull()
    expect(time).toHaveAttribute('datetime', PRIVACY_POLICY_LAST_UPDATED)
  })

  it('renders the same line whatever the clock says', () => {
    const lines = CLOCKS.map(({ instant }) => {
      jest.useFakeTimers().setSystemTime(new Date(instant))
      return renderedLastUpdated().line
    })

    expect(new Set(lines).size).toBe(1)
  })
})

/** Every word a reader sees in the notice, minus the "Last updated" line. */
function noticeWords(): string {
  const { unmount } = render(<PrivacyPolicyPage />)
  const lastUpdated = screen.getByText(/^Last updated:/)
  const notice = lastUpdated.parentElement?.cloneNode(true) as HTMLElement
  unmount()

  for (const paragraph of Array.from(notice.querySelectorAll('p'))) {
    if (/^Last updated:/.test(paragraph.textContent ?? '')) paragraph.remove()
  }

  return (notice.textContent ?? '').replace(/\s+/g, ' ').trim()
}

describe('privacy notice wording guard', () => {
  it('fails when the words change and lib/legal-pages.ts does not', () => {
    const words = noticeWords()

    // The whole notice, first section to last. If the date line ever moves
    // into a wrapper of its own, this fails rather than fingerprinting nothing.
    expect(words).toContain('1. Introduction')
    expect(words).toContain('12. Complaints')
    expect(words).not.toContain('Last updated:')

    const fingerprint = createHash('sha256').update(words).digest('hex')

    if (fingerprint !== PRIVACY_POLICY_WORDS_FINGERPRINT) {
      throw new Error(
        [
          'The words of the privacy notice have changed.',
          '',
          'In lib/legal-pages.ts:',
          '  1. Set PRIVACY_POLICY_LAST_UPDATED to the day this change goes live.',
          `     It is ${PRIVACY_POLICY_LAST_UPDATED} now.`,
          '  2. Set PRIVACY_POLICY_WORDS_FINGERPRINT to:',
          `     ${fingerprint}`,
          '',
          'If only the markup changed and a reader sees the same notice, do step 2 only.'
        ].join('\n')
      )
    }
  })
})

describe('formatLondonLongDate', () => {
  it.each([
    ['2026-09-12', '12 September 2026'],
    ['2026-01-01', '1 January 2026'],
    ['2026-12-31', '31 December 2026'],
    // The days the clocks change, where a date-only value is most likely to
    // slip to the day before.
    ['2026-03-29', '29 March 2026'],
    ['2026-10-25', '25 October 2026'],
    ['2028-02-29', '29 February 2028']
  ])('formats %s as %s', (isoDate, expected) => {
    expect(formatLondonLongDate(isoDate)).toBe(expected)
    expect(expected).toBe(longDateByHand(isoDate))
  })

  it.each(['2026-02-30', '2026-13-01', '2026-9-12', '12/09/2026', '12 September 2026', ''])(
    'throws on %p rather than printing a wrong or invalid date',
    (value) => {
      expect(() => formatLondonLongDate(value)).toThrow(/not a real YYYY-MM-DD date/)
    }
  )
})
