/**
 * The consent rule for what is passed to our marketing system with a booking.
 *
 * In its own file, apart from the function that does the sending
 * (lib/booking-conversion-forwarding.ts), so the rule can be tested by itself
 * and a test that replaces the sender does not also replace the rule.
 */
import type { BookingConversionForwardPayload } from '@/lib/booking-conversion-forwarding'

/** The page a booking was made on, without its query string or fragment. */
function withoutQuery(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return `${url.origin}${url.pathname}`
  } catch {
    // Not a full address (a bare path, say): cut it at the first ? or #.
    const cut = value.split(/[?#]/)[0]
    return cut || null
  }
}

/**
 * What may go to the marketing system for a guest who has not accepted
 * marketing cookies: that a booking happened, what it was, and the page it was
 * made on. Nothing that ties the booking to an advert click.
 *
 * Marketing consent counts only when the browser said so AND the consent cookie
 * on the same request agrees (lib/cookie-consent-server.ts). Without both, the
 * click references, the campaign tags, the short link code, Meta's identifiers,
 * the scrambled contact details, the IP address and the browser string are all
 * removed here, and page addresses lose their query string, which is where a
 * click reference travels.
 *
 * Every route that forwards a conversion passes its payload through this, so
 * the rule is written once. Two paths used to miss it: the browser's own
 * forward fell back to the address bar when the consent-gated record was empty,
 * and the event route sent the raw Referer header on.
 */
export function gateBookingConversionByConsent(
  payload: BookingConversionForwardPayload,
  consentCookieAllowsMarketing: boolean
): BookingConversionForwardPayload {
  if (payload.metaConsentGranted === true && consentCookieAllowsMarketing) return payload

  return {
    ...payload,
    sourceUrl: withoutQuery(payload.sourceUrl),
    landingPath: withoutQuery(payload.landingPath),
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
  }
}
