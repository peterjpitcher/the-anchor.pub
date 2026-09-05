import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { logError } from '@/lib/error-handling'

const BodySchema = z.object({
  bookingId: z.string().uuid(),
})

const PAYMENT_UNAVAILABLE_MESSAGE =
  'We could not start your payment. Please try again, or call us on 01753 682707 and we will take the booking over the phone.'

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

  if (!process.env.ANCHOR_API_KEY) {
    logError('api/event-bookings/paypal/create-order', new Error('ANCHOR_API_KEY is not configured'))
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
      logError(
        'api/event-bookings/paypal/create-order',
        new Error(`Upstream ${response.status} carried no orderId`),
        { bookingId: parsed.data.bookingId },
      )
      return jsonNoStore({ error: PAYMENT_UNAVAILABLE_MESSAGE }, { status: 502 })
    }

    if (!response.ok) {
      logError(
        'api/event-bookings/paypal/create-order',
        new Error(`Upstream responded ${response.status}`),
        { bookingId: parsed.data.bookingId },
      )
      return jsonNoStore(data ?? { error: PAYMENT_UNAVAILABLE_MESSAGE }, { status: response.status })
    }

    return jsonNoStore(data, { status: response.status })
  } catch (error) {
    logError('api/event-bookings/paypal/create-order', error, { bookingId: parsed.data.bookingId })
    return jsonNoStore({ error: PAYMENT_UNAVAILABLE_MESSAGE }, { status: 502 })
  }
}
