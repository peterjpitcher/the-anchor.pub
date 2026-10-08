import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { pageFromRequest, reportFailure } from '@/lib/report-failure'
import { GUEST_FALLBACK, mapUpstreamFailure } from '@/lib/guest-error-messages'

const ROUTE = 'api/event-bookings/paypal/capture-order'
import { forwardBookingConversionToCheersAI } from '@/lib/booking-conversion-forwarding'
import { gateBookingConversionByConsent } from '@/lib/booking-conversion-consent'
import { requestAllowsCookieCategory } from '@/lib/cookie-consent-server'
import { getClientIpAddress, hashEmailForMeta, hashPhoneForMeta } from '@/lib/booking-conversion-signals'

// The guest has already paid by the time this route runs. A capture we cannot
// read is not a capture, and it must never be dressed up as one: the phone
// number is the only way they can find out whether the money moved.
const CAPTURE_UNAVAILABLE_MESSAGE = GUEST_FALLBACK.event_payment_capture

const BodySchema = z.object({
  bookingId: z.string().uuid(),
  orderId: z.string().trim().min(1),
  eventId: z.string().trim().min(1).nullable().optional(),
  eventSlug: z.string().trim().min(1).nullable().optional(),
  eventName: z.string().trim().min(1).nullable().optional(),
  eventCategoryName: z.string().trim().min(1).nullable().optional(),
  eventCategorySlug: z.string().trim().min(1).nullable().optional(),
  eventDate: z.string().trim().min(1).nullable().optional(),
  tickets: z.number().int().positive().nullable().optional(),
  value: z.number().nonnegative().nullable().optional(),
  foodIntent: z.string().trim().min(1).nullable().optional(),
  source_url: z.string().trim().min(1).nullable().optional(),
  landing_path: z.string().trim().min(1).nullable().optional(),
  utm_source: z.string().trim().min(1).nullable().optional(),
  utm_medium: z.string().trim().min(1).nullable().optional(),
  utm_campaign: z.string().trim().min(1).nullable().optional(),
  utm_content: z.string().trim().min(1).nullable().optional(),
  utm_term: z.string().trim().min(1).nullable().optional(),
  fbclid: z.string().trim().min(1).nullable().optional(),
  gclid: z.string().trim().min(1).nullable().optional(),
  short_code: z.string().trim().min(1).nullable().optional(),
  attribution_captured_at: z.string().trim().min(1).nullable().optional(),
  attribution_updated_at: z.string().trim().min(1).nullable().optional(),
  meta_consent_granted: z.boolean().nullable().optional(),
  fbp: z.string().trim().min(1).nullable().optional(),
  fbc: z.string().trim().min(1).nullable().optional(),
  client_user_agent: z.string().trim().min(1).nullable().optional(),
  // Advanced-matching inputs. Hashed server-side and consent-gated; the raw values
  // are never forwarded to CheersAI. The client only sends these when the visitor
  // has granted marketing consent.
  email: z.string().trim().max(320).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  default_country_code: z.string().trim().regex(/^\d{1,4}$/).nullable().optional(),
})

function jsonNoStore(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      ...(init?.headers ?? {}),
    },
  })
}

function buildSourceUrl(sourceUrl: string | null | undefined, request: NextRequest): string | null {
  if (sourceUrl) return sourceUrl
  const referer = request.headers.get('referer')?.trim()
  if (!referer) return null

  try {
    const url = new URL(referer)
    return `${url.origin}${url.pathname}`
  } catch {
    return referer
  }
}

function resolveLandingPath(landingPath: string | null | undefined, sourceUrl: string | null): string | null {
  if (landingPath) return landingPath
  if (!sourceUrl) return null

  try {
    return new URL(sourceUrl).pathname
  } catch {
    return null
  }
}

