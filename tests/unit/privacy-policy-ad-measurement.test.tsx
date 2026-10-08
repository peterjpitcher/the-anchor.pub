/**
 * The privacy notice and advert measurement.
 *
 * Accepting marketing cookies switches on more than a cookie: the site keeps a
 * 90-day record of the advert a visitor came from, and a booking is reported to
 * Meta with identifiers and hashed contact details. The notice has to say so,
 * and has to say that an event booking records the page it was made on.
 *
 * Each figure pinned here is a fact about the code, not a style choice:
 *   - 90 days: ATTRIBUTION_TTL_DAYS in lib/booking-attribution.ts
 *   - what goes to Meta: lib/meta-pixel.ts and the conversion forward in
 *     app/api/event-bookings/route.ts and app/api/table-bookings/route.ts
 *   - 7 days and 24 months: the data retention job in CheersAI, which receives
 *     the forward
 *   - Meta and LinkedIn: the two tags in the Tag Manager container that need
 *     marketing consent
 * If one of those changes, change the notice and this test with it.
 */

import { render, screen, within } from '@testing-library/react'
import PrivacyPolicyPage from '@/app/privacy-policy/page'

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

describe('the privacy notice on event bookings', () => {
  it('says an event booking records the page it was made on', () => {
    render(<PrivacyPolicyPage />)

    const line = screen.getByText(
      'When you book an event on our website, we record which of our web pages you booked from, and we keep it with your booking.'
    )
    const heading = screen.getByRole('heading', { level: 3, name: 'What we collect automatically' })
    const next = screen.getByRole('heading', { level: 2, name: '3. Job applications' })

    expect(follows(heading, line)).toBe(true)
    expect(follows(line, next)).toBe(true)
  })
})

describe('the privacy notice on marketing cookies', () => {
  function marketingList(): HTMLElement {
    const intro = screen.getByText(
      'If you accept marketing cookies, this is what we do so we can tell which of our adverts work:'
    )
    const list = intro.nextElementSibling as HTMLElement
    expect(list.tagName).toBe('UL')
    return list
  }

  it('puts the account under Marketing Cookies, before the next heading', () => {
    render(<PrivacyPolicyPage />)

    const heading = screen.getByRole('heading', { level: 4, name: 'Marketing cookies' })
    const next = screen.getByRole('heading', { level: 3, name: 'Maps and videos' })
    const list = marketingList()

    expect(follows(heading, list)).toBe(true)
    expect(follows(list, next)).toBe(true)
  })

  it('says the advert is remembered for up to 90 days, click reference included', () => {
    render(<PrivacyPolicyPage />)

    const item = within(marketingList()).getByText(/We remember the advert or link that brought you to our website/)
    expect(item).toHaveTextContent('for up to 90 days')
    expect(item).toHaveTextContent("in a cookie and in your browser's storage")
    expect(item).toHaveTextContent('the click reference that Facebook, Instagram or Google added to the link')
  })

  it('names Meta and lists what is sent to it', () => {
    render(<PrivacyPolicyPage />)

    const item = within(marketingList()).getByText(/We tell Meta, the company behind Facebook and Instagram/)
    for (const sent of [
      "Meta's cookie identifiers",
      'your IP address and browser type',
      'the page address',
      'your booking reference',
      'what you booked and its value',
      'your email address and phone number in a scrambled form (called hashing), never as readable text'
    ]) {
      expect(item).toHaveTextContent(sent)
    }
    expect(item).toHaveTextContent('We never send Meta your name.')
  })

  it('says when the identifiers and the record are deleted', () => {
    render(<PrivacyPolicyPage />)

    const item = within(marketingList()).getByText(/Our marketing system deletes the click reference/)
    expect(item).toHaveTextContent('after 7 days')
    expect(item).toHaveTextContent('It deletes the rest of its record of the booking after 24 months.')
  })

  it('says what happens without marketing cookies, and how to change your mind', () => {
    render(<PrivacyPolicyPage />)

    const line = screen.getByText(/If you don't accept marketing cookies/)
    expect(line).toHaveTextContent("we don't store the advert record in your browser and we send nothing about you to Meta or LinkedIn.")
    // The footer's Cookie settings control reopens the choice on any page, so the
    // notice points there. It used to tell people to clear the site's cookies,
    // which was the only way to withdraw until the control existed.
    expect(line).toHaveTextContent(
      'You can change your mind at any time. Choose Cookie settings at the bottom of any page. If you switch marketing cookies off, we delete the advert record from your browser.'
    )
    expect(line).not.toHaveTextContent(/clearing this website's cookies/)
  })

  it('names LinkedIn, whose tag also needs marketing cookies', () => {
    render(<PrivacyPolicyPage />)

    expect(
      within(marketingList()).getByText(
        "LinkedIn's advertising tag also loads on our pages, which tells LinkedIn you visited our website."
      )
    ).toBeInTheDocument()

    const heading = screen.getByRole('heading', { level: 2, name: '6. Who else handles your information' })
    const entry = screen.getByText('LinkedIn')
    expect(follows(heading, entry)).toBe(true)
    expect(entry.closest('li')).toHaveTextContent('Advertising tag, only if you accept marketing cookies')
  })

  it('lists Meta among the third-party services', () => {
    render(<PrivacyPolicyPage />)

    const heading = screen.getByRole('heading', { level: 2, name: '6. Who else handles your information' })
    const entry = screen.getByText('Meta (Facebook and Instagram)')
    expect(follows(heading, entry)).toBe(true)
    expect(entry.closest('li')).toHaveTextContent('Advert measurement, only if you accept marketing cookies')
  })

  // What the notice promises here is what removeTrackerCookies in lib/cookies.ts does,
  // and tests/unit/cookie-withdrawal-cleanup.test.tsx holds that to the browser's own
  // cookie jar. The four companies are the ones whose tags the container runs. The
  // second sentence is the limit of it: their own domains are out of our reach.
  it('says switching a category off deletes its cookies, and which ones we cannot reach', () => {
    render(<PrivacyPolicyPage />)

    const line = screen.getByText(/If you switch analytics or marketing cookies off/)
    expect(line).toHaveTextContent(
      "If you switch analytics or marketing cookies off, we delete them from your browser. We can't delete the cookies that Google, Microsoft, Meta and LinkedIn keep for their own websites. You can clear those in your browser settings."
    )

    const heading = screen.getByRole('heading', { level: 3, name: 'Managing cookies' })
    const next = screen.getByRole('heading', { level: 2, name: '6. Who else handles your information' })
    expect(follows(heading, line)).toBe(true)
    expect(follows(line, next)).toBe(true)
  })

  it('has no em dash anywhere in the notice', () => {
    const { container } = render(<PrivacyPolicyPage />)

    expect(container.textContent).not.toContain(String.fromCharCode(0x2014))
  })
})
