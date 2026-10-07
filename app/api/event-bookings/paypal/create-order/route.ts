import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { pageFromRequest, reportFailure } from '@/lib/report-failure'
import { GUEST_FALLBACK, mapUpstreamFailure } from '@/lib/guest-error-messages'

const ROUTE = 'api/event-bookings/paypal/create-order'

const BodySchema = z.object({
  bookingId: z.string().uuid(),
})

const PAYMENT_UNAVAILABLE_MESSAGE = GUEST_FALLBACK.event_payment

function jsonNoStore(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      ...(init?.headers ?? {}),
    },
  })
}

export async function POST(request: NextRequest): Promise<Response> {
  const parsed = BodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return jsonNoStore({ error: 'bookingId (UUID) is required' }, { status: 400 })
  }

  const page = pageFromRequest(request)
  const reference = parsed.data.bookingId

  if (!process.env.ANCHOR_API_KEY) {
    await reportFailure({ route: ROUTE, payment: true, status: null, reason: 'API_KEY_MISSING', reference, page })
    return jsonNoStore({ error: PAYMENT_UNAVAILABLE_MESSAGE }, { status: 503 })
  }

  const upstream = `${getManagementApiBaseUrl()}/external/event-bookings/${parsed.data.bookingId}/paypal/create-order`

  try {
    const response = await fetch(upstream, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.ANCHOR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    const data = await response.json().catch(() => null)

    // An OK status whose body we cannot read, or which carries no order id, is
    // not an order. Echoing response.status here handed the caller a 2xx built
    // out of our own error object, so a gateway HTML page or a truncated reply
    // arrived looking like a created order.
    if (response.ok && !(data as { orderId?: unknown } | null)?.orderId) {
      await reportFailure({
        route: ROUTE,
        payment: true,
        status: response.status,
        reason: data === null ? 'UNREADABLE_RESPONSE' : 'NO_ORDER_ID',
        reference,
        page,
      })
      return jsonNoStore({ error: PAYMENT_UNAVAILABLE_MESSAGE }, { status: 502 })
    }

    if (!response.ok) {
      // The management app answers a refusal here with a bare reason code
      // (`hold_expired`), which used to be shown to the guest as it stood.
      const mapped = mapUpstreamFailure({ status: response.status, body: data, context: 'event_payment' })
      await reportFailure({
        route: ROUTE,
        payment: true,
        kind: mapped.kind,
        status: response.status,
        reason: data === null ? 'UNREADABLE_RESPONSE' : 'UPSTREAM_NOT_OK',
        upstreamCode: mapped.code,
        reference,
        page,
      })
      return jsonNoStore({ success: false, code: mapped.code, error: mapped.message }, { status: response.status })
    }

    return jsonNoStore(data, { status: response.status })
  } catch (error) {
    await reportFailure({ route: ROUTE, payment: true, status: null, reason: 'UNEXPECTED_ERROR', reference, page, error })
    return jsonNoStore({ error: PAYMENT_UNAVAILABLE_MESSAGE }, { status: 502 })
  }
}