async function forwardCapturedEventConversion(
  request: NextRequest,
  payload: z.infer<typeof BodySchema>,
) {
  const sourceUrl = buildSourceUrl(payload.source_url, request)

  await forwardBookingConversionToCheersAI(gateBookingConversionByConsent({
    sourceSite: 'www.the-anchor.pub',
    bookingId: payload.bookingId,
    metaEventId: payload.bookingId,
    bookingType: 'event',
    eventId: payload.eventId ?? null,
    eventSlug: payload.eventSlug ?? null,
    eventName: payload.eventName ?? null,
    eventCategoryName: payload.eventCategoryName ?? null,
    eventCategorySlug: payload.eventCategorySlug ?? null,
    eventDate: payload.eventDate ?? null,
    tickets: payload.tickets ?? null,
    value: payload.value ?? null,
    currency: 'GBP',
    foodIntent: payload.foodIntent ?? null,
    sourceUrl,
    landingPath: resolveLandingPath(payload.landing_path, sourceUrl),
    utmSource: payload.utm_source ?? null,
    utmMedium: payload.utm_medium ?? null,
    utmCampaign: payload.utm_campaign ?? null,
    utmContent: payload.utm_content ?? null,
    utmTerm: payload.utm_term ?? null,
    fbclid: payload.fbclid ?? null,
    gclid: payload.gclid ?? null,
    shortCode: payload.short_code ?? null,
    attributionCapturedAt: payload.attribution_captured_at ?? null,
    attributionUpdatedAt: payload.attribution_updated_at ?? null,
    metaConsentGranted: payload.meta_consent_granted === true,
    fbp: payload.meta_consent_granted === true ? payload.fbp ?? null : null,
    fbc: payload.meta_consent_granted === true ? payload.fbc ?? null : null,
    clientUserAgent: payload.meta_consent_granted === true
      ? payload.client_user_agent ?? request.headers.get('user-agent')
      : null,
    emailSha256: payload.meta_consent_granted === true
      ? hashEmailForMeta(payload.email)
      : null,
    phoneSha256: payload.meta_consent_granted === true
      ? hashPhoneForMeta(payload.phone, payload.default_country_code ?? undefined)
      : null,
    clientIpAddress: payload.meta_consent_granted === true
      ? getClientIpAddress(request)
      : null,
    occurredAt: new Date().toISOString(),
  }, requestAllowsCookieCategory(request, 'marketing'))).catch(() => undefined)
}

export async function POST(request: NextRequest): Promise<Response> {
  const parsed = BodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return jsonNoStore({ error: 'bookingId (UUID) and orderId are required' }, { status: 400 })
  }

  const { bookingId, orderId } = parsed.data
  const page = pageFromRequest(request)

  if (!process.env.ANCHOR_API_KEY) {
    await reportFailure({ route: ROUTE, payment: true, status: null, reason: 'API_KEY_MISSING', reference: bookingId, page })
    return jsonNoStore({ error: CAPTURE_UNAVAILABLE_MESSAGE }, { status: 503 })
  }

  const upstream = `${getManagementApiBaseUrl()}/external/event-bookings/${bookingId}/paypal/capture-order`

  try {
    const response = await fetch(upstream, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.ANCHOR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => null)

    // A body we could not parse used to be replaced with our own error object
    // and returned under the upstream's status. On a 2xx that is a fabricated
    // confirmation for a payment nobody has verified, so it fails closed here
    // instead. A readable body is passed through untouched, which keeps the
    // upstream's 202 manual-review signal intact.
    if (data === null) {
      await reportFailure({
        route: ROUTE,
        payment: true,
        status: response.status,
        reason: 'UNREADABLE_RESPONSE',
        reference: bookingId,
        page,
      })
      return jsonNoStore({ error: CAPTURE_UNAVAILABLE_MESSAGE }, { status: 502 })
    }

    if (response.ok && data?.success === true) {
      await forwardCapturedEventConversion(request, parsed.data)
    } else if (!response.ok) {
      // The management app answers a refused capture with a bare reason code
      // (`capture_amount_mismatch`, `hold_expired`). The guest gets a sentence
      // instead, and for anything where money may have moved it tells them to
      // ring before paying again. Reported as a failure whatever the status:
      // the guest had already approved the payment.
      const mapped = mapUpstreamFailure({ status: response.status, body: data, context: 'event_payment_capture' })
      await reportFailure({
        route: ROUTE,
        payment: true,
        status: response.status,
        reason: 'UPSTREAM_NOT_OK',
        upstreamCode: mapped.code,
        reference: bookingId,
        page,
      })
      return jsonNoStore({ success: false, code: mapped.code, error: mapped.message }, { status: response.status })
    }

    return jsonNoStore(data, { status: response.status })
  } catch (error) {
    await reportFailure({ route: ROUTE, payment: true, status: null, reason: 'UNEXPECTED_ERROR', reference: bookingId, page, error })
    return jsonNoStore({ error: CAPTURE_UNAVAILABLE_MESSAGE }, { status: 502 })
  }
}
