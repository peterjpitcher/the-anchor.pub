import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'

const BodySchema = z.object({
  bookingId: z.string().uuid(),
})

export async function POST(request: NextRequest): Promise<Response> {
  const bodyRaw = await request.json().catch(() => null)
  const parsed = BodySchema.safeParse(bodyRaw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'bookingId (UUID) is required' }, { status: 400 })
  }
  const { bookingId } = parsed.data

  const upstream = `${getManagementApiBaseUrl()}/external/table-bookings/${bookingId}/paypal/create-order`

  try {
    const response = await fetch(upstream, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.ANCHOR_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Payment service unavailable' }, { status: 502 })
  }
}
