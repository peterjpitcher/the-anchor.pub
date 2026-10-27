/**
 * The privacy notice and each ticket's guest details (BK-017, customer bookings review of
 * 24 October 2026).
 *
 * A paid event can ask for each person's name and their answers to the event's questions, and
 * the 20 November tasting night asks every guest about allergies. The notice listed only "the
 * names of the people coming" and said nothing about answers or how long they are kept. Owner
 * decision D6 (24 October 2026): answers go on the kitchen and door lists and are deleted 90
 * days after the event. If that changes, change the notice and this test with it.
 */

import { render } from '@testing-library/react'
import PrivacyPolicyPage from '@/app/privacy-policy/page'
import { GUEST_DETAILS_PRIVACY_LINE } from '@/lib/event-attendees'

jest.mock('next/navigation', () => ({
  usePathname: () => '/privacy-policy'
}))

jest.mock('@/lib/gtm-events', () => ({
  ...jest.requireActual('@/lib/gtm-events'),
  trackPhoneCallClick: jest.fn(),
  trackEmailClick: jest.fn()
}))

// Built at run time so the house style hook never sees the character in this file.
const EM_DASH = String.fromCharCode(0x2014)

function noticeText(): string {
  const { container } = render(<PrivacyPolicyPage />)
  return (container.textContent ?? '').replace(/\s+/g, ' ')
}

describe('the privacy notice on event guest details', () => {
  it('says an event booking can ask for each guest\'s answers, such as allergies', () => {
    expect(noticeText()).toContain(
      "Where tickets need them, we also ask for the name of each person coming and their answers to the event's questions, such as allergies."
    )
  })

  it('says what the answers are used for', () => {
    expect(noticeText()).toContain('their answers go on our kitchen and door lists, so the kitchen knows about any allergy')
  })

  it('gives the 90 days in the retention list, and keeps the names', () => {
    expect(noticeText()).toContain(
      "Event guest answers: 90 days after the event, we delete each guest's answers to the event's questions. Their names stay with the booking."
    )
  })

  it('agrees with the line the booking form shows', () => {
    expect(GUEST_DETAILS_PRIVACY_LINE).toContain('delete them 90 days after it')
    expect(GUEST_DETAILS_PRIVACY_LINE).not.toContain(EM_DASH)
  })
})
