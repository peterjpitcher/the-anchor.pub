/**
 * The privacy notice and the site's own page speed record.
 *
 * The record sets no cookie, so it does not wait for a yes: it runs until
 * analytics is switched off. The notice has to say that it happens, what is
 * kept, where, and how to stop it.
 *
 * Each claim pinned here is a fact about the code, not a style choice:
 *   - what is recorded: the keys formatWebVitalLine writes
 *     (lib/web-vitals-record.ts)
 *   - no cookie, not linked to you: the route reads the body and nothing else
 *     (tests/api/web-vitals-route.test.ts)
 *   - how to stop it: hasSwitchedAnalyticsOff in lib/cookies.ts
 *     (tests/unit/web-vitals-reporting.test.tsx)
 *   - about 30 days: how far back Vercel's runtime logs went when checked on
 *     6 October 2026
 * If one of those changes, change the notice and this test with it.
 */

import { render, screen } from '@testing-library/react'
import PrivacyPolicyPage from '@/app/privacy-policy/page'
import { Footer } from '@/components/layout/Footer'
import { formatWebVitalLine, parseWebVitalReport, WEB_VITAL_LOG_PREFIX } from '@/lib/web-vitals-record'

jest.mock('next/navigation', () => ({
  usePathname: () => '/privacy-policy'
}))

jest.mock('@/lib/gtm-events', () => ({
  ...jest.requireActual('@/lib/gtm-events'),
  trackPhoneCallClick: jest.fn(),
  trackEmailClick: jest.fn()
}))

function follows(earlier: Element, later: Element): boolean {
  return Boolean(earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING)
}

const PARAGRAPH =
  "We measure how fast our pages load and whether they jump about while loading, so we can fix problems. This uses no cookie and isn't linked to you: we record the page address, whether the screen is phone, tablet or desktop size, the timings, and which part of the page moved. Our website host, Vercel, keeps those records for about 30 days. To stop it, switch analytics cookies off in Cookie settings at the bottom of any page."

describe('the privacy notice on page speed measurement', () => {
  it('carries the paragraph, word for word, under Analytics Cookies', () => {
    render(<PrivacyPolicyPage />)

    const paragraph = screen.getByText(/^We measure how fast our pages load/)
    expect(paragraph.textContent?.replace(/\s+/g, ' ').trim()).toBe(PARAGRAPH)

    const analytics = screen.getByRole('heading', { level: 4, name: 'Analytics Cookies' })
    const marketing = screen.getByRole('heading', { level: 4, name: 'Marketing Cookies' })
    expect(follows(analytics, paragraph)).toBe(true)
    expect(follows(paragraph, marketing)).toBe(true)
  })

  it('names the control by the label the footer gives it', () => {
    const footer = render(<Footer copyright={{ year: 2026 }} />)
    const label = screen.getByRole('button', { name: 'Cookie settings' }).textContent?.trim()
    footer.unmount()

    expect(PARAGRAPH).toContain(`in ${label} at the bottom of any page.`)
  })

  it('lists everything the record holds', () => {
    const report = parseWebVitalReport({
      name: 'CLS',
      value: 0.15,
      rating: 'needs-improvement',
      path: '/whats-on',
      size: 'phone',
      moved: 'div.event-banner>img',
      dx: 0,
      dy: 84
    })
    const record = JSON.parse(formatWebVitalLine(report!).slice(WEB_VITAL_LOG_PREFIX.length + 1))

    // Each key the fullest line can hold, against the words of the notice that cover it.
    const covered: Record<string, string> = {
      path: 'the page address',
      size: 'whether the screen is phone, tablet or desktop size',
      metric: 'the timings',
      value: 'the timings',
      rating: 'the timings',
      moved: 'which part of the page moved',
      dx: 'which part of the page moved',
      dy: 'which part of the page moved'
    }

    expect(Object.keys(record).sort()).toEqual(Object.keys(covered).sort())
    for (const words of Object.values(covered)) expect(PARAGRAPH).toContain(words)
  })
})
