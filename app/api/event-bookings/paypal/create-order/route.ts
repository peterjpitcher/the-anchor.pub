import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'

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

export async function POST(request: NextRequest): Promise<Response> {
  const parsed = BodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return jsonNoStore({ error: 'bookingId (UUID) is required' }, { status: 400 })
  }

  if (!process.env.ANCHOR_API_KEY) {
    return jsonNoStore({ error: 'Payment service unavailable' }, { status: 503 })
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

    const data = await response.json().catch(() => ({ error: 'Payment service unavailable' }))
    return jsonNoStore(data, { status: response.status })
  } catch {
    return jsonNoStore({ error: 'Payment service unavailable' }, { status: 502 })
  }
}
