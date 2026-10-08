/**
 * What the booking forms tell a guest about how their details are used.
 *
 * Two things were wrong on 7 October 2026. The event form told guests about
 * marketing texts only, though booking an event also puts them on the email
 * list. And the airport parking form showed the marketing tick boxes, email
 * included, against the owner's rule of no email capture on the parking pages,
 * and ended its notice "Your details are never shared", which is not so: they
 * go to the companies that take the payment and send the texts and emails.
 *
 * @jest-environment jsdom
 */

import fs from 'fs'
import path from 'path'
import { render } from '@testing-library/react'
import { CommunicationConsentFields } from '@/components/CommunicationConsentFields'
import {
  DEFAULT_COMMUNICATION_CONSENT_STATE,
  GUEST_COMMS_CONSENT_TEXT_VERSION,
  GUEST_EVENT_COMPACT_CONSENT_NOTICE,
  buildCommunicationConsentPayload
} from '@/lib/communication-consent'
import { sanitizeCommunicationConsent } from '@/lib/communication-consent-server'

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('the event booking notice', () => {
  it('covers email as well as texts, and names the way out of each', () => {
    expect(GUEST_EVENT_COMPACT_CONSENT_NOTICE).toMatch(/to send you the latest from The Anchor/)
    expect(GUEST_EVENT_COMPACT_CONSENT_NOTICE).toContain('Reply NOEVENTS to stop texts')
    expect(GUEST_EVENT_COMPACT_CONSENT_NOTICE).toContain('unsubscribe link in any email')
    expect(GUEST_EVENT_COMPACT_CONSENT_NOTICE).toMatch(/confirmations and reminders carry on/i)
  })

  it('is what the compact notice shows unless a form passes its own', () => {
    const { container } = render(
      <CommunicationConsentFields
        variant="compact"
        value={DEFAULT_COMMUNICATION_CONSENT_STATE}
        onChange={() => undefined}
      />
    )

    expect(container.textContent).toBe(GUEST_EVENT_COMPACT_CONSENT_NOTICE)
    // No tick boxes: nobody is recorded as saying yes to something they were not asked.
    expect(container.querySelector('input')).toBeNull()
  })

  it('is the notice the event form renders', () => {
    const form = read('components/features/EventBooking/ManagementEventBookingForm.tsx')
    const mount = form.slice(form.indexOf('<CommunicationConsentFields'), form.indexOf('/>', form.indexOf('<CommunicationConsentFields')))

    expect(mount).toContain('variant="compact"')
    // No override: it takes the default checked above.
    expect(mount).not.toContain('notice=')
  })
})

describe('the consent wording version', () => {
  it('moved to v6 with the event notice', () => {
    expect(GUEST_COMMS_CONSENT_TEXT_VERSION).toBe('guest-comms-consent-v6')
    expect(buildCommunicationConsentPayload(DEFAULT_COMMUNICATION_CONSENT_STATE).consent_text_version).toBe(
      'guest-comms-consent-v6'
    )
  })

  it('is accepted by the server, and so is the one before it, each passed on as sent', () => {
    // A browser still running the previous bundle during a deploy showed the v5
    // words, and its record must say v5, not be dropped and not be relabelled.
    expect(sanitizeCommunicationConsent({ consent_text_version: 'guest-comms-consent-v6' })?.consent_text_version).toBe(
      'guest-comms-consent-v6'
    )
    expect(sanitizeCommunicationConsent({ consent_text_version: 'guest-comms-consent-v5' })?.consent_text_version).toBe(
      'guest-comms-consent-v5'
    )
  })

  it('still refuses a version it has never used', () => {
    expect(sanitizeCommunicationConsent({ consent_text_version: 'guest-comms-consent-v4' })).toBeUndefined()
    expect(sanitizeCommunicationConsent({ consent_text_version: 'anything' })).toBeUndefined()
  })
})

describe('the airport parking form', () => {
  const WIZARD = read('components/features/ParkingBookingWizard/index.tsx')

  it('shows no marketing tick boxes', () => {
    expect(WIZARD).not.toContain('<CommunicationConsentFields')
    expect(WIZARD).not.toContain("from '@/components/CommunicationConsentFields'")
  })

  it('sends every marketing choice as false, with the notice recorded as shown', () => {
    expect(WIZARD).toContain(
      'communication_consent: buildCommunicationConsentPayload(DEFAULT_COMMUNICATION_CONSENT_STATE)'
    )
    expect(buildCommunicationConsentPayload(DEFAULT_COMMUNICATION_CONSENT_STATE)).toMatchObject({
      service_contact_notice_shown: true,
      marketing_email_opt_in: false,
      marketing_sms_opt_in: false,
      whatsapp_opt_in: false,
      marketing_whatsapp_opt_in: false
    })
  })

  it('no longer says details are never shared, and points to the privacy policy instead', () => {
    expect(WIZARD).not.toMatch(/Your details are never shared\.\s*<\/p>/)
    expect(WIZARD).toContain('{GUEST_SERVICE_CONTACT_NOTICE} Our <a href="/privacy-policy"')
  })
})

describe('the parking terms on CCTV', () => {
  const PAGE = read('app/heathrow-parking/page.tsx')

  it('no longer says footage is never given to individuals', () => {
    expect(PAGE).not.toContain('We do not provide footage to individuals')
    expect(PAGE).not.toContain('footage will only be made available to the police')
  })

  it('points to the privacy policy and says who to ask about footage', () => {
    const term = PAGE.slice(PAGE.indexOf('6. CCTV &amp; data protection'), PAGE.indexOf('7. Compliance'))

    expect(term).toContain('href="/privacy-policy"')
    expect(term).toContain('To ask about footage, contact')
    expect(term).toContain('mailto:manager@the-anchor.pub')
  })
})
