import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { anchorAPI } from '@/lib/api'
import { logError } from '@/lib/error-handling'
import {
  sanitizeCommunicationConsent,
  communicationConsentIdempotencyPart,
} from '@/lib/communication-consent-server'

// Shown to the guest whenever the order could not be created for a reason they
// cannot fix themselves. It carries the phone number because the alternative is
// a dead end: the PayPal sheet never opens and there is nothing else to try.
const ORDER_FAILED_MESSAGE =
  'We could not start your parking payment. Please try again, or call 01753 682707 and we will book your space.'

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

    // The wizard hands paypal_order_id straight to the PayPal SDK and keeps
    // booking_id for the capture step. An answer missing either is not an order
    // we can trust, so it must not leave here as a 201: PayPal would open on an
    // undefined order and the guest would see a broken payment sheet with no
    // idea who to call.
    const order = result as { paypal_order_id?: unknown; booking_id?: unknown } | null
    if (!order || !order.paypal_order_id || !order.booking_id) {
      logError('api/parking/payment/create-order', new Error('Create-order response was incomplete'), {
        registration: registrationFingerprint,
      })
      return NextResponse.json({ error: ORDER_FAILED_MESSAGE }, { status: 502 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    // error is typed as unknown; cast to access dynamic API error shape
    const apiError = error as { status?: number; code?: string }
    const status = apiError?.status === 409 ? 409 : 502

    if (status !== 409) {
      logError('api/parking/payment/create-order', error, { registration: registrationFingerprint })
    }

    const message =
      apiError?.code === 'CAPACITY_UNAVAILABLE'
        ? 'Sorry, this slot is now fully booked. Please choose different dates.'
        : ORDER_FAILED_MESSAGE
    return NextResponse.json(
      { error: message, ...(status === 409 ? { code: apiError?.code } : {}) },
      { status }
    )
  }
}
