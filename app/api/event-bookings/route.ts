import { NextRequest, NextResponse } from 'next/server'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { getSafeUpstreamErrorMessage, safeJsonParse } from '@/lib/upstream-json'
import { checkSpamProtection } from '@/lib/spam-protection'
import { forwardBookingConversionToCheersAI } from '@/lib/booking-conversion-forwarding'

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
  source_url?: string
  landing_path?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  fbclid?: string
  gclid?: string
  short_code?: string
  attribution_captured_at?: string
  attribution_updated_at?: string
  meta_consent_granted?: boolean
  fbp?: string
  fbc?: string
  client_user_agent?: string
  event_slug?: string
  event_name?: string
  event_category_name?: string
  event_category_slug?: string
  event_date?: string
  event_price?: number
  event_value?: number
  food_intent?: string
  seating_preference?: 'seated' | 'standing'
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

function asNonNegativeNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed >= 0) return parsed
  }

  return undefined
}

function asSeatingPreference(value: unknown): 'seated' | 'standing' | undefined {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim().toLowerCase()
  return normalized === 'seated' || normalized === 'standing' ? normalized : undefined
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
  const eventPrice = asNonNegativeNumber(body.event_price)
  const eventValue = asNonNegativeNumber(body.event_value)
  const metaConsentGranted = body.meta_consent_granted === true
  const rawSeatingPreference = body.seating_preference ?? body.seatingPreference
  const seatingPreference = asSeatingPreference(rawSeatingPreference)

  if (!eventId || !phone || !seats) {
    return { error: 'Missing required fields: event_id, phone, seats' }
  }

  if (rawSeatingPreference !== undefined && !seatingPreference) {
    return { error: 'seating_preference must be seated or standing' }
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
      ...(defaultCountryCode ? { default_country_code: defaultCountryCode } : {}),
      ...(seatingPreference ? { seating_preference: seatingPreference } : {}),
      ...(metaConsentGranted ? { meta_consent_granted: true } : {}),
      ...copyOptionalStrings(body, [
        'source_url',
        'landing_path',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'fbclid',
        'gclid',
        'short_code',
        'attribution_captured_at',
        'attribution_updated_at',
        'fbp',
        'fbc',
        'client_user_agent',
        'event_slug',
        'event_name',
        'event_category_name',
        'event_category_slug',
        'event_date',
        'food_intent'
      ]),
      ...(eventPrice !== undefined ? { event_price: eventPrice } : {}),
      ...(eventValue !== undefined ? { event_value: eventValue } : {})
    }
  }
}

function copyOptionalStrings(source: Record<string, unknown>, keys: string[]): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key of keys) {
    const value = asTrimmedString(source[key])
    if (value) result[key] = value
  }
  return result
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

function pickResponseData(responseBody: unknown): Record<string, unknown> | null {
  if (!responseBody || typeof responseBody !== 'object') return null
  const body = responseBody as Record<string, unknown>
  const data = body.data && typeof body.data === 'object'
    ? body.data as Record<string, unknown>
    : body
  return data && typeof data === 'object' ? data : null
}

function buildSourceUrl(payload: EventBookingPayload, request: NextRequest): string | null {
  if (payload.source_url) return payload.source_url
  const referer = request.headers.get('referer')?.trim()
  return referer || null
}

async function forwardConfirmedBookingConversion(
  request: NextRequest,
  payload: EventBookingPayload,
  responseBody: unknown
) {
  const data = pickResponseData(responseBody)
  const state = typeof data?.state === 'string' ? data.state : null
  const bookingId = typeof data?.booking_id === 'string' ? data.booking_id.trim() : ''

  if (state !== 'confirmed' || !bookingId) {
    return
  }

  const sourceUrl = buildSourceUrl(payload, request)
  const landingPath = payload.landing_path || (() => {
    if (!sourceUrl) return null
    try {
      return new URL(sourceUrl).pathname
    } catch {
      return null
    }
  })()

  await forwardBookingConversionToCheersAI({
    sourceSite: 'www.the-anchor.pub',
    bookingId,
    metaEventId: bookingId,
    bookingType: 'event',
    eventId: payload.event_id,
    eventSlug: payload.event_slug ?? null,
    eventName: payload.event_name ?? null,
    eventCategoryName: payload.event_category_name ?? null,
    eventCategorySlug: payload.event_category_slug ?? null,
    eventDate: payload.event_date ?? null,
    tickets: payload.seats,
    value: payload.event_value ?? (payload.event_price !== undefined ? payload.event_price * payload.seats : null),
    currency: 'GBP',
    foodIntent: payload.food_intent ?? null,
    sourceUrl,
    landingPath,
    utmSource: payload.utm_source ?? null,
    utmMedium: payload.utm_medium ?? null,
    utmCampaign: payload.utm_campaign ?? null,
    utmContent: payload.utm_content ?? null,
    utmTerm: payload.utm_term ?? null,
    fbclid: payload.fbclid ?? null,
    gclid: payload.gclid ?? null,
    shortCode: payload.short_code ?? null,
    attributionCapturedAt: payload.attribution_captured_at ?? null,
    attributionUpdatedAt: payload.attribution_updated_at ?? null,
    metaConsentGranted: payload.meta_consent_granted === true,
    fbp: payload.meta_consent_granted === true ? payload.fbp ?? null : null,
    fbc: payload.meta_consent_granted === true ? payload.fbc ?? null : null,
    clientUserAgent: payload.meta_consent_granted === true
      ? payload.client_user_agent ?? request.headers.get('user-agent')
      : null,
    occurredAt: new Date().toISOString()
  }).catch(() => undefined)
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

    const turnstileToken = typeof body.turnstile_token === 'string' ? body.turnstile_token : null

    const upstream = await fetch(`${API_BASE_URL}/event-bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        'Idempotency-Key': idempotencyKey,
        // Management API validates the single-use Turnstile token.
        ...(turnstileToken ? { 'x-turnstile-token': turnstileToken } : {})
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
        { success: false, error: { code: 'BOOKINGS_DISABLED', message: 'Bookings are not available for this event. No booking is needed, just turn up!' } },
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

    if (upstream.ok) {
      await forwardConfirmedBookingConversion(request, normalized.payload, responseBody)
    }

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
