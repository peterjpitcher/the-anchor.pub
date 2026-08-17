import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { getSafeUpstreamErrorMessage, safeJsonParse } from '@/lib/upstream-json'
import { checkSpamProtection } from '@/lib/spam-protection'
import {
  sanitizeCommunicationConsent,
  communicationConsentIdempotencyPart,
} from '@/lib/communication-consent-server'
import type { CommunicationConsentPayload } from '@/lib/communication-consent'

const API_BASE_URL = getManagementApiBaseUrl()
const API_KEY = process.env.ANCHOR_API_KEY

type EventWaitlistPayload = {
  event_id: string
  phone: string
  requested_seats: number
  first_name?: string
  last_name?: string
  email?: string
  notes?: string
  default_country_code?: string
  communication_consent?: CommunicationConsentPayload
}

// Fallback Idempotency-Key for callers that send no header of their own.
//
// This used to be base64url(JSON) truncated to 120 characters. 120 base64
// characters encode only the first 90 bytes of the payload, and with a real
// (UUID) event id that cutoff lands inside `requested_seats`: the seat count
// and the consent state were silently discarded, so the same person asking for
// a different number of seats on the same event produced the same key and the
// second request was replayed away. Hashing the whole payload means every
// field listed at the call site actually counts. Matches the table-bookings
// proxy.
function createIdempotencyKey(prefix: string, payload?: unknown): string {
  if (payload !== undefined) {
    return `${prefix}_${createHash('sha256').update(JSON.stringify(payload)).digest('hex')}`
  }
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

function normalizePayload(input: unknown): { payload?: EventWaitlistPayload; error?: string } {
  if (!input || typeof input !== 'object') {
    return { error: 'Invalid request body' }
  }

  const body = input as Record<string, unknown>
  const eventId = asTrimmedString(body.event_id) || asTrimmedString(body.eventId)
  const phone = asTrimmedString(body.phone)
  const requestedSeats = asPositiveInt(body.requested_seats) || asPositiveInt(body.seats)
  const firstName = asTrimmedString(body.first_name)
  const lastName = asTrimmedString(body.last_name)
  const email = asTrimmedString(body.email)
  const notes = asTrimmedString(body.notes)
  const defaultCountryCode = asTrimmedString(body.default_country_code)
  const communicationConsent = sanitizeCommunicationConsent(body.communication_consent)

  if (!eventId || !phone || !requestedSeats) {
    return { error: 'Missing required fields: event_id, phone, requested_seats' }
  }

  return {
    payload: {
      event_id: eventId,
      phone,
      requested_seats: requestedSeats,
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
      ...(email ? { email } : {}),
      ...(notes ? { notes } : {}),
      ...(defaultCountryCode ? { default_country_code: defaultCountryCode } : {}),
      ...(communicationConsent ? { communication_consent: communicationConsent } : {})
    }
  }
}

function validatePayload(payload: EventWaitlistPayload): string | null {
  if (payload.event_id.length < 8) {
    return 'Invalid event identifier'
  }

  if (payload.phone.length < 7) {
    return 'Please enter a valid phone number'
  }

  if (payload.requested_seats < 1 || payload.requested_seats > 20) {
    return 'Requested seats must be between 1 and 20'
  }

  if (payload.default_country_code && !/^\d{1,4}$/.test(payload.default_country_code)) {
    return 'default_country_code must contain 1 to 4 digits'
  }

  if (payload.notes && payload.notes.length > 500) {
    return 'Notes must be 500 characters or fewer'
  }

  return null
}

function hasUpstreamErrorCode(input: unknown, code: string): boolean {
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

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return createApiErrorResponse('Event waitlist service unavailable', 503)
  }

  try {
    const body = await request.json()

    // Verified here, with this site's own secret. See app/api/table-bookings/route.ts
    // for why the management API cannot be relied on to check a forwarded token.
    const spam = await checkSpamProtection(request, body)
    if (spam.blocked) return spam.response

    const normalized = normalizePayload(body)

    if (!normalized.payload) {
      return createApiErrorResponse(normalized.error || 'Invalid event waitlist payload', 400)
    }

    const validationError = validatePayload(normalized.payload)
    if (validationError) {
      return createApiErrorResponse(validationError, 400)
    }

    const idempotencyKey =
      asTrimmedString(request.headers.get('Idempotency-Key')) ||
      createIdempotencyKey('wlt', {
        event_id: normalized.payload.event_id,
        phone: normalized.payload.phone,
        requested_seats: normalized.payload.requested_seats,
        communication_consent: communicationConsentIdempotencyPart(normalized.payload.communication_consent),
      })

    // Token already spent by our own verification above, and the management
    // API's secret belongs to a different widget, so it is not forwarded.
    const upstream = await fetch(`${API_BASE_URL}/event-waitlist`, {
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
      error: getSafeUpstreamErrorMessage(rawText, 'Event waitlist request failed')
    }

    // Handle BOOKINGS_DISABLED rejection from management API
    if (upstream.status === 409 && hasUpstreamErrorCode(parsed, 'BOOKINGS_DISABLED')) {
      return NextResponse.json(
        { success: false, error: { code: 'BOOKINGS_DISABLED', message: 'Bookings are not available for this event. No booking is needed, just turn up!' } },
        { status: 409, headers: { 'X-Idempotency-Key': idempotencyKey } }
      )
    }

    return NextResponse.json(parsed ?? fallbackPayload, {
      status: upstream.status,
      headers: {
        'X-Idempotency-Key': idempotencyKey
      }
    })
  } catch (error) {
    logError('api/event-waitlist', error)
    return createApiErrorResponse(
      'We could not join the waitlist right now. Please call 01753 682707.',
      503
    )
  }
}
