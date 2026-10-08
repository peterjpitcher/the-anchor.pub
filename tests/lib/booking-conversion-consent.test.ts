/**
 * The server reads the visitor's cookie choice itself, and nothing that ties a
 * booking to an advert click is passed on without it.
 */

import { gateBookingConversionByConsent } from '@/lib/booking-conversion-consent'
import type { BookingConversionForwardPayload } from '@/lib/booking-conversion-forwarding'
import { cookieHeaderAllows, requestAllowsCookieCategory } from '@/lib/cookie-consent-server'

function consentCookie(choice: Record<string, unknown>): string {
  return `anchor-cookie-consent=${encodeURIComponent(JSON.stringify(choice))}`
}

describe('reading the consent cookie on the server', () => {
  it('allows a category only when the cookie says exactly true', () => {
    const header = consentCookie({ necessary: true, analytics: true, marketing: false })

    expect(cookieHeaderAllows(header, 'analytics')).toBe(true)
    expect(cookieHeaderAllows(header, 'marketing')).toBe(false)
  })

  it('finds the cookie among others', () => {
    const header = `_ga=GA1.1.1.1; ${consentCookie({ analytics: false, marketing: true })}; other=1`

    expect(cookieHeaderAllows(header, 'marketing')).toBe(true)
    expect(cookieHeaderAllows(header, 'analytics')).toBe(false)
  })

  it.each([
    ['no cookie header', null],
    ['an empty header', ''],
    ['no consent cookie', '_ga=GA1.1.1.1'],
    ['a cookie that will not parse', 'anchor-cookie-consent=%7Bnot-json'],
    ['a cookie that is not an object', 'anchor-cookie-consent=true'],
    ['a truthy value that is not true', consentCookie({ analytics: 'yes', marketing: 1 })],
    // A cookie whose name only ends the same way is somebody else's.
    ['a different cookie with a similar name', `not-${consentCookie({ analytics: true, marketing: true })}`]
  ])('fails closed on %s', (_label, header) => {
    expect(cookieHeaderAllows(header, 'analytics')).toBe(false)
    expect(cookieHeaderAllows(header, 'marketing')).toBe(false)
  })

  it('reads it from a request', () => {
    const request = { headers: new Headers({ cookie: consentCookie({ analytics: true, marketing: true }) }) }

    expect(requestAllowsCookieCategory(request, 'marketing')).toBe(true)
    expect(requestAllowsCookieCategory({ headers: new Headers() }, 'marketing')).toBe(false)
  })
})

const TAGGED: BookingConversionForwardPayload = {
  sourceSite: 'www.the-anchor.pub',
  bookingId: 'TB-1',
  metaEventId: 'TB-1',
  bookingType: 'table',
  eventDate: '2026-10-18',
  tickets: 4,
  value: 100,
  currency: 'GBP',
  foodIntent: 'food',
  sourceUrl: 'https://www.the-anchor.pub/book-table?utm_source=facebook&fbclid=fb-123&gclid=g-456#top',
  landingPath: '/sunday-lunch?fbclid=fb-123',
  utmSource: 'facebook',
  utmMedium: 'paid_social',
  utmCampaign: 'roast',
  utmContent: 'recipient-row-id',
  utmTerm: 'term',
  fbclid: 'fb-123',
  gclid: 'g-456',
  shortCode: 'abc',
  attributionCapturedAt: '2026-10-08T10:00:00.000Z',
  attributionUpdatedAt: '2026-10-08T10:05:00.000Z',
  metaConsentGranted: true,
  fbp: 'fb.1.1.1',
  fbc: 'fb.1.1.fb-123',
  clientUserAgent: 'Mozilla/5.0',
  emailSha256: 'a'.repeat(64),
  phoneSha256: 'b'.repeat(64),
  clientIpAddress: '203.0.113.9',
  occurredAt: '2026-10-08T10:06:00.000Z'
}

/** Every string anywhere in the payload, to search for something that should be gone. */
function everyString(payload: BookingConversionForwardPayload): string {
  return Object.values(payload)
    .filter((value): value is string => typeof value === 'string')
    .join(' | ')
}

describe('what goes to the marketing system with a booking', () => {
  it('is passed on whole when the browser said yes and the cookie agrees', () => {
    expect(gateBookingConversionByConsent(TAGGED, true)).toEqual(TAGGED)
  })

  it.each([
    ['the body claims consent but the cookie does not show it', { ...TAGGED }, false],
    ['the cookie allows marketing but the browser did not say so', { ...TAGGED, metaConsentGranted: false }, true],
    ['the browser said nothing either way', { ...TAGGED, metaConsentGranted: null }, true],
    ['neither says yes', { ...TAGGED, metaConsentGranted: false }, false]
  ])('loses everything that ties it to an advert when %s', (_label, payload, cookieAllows) => {
    const gated = gateBookingConversionByConsent(payload, cookieAllows)

    // The booking itself still goes: the marketing system counts bookings.
    expect(gated).toMatchObject({
      sourceSite: 'www.the-anchor.pub',
      bookingId: 'TB-1',
      bookingType: 'table',
      eventDate: '2026-10-18',
      tickets: 4,
      value: 100,
      foodIntent: 'food',
      occurredAt: '2026-10-08T10:06:00.000Z'
    })

    // The page it was made on, without the query string a click reference rides in.
    expect(gated.sourceUrl).toBe('https://www.the-anchor.pub/book-table')
    expect(gated.landingPath).toBe('/sunday-lunch')

    expect(gated).toMatchObject({
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
      fbclid: null,
      gclid: null,
      shortCode: null,
      attributionCapturedAt: null,
      attributionUpdatedAt: null,
      metaConsentGranted: false,
      fbp: null,
      fbc: null,
      clientUserAgent: null,
      emailSha256: null,
      phoneSha256: null,
      clientIpAddress: null
    })

    const text = everyString(gated)
    for (const leaked of ['fb-123', 'g-456', 'facebook', 'recipient-row-id', '203.0.113.9', 'Mozilla', '?']) {
      expect(text).not.toContain(leaked)
    }
  })

  it('copes with no page address at all', () => {
    const gated = gateBookingConversionByConsent({ ...TAGGED, sourceUrl: null, landingPath: undefined }, false)

    expect(gated.sourceUrl).toBeNull()
    expect(gated.landingPath).toBeNull()
  })
})
