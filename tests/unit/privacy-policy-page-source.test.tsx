/**
 * The privacy notice and the booking's page source.
 *
 * From the day the website starts sending the page and advert a table booking
 * came from, the notice has to say so: the label sits against a named booking,
 * so it is personal data (owner decision D12). The line ships in the same
 * change as the code that sends the label.
 */

import { render, screen } from '@testing-library/react'
import PrivacyPolicyPage from '@/app/privacy-policy/page'

jest.mock('next/navigation', () => ({
  usePathname: () => '/privacy-policy'
}))

jest.mock('@/lib/gtm-events', () => ({
  ...jest.requireActual('@/lib/gtm-events'),
  trackPhoneCallClick: jest.fn(),
  trackEmailClick: jest.fn()
}))

describe('the privacy notice', () => {
  it('says a table booking records the page and advert it came from, from the address, not cookies', () => {
    render(<PrivacyPolicyPage />)

    expect(
      screen.getByText(
        'When you book a table on our website, we record which of our web pages and adverts you came from. We take this from the web address of the page you book on, not from cookies, and we keep it with your booking.'
      )
    ).toBeInTheDocument()
  })

  it('puts the line under what is collected automatically, before the next section', () => {
    render(<PrivacyPolicyPage />)

    const heading = screen.getByRole('heading', { level: 3, name: 'Information Automatically Collected' })
    const line = screen.getByText(/we record which of our web pages and adverts you came from/)
    const next = screen.getByRole('heading', { level: 2, name: '3. Job Applications' })

    expect(heading.compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(line.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('keeps the rest of the notice', () => {
    render(<PrivacyPolicyPage />)

    for (const name of ['1. Introduction', '2. Information We Collect', '5. Cookie Policy', '8. Your Rights', '12. Complaints']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument()
    }
  })
})
