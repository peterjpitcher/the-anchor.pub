import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { pageFromRequest, reportFailure } from '@/lib/report-failure'
import { GUEST_FALLBACK, mapUpstreamFailure } from '@/lib/guest-error-messages'
import { PAYMENT_RATE_LIMIT_MESSAGE, RATE_LIMITS, limitByAddress, tooManyRequests } from '@/lib/rate-limit'

const ROUTE = 'api/table-bookings/paypal/create-order'

const BodySchema = z.object({
  bookingId: z.string().uuid(),
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

/**
 * Starts the PayPal order for a table deposit.
 *
 * This route used to log nothing at all, send `Bearer undefined` when the key
 * was missing, and pass the management app's body straight to the form. Some
 * of those bodies carry `error` as an object, which the form rendered and so
 * crashed the page at the moment a booking existed and a deposit was owed.
 * Every failure is now reported, and `error` is always one plain sentence.
 */
export async function POST(request: NextRequest): Promise<Response> {
  // Ten orders an hour from one address. Per server (lib/rate-limit.ts).
  const rateLimit = limitByAddress(request, 'table-deposit-create', RATE_LIMITS.paymentCreate)
  if (rateLimit.limited) {
    return tooManyRequests(rateLimit, { success: false, code: 'RATE_LIMITED', error: PAYMENT_RATE_LIMIT_MESSAGE })
  }

  const bodyRaw = await request.json().catch(() => null)
  const parsed = BodySchema.safeParse(bodyRaw)
  if (!parsed.success) {
    return jsonNoStore({ success: false, error: 'bookingId (UUID) is required' }, { status: 400 })
  }
  const { bookingId } = parsed.data
  const page = pageFromRequest(request)

  const apiKey = process.env.ANCHOR_API_KEY
  if (!apiKey) {
    await reportFailure({ route: ROUTE, payment: true, status: null, reason: 'API_KEY_MISSING', reference: bookingId, page })
    return jsonNoStore({ success: false, error: GUEST_FALLBACK.table_deposit }, { status: 503 })
  }

  const upstream = `${getManagementApiBaseUrl()}/external/table-bookings/${bookingId}/paypal/create-order`

  try {
    const response = await fetch(upstream, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const mapped = mapUpstreamFailure({ status: response.status, body: data, context: 'table_deposit' })
      await reportFailure({
        route: ROUTE,
        payment: true,
        kind: mapped.kind,
        status: response.status,
        reason: data === null ? 'UNREADABLE_RESPONSE' : 'UPSTREAM_NOT_OK',
        upstreamCode: mapped.code,
        reference: bookingId,
        page,
      })
      return jsonNoStore({ success: false, code: mapped.code, error: mapped.message }, { status: response.status })
    }

    // An OK status with no order id is not an order: a gateway page answers
    // 200 too. Handing it on left the form opening PayPal on nothing.
    if (!(data as { orderId?: unknown } | null)?.orderId) {
      await reportFailure({
        route: ROUTE,
        payment: true,
        status: response.status,
        reason: data === null ? 'UNREADABLE_RESPONSE' : 'NO_ORDER_ID',
        reference: bookingId,
        page,
      })
      return jsonNoStore({ success: false, error: GUEST_FALLBACK.table_deposit }, { status: 502 })
    }

    return jsonNoStore(data)
  } catch (error) {
    await reportFailure({ route: ROUTE, payment: true, status: null, reason: 'UNEXPECTED_ERROR', reference: bookingId, page, error })
    return jsonNoStore({ success: false, error: GUEST_FALLBACK.table_deposit }, { status: 502 })
  }
}
