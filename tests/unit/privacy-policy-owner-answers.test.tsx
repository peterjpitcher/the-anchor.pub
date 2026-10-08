/**
 * The privacy notice and the owner's answers of 8 October 2026.
 *
 * Each line pinned here is something the owner said that day (docs/SSOT.md
 * sections 2 and 8, and the changelog in section 18):
 *   - CCTV footage is kept for 1 month
 *   - emails sent through Resend record whether they were opened
 *   - ticking "keep my details for future roles" is the same 12 months
 *   - no payment is taken through Stripe, so the notice does not name it
 *   - no company number or registered office: Orange Jelly Limited's own
 *     notice gives neither, only that the business is based in Stanwell Moor
 * If one of those changes, change the notice and this test with it.
 */

import fs from 'fs'
import path from 'path'
import { render } from '@testing-library/react'
import PrivacyPolicyPage from '@/app/privacy-policy/page'

jest.mock('next/navigation', () => ({
  usePathname: () => '/privacy-policy'
}))

jest.mock('@/lib/gtm-events', () => ({
  ...jest.requireActual('@/lib/gtm-events'),
  trackPhoneCallClick: jest.fn(),
  trackEmailClick: jest.fn()
}))

function noticeText(): string {
  const { container } = render(<PrivacyPolicyPage />)
  return (container.textContent ?? '').replace(/\s+/g, ' ')
}

describe("the privacy notice and the owner's answers of 8 October 2026", () => {
  it('says CCTV footage is kept for 1 month, where it mentions CCTV and in the retention list', () => {
    const text = noticeText()

    expect(text).toContain('Our car park is covered by CCTV. We keep the footage for 1 month.')
    expect(text).toContain('CCTV footage: 1 month.')
  })

  it('says emails sent through Resend record whether they were opened', () => {
    const text = noticeText()

    expect(text).toContain('The emails we send through Resend record whether they were opened.')
    expect(text).toContain('such as delivered, opened or bounced')
  })

  it('says the future roles tick is the same 12 months', () => {
    expect(noticeText()).toContain(
      "That's the same if you tick the box asking us to keep your details for future roles: we keep them for 12 months, then delete them."
    )
  })

  it('does not name Stripe, because no payment is taken through it', () => {
    expect(noticeText()).not.toMatch(/stripe/i)
  })

  it('gives no company number or registered office, only where the business is based', () => {
    const text = noticeText()

    expect(text).toContain('Orange Jelly Limited, a small business based in Stanwell Moor, is the business responsible')
    expect(text).not.toMatch(/company (number|no\.?)|registered (office|in|address)/i)
  })
})

describe('the future roles tick on the job application form', () => {
  // Read from the source: the form is a client component behind a bot check,
  // and the words beside the tick are fixed text, not state.
  const FORM = fs
    .readFileSync(path.join(process.cwd(), 'app/join-our-team/_components/RecruitmentApplicationForm.tsx'), 'utf8')
    .replace(/\s+/g, ' ')

  it('says, beside the tick, that the details are kept for 12 months', () => {
    const tick = FORM.slice(FORM.indexOf('name="future_recruitment_consent"'))
    const label = tick.slice(0, tick.indexOf('</label>'))

    expect(label).toContain(
      'I agree for The Anchor to keep my details for future suitable roles. We keep them for 12 months, then delete them.'
    )
  })
})
