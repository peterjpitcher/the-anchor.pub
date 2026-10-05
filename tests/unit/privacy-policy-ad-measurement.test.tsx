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
    const heading = screen.getByRole('heading', { level: 3, name: 'Information Automatically Collected' })
    const next = screen.getByRole('heading', { level: 2, name: '3. Job Applications' })

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

  it('puts the account under Marketing Cookies, before Preference Cookies', () => {
    render(<PrivacyPolicyPage />)

    const heading = screen.getByRole('heading', { level: 4, name: 'Marketing Cookies' })
    const next = screen.getByRole('heading', { level: 4, name: 'Preference Cookies' })
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
    expect(line).toHaveTextContent("we don't store the advert record in your browser and we send nothing about you to Meta")
    expect(line).toHaveTextContent("clearing this website's cookies in your browser")
  })

  it('lists Meta among the third-party services', () => {
    render(<PrivacyPolicyPage />)

    const heading = screen.getByRole('heading', { level: 2, name: '6. Third-Party Services' })
    const entry = screen.getByText('Meta (Facebook and Instagram)')
    expect(follows(heading, entry)).toBe(true)
    expect(entry.closest('li')).toHaveTextContent('Advert measurement, only if you accept marketing cookies')
  })

  it('has no em dash anywhere in the notice', () => {
    const { container } = render(<PrivacyPolicyPage />)

    expect(container.textContent).not.toContain(String.fromCharCode(0x2014))
  })
})
