import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { anchorAPI } from '@/lib/api'

const CaptureSchema = z.object({
  orderID: z.string().min(1),
  bookingId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CaptureSchema.safeParse(body)
  if (!parsed.success) {
    // Zod v4 uses .issues; fall back to .errors for older versions
    const issues = parsed.error.issues ?? (parsed.error as { errors?: { message: string }[] }).errors
    return NextResponse.json(
      { error: issues?.[0]?.message || 'Invalid payload' },
      { status: 400 }
    )
  }

  try {
    const result = await anchorAPI.captureParkingPayment(parsed.data.orderID, parsed.data.bookingId)
    return NextResponse.json(result, { status: 200 })
  } catch {
    // Catch-all: surface a safe message regardless of error shape
    return NextResponse.json(
      { error: 'Payment capture failed. Please contact us if payment was taken.' },
      { status: 502 }
    )
  }
}
