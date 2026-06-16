import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { forwardBookingConversionToCheersAI } from '@/lib/booking-conversion-forwarding'

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

  await forwardBookingConversionToCheersAI({
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
    occurredAt: new Date().toISOString(),
  }).catch(() => undefined)
}

export async function POST(request: NextRequest): Promise<Response> {
  const parsed = BodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return jsonNoStore({ error: 'bookingId (UUID) and orderId are required' }, { status: 400 })
  }

  if (!process.env.ANCHOR_API_KEY) {
    return jsonNoStore({ error: 'Payment service unavailable' }, { status: 503 })
  }

  const { bookingId, orderId } = parsed.data
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

    const data = await response.json().catch(() => ({ error: 'Payment service unavailable' }))

    if (response.ok && data?.success === true) {
      await forwardCapturedEventConversion(request, parsed.data)
    }

    return jsonNoStore(data, { status: response.status })
  } catch {
    return jsonNoStore({ error: 'Payment service unavailable' }, { status: 502 })
  }
}
