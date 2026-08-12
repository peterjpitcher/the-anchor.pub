import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { anchorAPI } from '@/lib/api'
import {
  sanitizeCommunicationConsent,
  communicationConsentIdempotencyPart,
} from '@/lib/communication-consent-server'

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
  communication_consent: z.unknown().optional(),
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
  //
  // The fingerprint must be built from exactly the fields the management API
  // hashes the payload with (start_at, end_at, mobile_number, registration,
  // communication_consent, see src/app/api/parking/bookings/route.ts). Anything
  // it hashes that we leave out reuses one key for two different payloads, and
  // the API answers 409 IDEMPOTENCY_KEY_CONFLICT for 24 hours: end_at was
  // missing here, so a guest who corrected only their departure time and
  // pressed PayPal again was locked out of booking at all.
  //
  // Registration is normalised the same way the API normalises it before
  // hashing, for the mirror-image reason: re-typing "AB12 CDE" as "ab12cde" is
  // the same booking to the API, so it must not mint a second key and create a
  // second booking.
  const communicationConsent = sanitizeCommunicationConsent(parsed.data.communication_consent)
  const registrationFingerprint = parsed.data.vehicle.registration.replace(/\s+/g, '').toUpperCase()
  const idempotencyKey = Buffer.from(
    `${parsed.data.customer.mobile_number}|${registrationFingerprint}|${parsed.data.start_at}|${parsed.data.end_at}|${communicationConsentIdempotencyPart(communicationConsent)}`
  ).toString('base64')

  try {
    const { communication_consent: _ignored, ...orderData } = parsed.data
    const result = await anchorAPI.createParkingPaymentOrder({
      ...orderData,
      ...(communicationConsent ? { communication_consent: communicationConsent } : {}),
    }, idempotencyKey)
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
