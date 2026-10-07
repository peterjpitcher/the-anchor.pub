import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { forwardBookingConversionToCheersAI } from '@/lib/booking-conversion-forwarding'
import { getClientIpAddress, hashEmailForMeta, hashPhoneForMeta } from '@/lib/booking-conversion-signals'
import { estimateTableBookingValue } from '@/lib/booking-conversion-value'
import { pageFromRequest, reportFailure } from '@/lib/report-failure'
import { GUEST_FALLBACK, mapUpstreamFailure } from '@/lib/guest-error-messages'

const ROUTE = 'api/table-bookings/paypal/capture-order'

// The guest has already approved the payment by the time this route runs. A
// capture we cannot read is not a capture, and the phone number is the only
// way they can find out whether the money moved.
const CAPTURE_UNAVAILABLE_MESSAGE = GUEST_FALLBACK.table_deposit_capture

const BodySchema = z.object({
  bookingId: z.string().uuid(),
  orderId: z.string().min(1),
  bookingReference: z.string().trim().min(1).nullable().optional(),
  depositAmount: z.number().nonnegative().nullable().optional(),
  bookingDate: z.string().trim().min(1).nullable().optional(),
  bookingTime: z.string().trim().min(1).nullable().optional(),
  partySize: z.number().int().positive().nullable().optional(),
  bookingType: z.string().trim().min(1).nullable().optional(),
  purpose: z.string().trim().min(1).nullable().optional(),
  bookingSource: z.string().trim().min(1).nullable().optional(),
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

async function forwardCapturedDepositConversion(
  request: NextRequest,
  payload: z.infer<typeof BodySchema>,
) {
  const bookingId = payload.bookingReference || payload.bookingId
  const sourceUrl = buildSourceUrl(payload.source_url, request)

  await forwardBookingConversionToCheersAI({
    sourceSite: 'www.the-anchor.pub',
    bookingId,
    metaEventId: bookingId,
    bookingType: 'table',
    // Already collected by BodySchema and sent by PayPalDepositSection; it was parsed
    // and then dropped, leaving event_date empty on every deposit booking.
    eventDate: payload.bookingDate ?? null,
    tickets: payload.partySize ?? null,
    // Estimated covers revenue, not the deposit — see booking-conversion-value.ts
    value: estimateTableBookingValue(payload.partySize),
    currency: 'GBP',
    foodIntent: payload.purpose ?? null,
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
  }).catch(() => undefined)
}

export async function POST(request: NextRequest): Promise<Response> {
  const bodyRaw = await request.json().catch(() => null)
  const parsed = BodySchema.safeParse(bodyRaw)
  if (!parsed.success) {
    return jsonNoStore({ error: 'bookingId (UUID) and orderId are required' }, { status: 400 })
  }
  const { bookingId, orderId } = parsed.data
  const page = pageFromRequest(request)

  // This route had no log call at all and sent `Bearer undefined` when the key
  // was missing. Every exit below is reported as a payment failure: money may
  // have moved, so a person should know whatever the status was. Neither the
  // booking id nor the PayPal order id is logged in clear.
  const apiKey = process.env.ANCHOR_API_KEY
  if (!apiKey) {
    await reportFailure({ route: ROUTE, payment: true, status: null, reason: 'API_KEY_MISSING', reference: bookingId, page })
    return jsonNoStore({ success: false, error: CAPTURE_UNAVAILABLE_MESSAGE }, { status: 503 })
  }

  const upstream = `${getManagementApiBaseUrl()}/external/table-bookings/${bookingId}/paypal/capture-order`

  try {
    const response = await fetch(upstream, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const mapped = mapUpstreamFailure({ status: response.status, body: data, context: 'table_deposit_capture' })
      await reportFailure({
        route: ROUTE,
        payment: true,
        status: response.status,
        reason: data === null ? 'UNREADABLE_RESPONSE' : 'UPSTREAM_NOT_OK',
        upstreamCode: mapped.code,
        reference: bookingId,
        page,
      })
      // `error` is always one plain sentence. The management app answers some
      // refusals with an object, and the form used to render it and crash.
      return jsonNoStore({ success: false, code: mapped.code, error: mapped.message }, { status: response.status })
    }

    // An OK status around a body we cannot read, or one that does not say it
    // succeeded, is not a confirmed payment.
    if (data?.success !== true) {
      await reportFailure({
        route: ROUTE,
        payment: true,
        status: response.status,
        reason: data === null ? 'UNREADABLE_RESPONSE' : 'NOT_CONFIRMED_ON_OK',
        reference: bookingId,
        page,
      })
      return jsonNoStore({ success: false, error: CAPTURE_UNAVAILABLE_MESSAGE }, { status: 502 })
    }

    await forwardCapturedDepositConversion(request, parsed.data)

    return jsonNoStore(data)
  } catch (error) {
    await reportFailure({ route: ROUTE, payment: true, status: null, reason: 'UNEXPECTED_ERROR', reference: bookingId, page, error })
    return jsonNoStore({ success: false, error: CAPTURE_UNAVAILABLE_MESSAGE }, { status: 502 })
  }
}
