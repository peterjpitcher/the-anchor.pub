import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { anchorAPI } from '@/lib/api'

const CreateOrderSchema = z.object({
  customer: z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email().optional(),
    mobile_number: z.string().min(1),
  }),
  vehicle: z.object({
    registration: z.string().min(1),
    make: z.string().optional(),
    model: z.string().optional(),
    colour: z.string().optional(),
  }),
  start_at: z.string().datetime({ offset: true }),
  end_at: z.string().datetime({ offset: true }),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CreateOrderSchema.safeParse(body)
  if (!parsed.success) {
    // Zod v4 uses .issues; fall back to .errors for older versions
    const issues = parsed.error.issues ?? (parsed.error as { errors?: { message: string }[] }).errors
    return NextResponse.json(
      { error: issues?.[0]?.message || 'Invalid payload' },
      { status: 400 }
    )
  }

  // Derive an idempotency key from the booking fingerprint so duplicate button
  // clicks don't create duplicate bookings.
  const idempotencyKey = Buffer.from(
    `${parsed.data.customer.mobile_number}|${parsed.data.vehicle.registration}|${parsed.data.start_at}`
  ).toString('base64')

  try {
    const result = await anchorAPI.createParkingPaymentOrder(parsed.data, idempotencyKey)
    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    // error is typed as unknown; cast to access dynamic API error shape
    const apiError = error as { status?: number; code?: string }
    const status = apiError?.status === 409 ? 409 : 502
    const message =
      apiError?.code === 'CAPACITY_UNAVAILABLE'
        ? 'Sorry, this slot is now fully booked. Please choose different dates.'
        : 'Unable to create payment order. Please try again.'
    return NextResponse.json(
      { error: message, ...(status === 409 ? { code: apiError?.code } : {}) },
      { status }
    )
  }
}
