import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { getSafeUpstreamErrorMessage, safeJsonParse } from '@/lib/upstream-json'
import { checkSpamProtection } from '@/lib/spam-protection'
import { forwardBookingConversionToCheersAI } from '@/lib/booking-conversion-forwarding'
import { getClientIpAddress, hashEmailForMeta, hashPhoneForMeta } from '@/lib/booking-conversion-signals'
import {
  sanitizeCommunicationConsent,
  communicationConsentIdempotencyPart,
} from '@/lib/communication-consent-server'
import type { CommunicationConsentPayload } from '@/lib/communication-consent'

const API_BASE_URL = getManagementApiBaseUrl()
const API_KEY = process.env.ANCHOR_API_KEY

type TicketSelection = {
  ticket_type_id: string
  quantity: number
  attendee_names: string[]
}

type EventBookingPayload = {
  event_id: string
  phone: string
  seats: number
  attendee_names?: string[]
  ticket_selections?: TicketSelection[]
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
  communication_consent?: CommunicationConsentPayload
}

// Fallback Idempotency-Key for callers that send no header of their own.
//
// This used to be base64url(JSON) truncated to 120 characters. 120 base64
// characters encode only the first 90 bytes of the payload, and with a real
// (UUID) event id that cutoff lands inside `attendee_names`: the names, the
// ticket selection and the consent state were all silently discarded, so two
// genuinely different bookings for the same event, number and seat count
// collapsed onto one key and the second was replayed away. Hashing the whole
// payload means every field listed at the call site actually counts, which is
// the entire point of listing it. Matches the table-bookings proxy.
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

// Returns a trimmed name array when the input is an array (empties preserved so
// validatePayload can reject them), or undefined when no array was supplied.
function asNameArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
}

// Parses the multi-ticket-type payload. Returns undefined when absent, and an
// (empty-name-tolerant) normalized array otherwise so validatePayload can reject
// malformed lines with a clear message. Passed straight through to AMS, which is
// the source of truth for pricing/capacity — the proxy only shape-checks it.
function asTicketSelections(value: unknown): TicketSelection[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.map((entry) => {
    const line = (entry && typeof entry === 'object' ? entry : {}) as Record<string, unknown>
    const ticketTypeId = asTrimmedString(line.ticket_type_id) || ''
    const quantity = asPositiveInt(line.quantity) ?? 0
    const attendeeNames = asNameArray(line.attendee_names) ?? []
    return { ticket_type_id: ticketTypeId, quantity, attendee_names: attendeeNames }
  })
}

const MAX_ATTENDEE_NAME_LENGTH = 120

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
  const attendeeNames = asNameArray(body.attendee_names)
  const ticketSelections = asTicketSelections(body.ticket_selections)
  const communicationConsent = sanitizeCommunicationConsent(body.communication_consent)

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
      ...(attendeeNames ? { attendee_names: attendeeNames } : {}),
      ...(ticketSelections ? { ticket_selections: ticketSelections } : {}),
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
      ...(eventValue !== undefined ? { event_value: eventValue } : {}),
      ...(communicationConsent ? { communication_consent: communicationConsent } : {})
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

  const attendeeNames = payload.attendee_names
  const isPaidEvent = typeof payload.event_price === 'number' && payload.event_price > 0

  const ticketSelections = payload.ticket_selections
  if (ticketSelections) {
    if (ticketSelections.length === 0) {
      return 'Please choose at least one ticket'
    }
    let selectionSeatSum = 0
    for (const line of ticketSelections) {
      if (!line.ticket_type_id) {
        return 'Invalid ticket selection'
      }
      if (line.quantity < 1) {
        return 'Please choose at least one ticket'
      }
      if (line.attendee_names.length !== line.quantity) {
        return 'Please enter a name for each ticket'
      }
      if (line.attendee_names.some((name) => name.length === 0)) {
        return 'Please enter a name for each ticket'
      }
      if (line.attendee_names.some((name) => name.length > MAX_ATTENDEE_NAME_LENGTH)) {
        return `Each name must be ${MAX_ATTENDEE_NAME_LENGTH} characters or fewer`
      }
      selectionSeatSum += line.quantity
    }
    if (selectionSeatSum !== payload.seats) {
      return 'Seat total does not match the ticket selection'
    }
    // Multi-type events carry the full name set inside ticket_selections; the flat
    // attendee_names aggregate is validated below when present.
    return validateFlatAttendeeNames(attendeeNames, payload.seats)
  }

  if (isPaidEvent && (!attendeeNames || attendeeNames.length === 0)) {
    return 'Please enter a name for each ticket'
  }

  return validateFlatAttendeeNames(attendeeNames, payload.seats)
}

// Validates the flat attendee_names aggregate (shared by single- and multi-type
// paths). No-op when the aggregate is absent.
function validateFlatAttendeeNames(
  attendeeNames: string[] | undefined,
  seats: number
): string | null {
  if (!attendeeNames) return null
  if (attendeeNames.some((name) => name.length === 0)) {
    return 'Please enter a name for each ticket'
  }
  if (attendeeNames.some((name) => name.length > MAX_ATTENDEE_NAME_LENGTH)) {
    return `Each name must be ${MAX_ATTENDEE_NAME_LENGTH} characters or fewer`
  }
  if (attendeeNames.length !== seats) {
    return 'Please enter a name for each ticket'
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
    emailSha256: payload.meta_consent_granted === true
      ? hashEmailForMeta(payload.email)
      : null,
    phoneSha256: payload.meta_consent_granted === true
      ? hashPhoneForMeta(payload.phone, payload.default_country_code)
      : null,
    clientIpAddress: payload.meta_consent_granted === true
      ? getClientIpAddress(request)
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

    // Verified here, with this site's own secret. The management API only checks
    // Turnstile for callers with no API key, and does it with a different
    // widget's secret, so a forwarded token was never validated on the happy
    // path and could only fail when it was. See app/api/table-bookings/route.ts.
    const spam = await checkSpamProtection(request, body)
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
      asTrimmedString(request.headers.get('Idempotency-Key')) ||
      createIdempotencyKey('evt', {
        event_id: normalized.payload.event_id,
        phone: normalized.payload.phone,
        seats: normalized.payload.seats,
        ...(normalized.payload.attendee_names ? { attendee_names: normalized.payload.attendee_names } : {}),
        ...(normalized.payload.ticket_selections ? { ticket_selections: normalized.payload.ticket_selections } : {}),
        communication_consent: communicationConsentIdempotencyPart(normalized.payload.communication_consent),
      })

    // Token already spent by our own verification above, and the management
    // API's secret belongs to a different widget, so it is not forwarded.
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
        { success: false, error: { code: 'BOOKINGS_DISABLED', message: 'Bookings are not available for this event. No booking is needed, just turn up!' } },
        { status: 409, headers: { 'X-Idempotency-Key': idempotencyKey } }
      )
    }

    // Handle SALES_CLOSED rejection from management API (online ticket-sales cutoff)
    const salesClosed = upstream.status === 409 && hasErrorCode(parsed, 'SALES_CLOSED')
    if (salesClosed) {
      return NextResponse.json(
        { success: false, error: { code: 'SALES_CLOSED', message: 'Online ticket sales for this event have closed.' } },
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
