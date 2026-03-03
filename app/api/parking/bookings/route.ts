import { NextResponse } from 'next/server'
import { anchorAPI, ParkingBookingRequest } from '@/lib/api'
import { logError } from '@/lib/error-handling'
import { normaliseUKPhone } from '@/lib/hours-utils'

const REQUIRED_CUSTOMER_FIELDS = ['first_name', 'last_name', 'mobile_number'] as const
const REQUIRED_VEHICLE_FIELDS = ['registration'] as const

function buildIdempotencyKey(
  fallbackData: { start_at: string; end_at: string; phone: string; registration: string }
): string {
  const safe = `${fallbackData.start_at}|${fallbackData.end_at}|${fallbackData.phone}|${fallbackData.registration}`
  return `parking-${Buffer.from(safe).toString('base64')}`
}

export async function POST(request: Request) {
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
    notes: notes || undefined
  }

  const headerIdempotency = request.headers.get('idempotency-key')
    || request.headers.get('x-idempotency-key')
    || body?.idempotencyKey

  const computedIdempotency = buildIdempotencyKey({
    start_at: bookingRequest.start_at,
    end_at: bookingRequest.end_at,
    phone: bookingRequest.customer.mobile_number,
    registration: bookingRequest.vehicle.registration
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
    logError('api/parking/bookings', error, {
      customer: `${bookingRequest.customer.first_name} ${bookingRequest.customer.last_name}`,
      registration: bookingRequest.vehicle.registration
    })

    const err = error as { status?: number; code?: string; message?: string; details?: unknown }
    const status = err?.status || 500
    const code = err?.code || 'INTERNAL_ERROR'

    let message = 'We could not create your parking booking right now. Please try again or call 01753 682707.'
    if (code === 'CAPACITY_UNAVAILABLE') {
      message = 'Those parking dates are fully booked. Pick another time or call us for help.'
    } else if (code === 'VALIDATION_ERROR') {
      message = err?.message || 'Please double-check the details and try again.'
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
