import { NextRequest, NextResponse } from 'next/server'
import { anchorAPI, ParkingBookingRequest } from '@/lib/api'
import { pageFromRequest, reportFailure } from '@/lib/report-failure'
import { GUEST_FALLBACK, toGuestMessage } from '@/lib/guest-error-messages'
import { normaliseUKPhone } from '@/lib/hours-utils'
import { checkSpamProtection } from '@/lib/spam-protection'
import {
  sanitizeCommunicationConsent,
  communicationConsentIdempotencyPart,
} from '@/lib/communication-consent-server'

const REQUIRED_CUSTOMER_FIELDS = ['first_name', 'last_name', 'mobile_number'] as const
const REQUIRED_VEHICLE_FIELDS = ['registration'] as const

function buildIdempotencyKey(
  fallbackData: { start_at: string; end_at: string; phone: string; registration: string; communication_consent?: unknown }
): string {
  const safe = `${fallbackData.start_at}|${fallbackData.end_at}|${fallbackData.phone}|${fallbackData.registration}|${communicationConsentIdempotencyPart(fallbackData.communication_consent)}`
  return `parking-${Buffer.from(safe).toString('base64')}`
}

export async function POST(request: NextRequest) {
  let body: any

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Request body must be valid JSON.'
      }
    }, { status: 400 })
  }

  const spam = await checkSpamProtection(request, body)
  if (spam.blocked) return spam.response

  const customer = body?.customer
  const vehicle = body?.vehicle
  const startAt = body?.start_at || body?.startAt
  const endAt = body?.end_at || body?.endAt
  const notes = body?.notes || body?.special_requests

  if (!customer || !vehicle || !startAt || !endAt) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'Customer, vehicle, start_at and end_at fields are required.'
      }
    }, { status: 400 })
  }

  const missingCustomerFields = REQUIRED_CUSTOMER_FIELDS.filter(field => !customer[field])
  if (missingCustomerFields.length > 0) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'MISSING_CUSTOMER_FIELDS',
        message: `Missing customer fields: ${missingCustomerFields.join(', ')}`
      }
    }, { status: 400 })
  }

  const missingVehicleFields = REQUIRED_VEHICLE_FIELDS.filter(field => !vehicle[field])
  if (missingVehicleFields.length > 0) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'MISSING_VEHICLE_FIELDS',
        message: `Missing vehicle fields: ${missingVehicleFields.join(', ')}`
      }
    }, { status: 400 })
  }

  const startTimestamp = Date.parse(startAt)
  const endTimestamp = Date.parse(endAt)

  if (Number.isNaN(startTimestamp) || Number.isNaN(endTimestamp)) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'INVALID_DATE',
        message: 'Start and end times must be valid ISO timestamps.'
      }
    }, { status: 400 })
  }

  if (endTimestamp <= startTimestamp) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'INVALID_RANGE',
        message: 'End time must be after the start time.'
      }
    }, { status: 400 })
  }

  const communicationConsent = sanitizeCommunicationConsent(body?.communication_consent)

  const bookingRequest: ParkingBookingRequest = {
    customer: {
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email || undefined,
      mobile_number: normaliseUKPhone(customer.mobile_number)
    },
    vehicle: {
      registration: String(vehicle.registration).replace(/\s+/g, '').toUpperCase(),
      make: vehicle.make ? String(vehicle.make) : undefined,
      model: vehicle.model ? String(vehicle.model) : undefined,
      colour: vehicle.colour ? String(vehicle.colour) : vehicle.color ? String(vehicle.color) : undefined
    },
    start_at: new Date(startTimestamp).toISOString(),
    end_at: new Date(endTimestamp).toISOString(),
    notes: notes || undefined,
    ...(communicationConsent ? { communication_consent: communicationConsent } : {})
  }

  const headerIdempotency = request.headers.get('idempotency-key')
    || request.headers.get('x-idempotency-key')
    || body?.idempotencyKey

  const computedIdempotency = buildIdempotencyKey({
    start_at: bookingRequest.start_at,
    end_at: bookingRequest.end_at,
    phone: bookingRequest.customer.mobile_number,
    registration: bookingRequest.vehicle.registration,
    communication_consent: bookingRequest.communication_consent
  })

  try {
    const booking = await anchorAPI.createParkingBooking(
      bookingRequest,
      headerIdempotency || computedIdempotency
    )

    return NextResponse.json({
      success: true,
      data: booking
    }, { status: 201 })
  } catch (error: unknown) {
    const err = error as { status?: number; code?: string; message?: string; details?: unknown }
    const status = err?.status || 500
    const code = err?.code || 'INTERNAL_ERROR'
    const guestCanAct = code === 'CAPACITY_UNAVAILABLE' || code === 'VALIDATION_ERROR'

    // This line used to carry the guest's name and number plate. Neither is
    // logged now: the status and the code are what tell us what went wrong.
    // Only the code of the thrown error is passed on, because its message can
    // repeat what the guest typed.
    await reportFailure({
      route: 'api/parking/bookings',
      kind: guestCanAct ? 'refused' : 'failed',
      status: typeof err?.status === 'number' ? err.status : null,
      reason: guestCanAct ? 'REFUSED' : 'CREATE_BOOKING_FAILED',
      upstreamCode: code,
      page: pageFromRequest(request),
      error: guestCanAct ? undefined : { code }
    })

    let message = GUEST_FALLBACK.parking_booking
    if (code === 'CAPACITY_UNAVAILABLE') {
      message = 'Those parking dates are fully booked. Pick another time or call 01753 682707 for help.'
    } else if (code === 'VALIDATION_ERROR') {
      message = toGuestMessage(err?.message || 'Please double-check the details and try again.', 'parking_booking')
    } else if (code === 'UNAUTHORIZED' || code === 'FORBIDDEN') {
      message = 'Parking bookings are offline at the moment. Please call 01753 682707 and we will secure your space.'
    }

    return NextResponse.json({
      success: false,
      error: {
        code,
        message,
        details: status >= 500 ? undefined : err?.details
      }
    }, { status })
  }
}
