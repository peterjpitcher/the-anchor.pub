import { NextRequest, NextResponse } from 'next/server'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { getSafeUpstreamErrorMessage, safeJsonParse } from '@/lib/upstream-json'
import { checkSpamProtection } from '@/lib/spam-protection'

const API_BASE_URL = getManagementApiBaseUrl()
const API_KEY = process.env.ANCHOR_API_KEY

type EventBookingPayload = {
  event_id: string
  phone: string
  seats: number
  first_name?: string
  last_name?: string
  email?: string
  notes?: string
  default_country_code?: string
}

function createIdempotencyKey(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`
}

function asTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function asPositiveInt(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const rounded = Math.floor(value)
    return rounded > 0 ? rounded : undefined
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseInt(value.trim(), 10)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }

  return undefined
}

function normalizePayload(input: unknown): { payload?: EventBookingPayload; error?: string } {
  if (!input || typeof input !== 'object') {
    return { error: 'Invalid request body' }
  }

  const body = input as Record<string, unknown>
  const eventId = asTrimmedString(body.event_id) || asTrimmedString(body.eventId)
  const phone = asTrimmedString(body.phone)
  const seats = asPositiveInt(body.seats)
  const firstName = asTrimmedString(body.first_name)
  const lastName = asTrimmedString(body.last_name)
  const email = asTrimmedString(body.email)
  const notes = asTrimmedString(body.notes)
  const defaultCountryCode = asTrimmedString(body.default_country_code)

  if (!eventId || !phone || !seats) {
    return { error: 'Missing required fields: event_id, phone, seats' }
  }

  return {
    payload: {
      event_id: eventId,
      phone,
      seats,
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
      ...(email ? { email } : {}),
      ...(notes ? { notes } : {}),
      ...(defaultCountryCode ? { default_country_code: defaultCountryCode } : {})
    }
  }
}

function validatePayload(payload: EventBookingPayload): string | null {
  if (payload.event_id.length < 8) {
    return 'Invalid event identifier'
  }

  if (payload.phone.length < 7) {
    return 'Please enter a valid phone number'
  }

  if (payload.seats < 1 || payload.seats > 20) {
    return 'Seats must be between 1 and 20'
  }

  if (payload.default_country_code && !/^\d{1,4}$/.test(payload.default_country_code)) {
    return 'default_country_code must contain 1 to 4 digits'
  }

  if (payload.notes && payload.notes.length > 500) {
    return 'Notes must be 500 characters or fewer'
  }

  return null
}

function hasErrorCode(input: unknown, code: string): boolean {
  if (!input || typeof input !== 'object') return false
  const payload = input as Record<string, unknown>
  const errorObject =
    payload.error && typeof payload.error === 'object'
      ? (payload.error as Record<string, unknown>)
      : null
  const dataObject =
    payload.data && typeof payload.data === 'object'
      ? (payload.data as Record<string, unknown>)
      : null

  const codes = [
    payload.code,
    errorObject?.code,
    dataObject?.code
  ]

  return codes.some((value) => typeof value === 'string' && value.toUpperCase() === code.toUpperCase())
}

function hasPolicyViolation(input: unknown): boolean {
  if (!input || typeof input !== 'object') return false
  const payload = input as Record<string, unknown>
  const errorObject =
    payload.error && typeof payload.error === 'object'
      ? (payload.error as Record<string, unknown>)
      : null
  const dataObject =
    payload.data && typeof payload.data === 'object'
      ? (payload.data as Record<string, unknown>)
      : null

  const codes = [
    payload.code,
    payload.reason,
    payload.error_code,
    errorObject?.code,
    errorObject?.type,
    dataObject?.code,
    dataObject?.reason
  ]

  return codes.some((value) => typeof value === 'string' && value.toUpperCase() === 'POLICY_VIOLATION')
}

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return createApiErrorResponse('Event booking service unavailable', 503)
  }

  try {
    const body = await request.json()

    const spam = await checkSpamProtection(request, body, { skipTurnstile: true })
    if (spam.blocked) return spam.response

    const normalized = normalizePayload(body)

    if (!normalized.payload) {
      return createApiErrorResponse(normalized.error || 'Invalid event booking payload', 400)
    }

    const validationError = validatePayload(normalized.payload)
    if (validationError) {
      return createApiErrorResponse(validationError, 400)
    }

    const idempotencyKey =
      asTrimmedString(request.headers.get('Idempotency-Key')) || createIdempotencyKey('evt')

    const upstream = await fetch(`${API_BASE_URL}/event-bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        'Idempotency-Key': idempotencyKey
      },
      cache: 'no-store',
      body: JSON.stringify(normalized.payload)
    })

    const rawText = await upstream.text()
    const parsed = safeJsonParse(rawText)
    const fallbackPayload = {
      success: false,
      error: getSafeUpstreamErrorMessage(rawText, 'Event booking request failed')
    }

    // Handle BOOKINGS_DISABLED rejection from management API
    const bookingsDisabled = upstream.status === 409 && hasErrorCode(parsed, 'BOOKINGS_DISABLED')
    if (bookingsDisabled) {
      return NextResponse.json(
        { success: false, error: { code: 'BOOKINGS_DISABLED', message: 'Bookings are not available for this event. No booking is needed — just turn up!' } },
        { status: 409, headers: { 'X-Idempotency-Key': idempotencyKey } }
      )
    }

    const policyViolation = upstream.status === 409 && hasPolicyViolation(parsed)
    if (policyViolation) {
      const message =
        (parsed && typeof parsed === 'object'
          ? (parsed as Record<string, unknown>)?.error &&
            typeof (parsed as Record<string, unknown>).error === 'object'
            ? ((parsed as Record<string, unknown>).error as Record<string, unknown>)?.message
            : (parsed as Record<string, unknown>)?.message
          : null) ||
        'This booking cannot be completed. Please contact us for assistance.'
      return NextResponse.json(
        { success: false, error: { code: 'POLICY_VIOLATION', message: String(message) } },
        { status: 409, headers: { 'X-Idempotency-Key': idempotencyKey } }
      )
    }

    const responseBody = parsed ?? fallbackPayload

    return NextResponse.json(responseBody, {
      status: upstream.status,
      headers: { 'X-Idempotency-Key': idempotencyKey }
    })
  } catch (error) {
    logError('api/event-bookings', error)
    return createApiErrorResponse(
      'We could not process this event booking right now. Please call 01753 682707.',
      503
    )
  }
}
