import { NextRequest } from 'next/server'
import { anchorAPI } from '@/lib/api'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { getSafeUpstreamErrorMessage, safeJsonParse } from '@/lib/upstream-json'
import {
  isTimeWithinRanges,
  normalizeTime,
  resolveServiceRanges
} from '@/lib/table-booking-service-windows'
import { checkSpamProtection } from '@/lib/spam-protection'
import { forwardBookingConversionToCheersAI } from '@/lib/booking-conversion-forwarding'
import { estimateTableBookingValue } from '@/lib/booking-conversion-value'
import { getClientIpAddress, hashEmailForMeta, hashPhoneForMeta } from '@/lib/booking-conversion-signals'
import {
  sanitizeCommunicationConsent,
  communicationConsentIdempotencyPart,
} from '@/lib/communication-consent-server'
import type { CommunicationConsentPayload } from '@/lib/communication-consent'

const API_BASE_URL = getManagementApiBaseUrl()

type BookingPurpose = 'food' | 'drinks'

type ManagementTableBookingPayload = {
  phone: string
  first_name?: string
  last_name?: string
  email?: string
  date: string
  time: string
  party_size: number
  purpose: BookingPurpose
  notes?: string
  dietary_requirements?: string[]
  allergies?: string[]
  default_country_code?: string
  // High chairs (0-2) and outside-seating flag. Field names here ARE the AMS
  // wire keys: this object is spread directly into the management API request
  // body. The management API expects `outside_seating` (NOT `is_outside_seating`)
  // and `high_chair_count`.
  high_chair_count?: number
  outside_seating?: boolean
  communication_consent?: CommunicationConsentPayload
}

type BookingAttributionPayload = {
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
}

type LegacyTableBookingPayload = {
  date?: string
  time?: string
  party_size?: number
  purpose?: BookingPurpose
  customer?: {
    first_name?: string
    last_name?: string
    email?: string
    mobile_number?: string
  }
  customer_phone?: string
  special_requirements?: string
  dietary_requirements?: string[] | string
  allergies?: string[] | string
  celebration_type?: string
  notes?: string
}

function mergeNotes(...parts: Array<string | undefined>): string | undefined {
  const merged = parts
    .map((part) => asTrimmedString(part))
    .filter((part): part is string => Boolean(part))

  if (merged.length === 0) return undefined
  return merged.join('\n')
}

function createIdempotencyKey(prefix: string, payload?: unknown): string {
  if (payload !== undefined) {
    return `${prefix}_${Buffer.from(JSON.stringify(payload)).toString('base64url').slice(0, 120)}`
  }

  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
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

// Parses a high-chair request into a non-negative integer clamped to 0-2.
// Returns undefined for absent/invalid input so the field is simply omitted.
function asHighChairCount(value: unknown): number | undefined {
  const raw =
    typeof value === 'number' && Number.isFinite(value)
      ? Math.floor(value)
      : typeof value === 'string' && value.trim().length > 0
        ? Number.parseInt(value.trim(), 10)
        : undefined

  if (raw === undefined || !Number.isFinite(raw)) return undefined
  return Math.min(2, Math.max(0, raw))
}

// Accepts a boolean or its common string encodings ('true'/'false', '1'/'0').
// Returns undefined for anything else so the field stays absent.
function asOptionalBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase()
    if (trimmed === 'true' || trimmed === '1') return true
    if (trimmed === 'false' || trimmed === '0') return false
  }
  return undefined
}

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => asTrimmedString(entry))
      .filter((entry): entry is string => Boolean(entry))
  }

  const single = asTrimmedString(value)
  return single ? [single] : []
}

// Parses either of the two shapes the site currently sends -- the "management"
// top-level shape (ManagementTableBookingForm) and the legacy nested
// shape with a customer{} wrapper -- into the single structured payload the
// management API expects.
//
// Defence in depth (spec §6, §8.1): the public proxy strips inbound
// `sunday_lunch` and `booking_type` from every payload before forwarding,
// regardless of value. Hostile or stale clients sending sunday_lunch=true or
// booking_type='sunday_lunch' are silently neutralised. We always forward
// booking_type='regular' to the management API.
function normaliseIncomingPayload(input: unknown): {
  payload?: ManagementTableBookingPayload
  attribution?: BookingAttributionPayload
  error?: string
} {
  if (!input || typeof input !== 'object') {
    return { error: 'Invalid request body' }
  }

  const body = input as Record<string, unknown>

  // Top-level first_name/last_name/email/phone (management form) takes
  // precedence; fall back to the nested customer{} object for any legacy
  // callers. Either is accepted.
  const customer = (body.customer && typeof body.customer === 'object'
    ? (body.customer as Record<string, unknown>)
    : {}) as Record<string, unknown>

  const phone =
    asTrimmedString(body.phone) ||
    asTrimmedString(customer.mobile_number) ||
    asTrimmedString(body.customer_phone)

  const firstName = asTrimmedString(body.first_name) || asTrimmedString(customer.first_name)
  const lastName = asTrimmedString(body.last_name) || asTrimmedString(customer.last_name)
  const email = asTrimmedString(body.email) || asTrimmedString(customer.email)

  const date = asTrimmedString(body.date)
  const time = asTrimmedString(body.time)
  const partySize = asPositiveInt(body.party_size)
  const defaultCountryCode = asTrimmedString(body.default_country_code)

  // purpose is REQUIRED. AB-001: silently coercing missing/invalid values to
  // 'food' caused direct API submissions outside kitchen hours to fail with a
  // misleading service-window error. booking_type and sunday_lunch from the
  // inbound body are still ignored (defence in depth).
  const purpose: BookingPurpose | undefined =
    body.purpose === 'drinks' ? 'drinks' : body.purpose === 'food' ? 'food' : undefined

  if (!phone || !date || !time || !partySize || !purpose) {
    return { error: 'Missing required fields: phone, date, time, party_size, purpose' }
  }

  const dietaryRequirements = toStringList(body.dietary_requirements)
  const allergies = toStringList(body.allergies)
  const communicationConsent = sanitizeCommunicationConsent(body.communication_consent)

  // High chairs (0-2) and outside seating. Structured fields forwarded to the
  // management API, never merged into notes. The inbound body uses
  // `is_outside_seating` (form/agent); we also accept `outside_seating` for
  // callers already speaking the AMS wire key, then forward the AMS key.
  const highChairCount = asHighChairCount(body.high_chair_count)
  const outsideSeating =
    asOptionalBoolean(body.is_outside_seating) ?? asOptionalBoolean(body.outside_seating)

  // notes is strictly the user's free-text. Sunday-lunch pre-order menu_selections
  // are no longer supported on the public path (spec §6, §8.1), Sundays are
  // regular food bookings now.
  const userNote =
    asTrimmedString(body.special_requirements) || asTrimmedString(body.notes)
  const occasionNote = asTrimmedString((body as LegacyTableBookingPayload).celebration_type)
  const notes = mergeNotes(
    occasionNote ? `Occasion: ${occasionNote}` : undefined,
    userNote
  )

  return {
    payload: {
      phone,
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
      ...(email ? { email } : {}),
      date,
      time,
      party_size: partySize,
      purpose,
      ...(notes ? { notes } : {}),
      ...(dietaryRequirements.length > 0 ? { dietary_requirements: dietaryRequirements } : {}),
      ...(allergies.length > 0 ? { allergies } : {}),
      ...(defaultCountryCode ? { default_country_code: defaultCountryCode } : {}),
      // Forward to AMS using the wire key `outside_seating` (not is_outside_seating).
      ...(highChairCount && highChairCount > 0 ? { high_chair_count: highChairCount } : {}),
      ...(outsideSeating === true ? { outside_seating: true } : {}),
      ...(communicationConsent ? { communication_consent: communicationConsent } : {}),
    },
    attribution: normaliseAttribution(body),
  }
}

function normaliseAttribution(body: Record<string, unknown>): BookingAttributionPayload {
  return {
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
    ]),
    ...(body.meta_consent_granted === true ? { meta_consent_granted: true } : {}),
  }
}

function copyOptionalStrings<T extends string>(body: Record<string, unknown>, keys: readonly T[]): Partial<Record<T, string>> {
  const output: Partial<Record<T, string>> = {}

  for (const key of keys) {
    const value = asTrimmedString(body[key])
    if (value) output[key] = value
  }

  return output
}

function validatePayload(payload: ManagementTableBookingPayload): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
    return 'Date must use YYYY-MM-DD format'
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(payload.time)) {
    return 'Time must use HH:mm or HH:mm:ss format'
  }

  if (payload.party_size < 1 || payload.party_size > 20) {
    return 'Party size must be between 1 and 20'
  }

  const phoneDigits = payload.phone.replace(/\D/g, '')
  if (phoneDigits.length < 7) {
    return 'Please enter a valid phone number'
  }

  if (payload.default_country_code && !/^\d{1,4}$/.test(payload.default_country_code)) {
    return 'default_country_code must contain 1 to 4 digits'
  }

  return null
}

// Customer-facing copy is intentionally neutral (no food/drinks/kitchen/bar
// references) so the public booking flow no longer exposes the internal
// purpose classification (spec §7, plan T5). Server-side logging still
// records `purpose` for diagnostics, see logError calls below.
function buildServiceWindowError(_payload: ManagementTableBookingPayload): string {
  return 'That time is outside online booking hours. Please choose another time or call 01753 682707.'
}

function pickResponseData(responseBody: unknown): Record<string, unknown> | null {
  if (!responseBody || typeof responseBody !== 'object') return null
  const body = responseBody as Record<string, unknown>
  const data = body.data && typeof body.data === 'object'
    ? body.data as Record<string, unknown>
    : body
  return data && typeof data === 'object' ? data : null
}

function buildSourceUrl(attribution: BookingAttributionPayload | undefined, request: NextRequest): string | null {
  if (attribution?.source_url) return attribution.source_url
  const referer = request.headers.get('referer')?.trim()
  if (!referer) return null

  try {
    const url = new URL(referer)
    return `${url.origin}${url.pathname}`
  } catch {
    return referer
  }
}

function resolveLandingPath(attribution: BookingAttributionPayload | undefined, sourceUrl: string | null): string | null {
  if (attribution?.landing_path) return attribution.landing_path
  if (!sourceUrl) return null
  try {
    return new URL(sourceUrl).pathname
  } catch {
    return null
  }
}

async function forwardConfirmedTableBookingConversion(
  request: NextRequest,
  payload: ManagementTableBookingPayload,
  attribution: BookingAttributionPayload | undefined,
  responseBody: unknown
) {
  const data = pickResponseData(responseBody)
  const state = typeof data?.state === 'string' ? data.state : null
  if (state !== 'confirmed') return

  const bookingId =
    asTrimmedString(data?.booking_reference) ||
    asTrimmedString(data?.booking_id) ||
    asTrimmedString(data?.table_booking_id)

  if (!bookingId) return

  const sourceUrl = buildSourceUrl(attribution, request)

  await forwardBookingConversionToCheersAI({
    sourceSite: 'www.the-anchor.pub',
    bookingId,
    metaEventId: bookingId,
    bookingType: 'table',
    tickets: payload.party_size,
    // Estimated covers revenue, not the deposit — see booking-conversion-value.ts
    value: estimateTableBookingValue(payload.party_size),
    currency: 'GBP',
    foodIntent: payload.purpose,
    sourceUrl,
    landingPath: resolveLandingPath(attribution, sourceUrl),
    utmSource: attribution?.utm_source ?? null,
    utmMedium: attribution?.utm_medium ?? null,
    utmCampaign: attribution?.utm_campaign ?? null,
    utmContent: attribution?.utm_content ?? null,
    utmTerm: attribution?.utm_term ?? null,
    fbclid: attribution?.fbclid ?? null,
    gclid: attribution?.gclid ?? null,
    shortCode: attribution?.short_code ?? null,
    attributionCapturedAt: attribution?.attribution_captured_at ?? null,
    attributionUpdatedAt: attribution?.attribution_updated_at ?? null,
    metaConsentGranted: attribution?.meta_consent_granted === true,
    fbp: attribution?.meta_consent_granted === true ? attribution.fbp ?? null : null,
    fbc: attribution?.meta_consent_granted === true ? attribution.fbc ?? null : null,
    clientUserAgent: attribution?.meta_consent_granted === true
      ? attribution.client_user_agent ?? request.headers.get('user-agent')
      : null,
    emailSha256: attribution?.meta_consent_granted === true
      ? hashEmailForMeta(payload.email)
      : null,
    phoneSha256: attribution?.meta_consent_granted === true
      ? hashPhoneForMeta(payload.phone, payload.default_country_code)
      : null,
    clientIpAddress: attribution?.meta_consent_granted === true
      ? getClientIpAddress(request)
      : null,
    occurredAt: new Date().toISOString()
  }).catch(() => undefined)
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANCHOR_API_KEY
  if (!apiKey) {
    return createApiErrorResponse('Booking service unavailable', 503)
  }

  try {
    const body = await request.json()

    const spam = await checkSpamProtection(request, body, { skipTurnstile: true })
    if (spam.blocked) return spam.response

    const normalized = normaliseIncomingPayload(body)
    if (!normalized.payload) {
      return createApiErrorResponse(normalized.error || 'Invalid booking payload', 400)
    }

    const validationError = validatePayload(normalized.payload)
    if (validationError) {
      return createApiErrorResponse(validationError, 400)
    }

    const bookingTime = normalizeTime(normalized.payload.time)

    try {
      const businessHours = await anchorAPI.getBusinessHours()
      // Always resolve as a 'regular' booking, Sunday-lunch as a separate
      // booking type is retired on the public path (spec §7.1).
      const serviceWindow = resolveServiceRanges(businessHours, normalized.payload.date, {
        bookingType: 'regular',
        purpose: normalized.payload.purpose
      })

      const canBookTime =
        !serviceWindow.closed &&
        serviceWindow.ranges.length > 0 &&
        isTimeWithinRanges(bookingTime, serviceWindow.ranges)

      if (!canBookTime) {
        return createApiErrorResponse(serviceWindow.message || buildServiceWindowError(normalized.payload), 400)
      }
    } catch (serviceWindowError) {
      logError('api/table-bookings/service-window-check', serviceWindowError, {
        date: normalized.payload.date,
        time: bookingTime,
        purpose: normalized.payload.purpose,
        bookingType: 'regular'
      })

      return createApiErrorResponse(
        'We could not verify service hours right now. Please try again shortly or call 01753 682707.',
        503
      )
    }

    const idempotencyKey =
      asTrimmedString(request.headers.get('Idempotency-Key')) ||
      createIdempotencyKey('tbl', {
        phone: normalized.payload.phone,
        date: normalized.payload.date,
        time: normalized.payload.time,
        party_size: normalized.payload.party_size,
        purpose: normalized.payload.purpose,
        // Vary the fallback key with the new features so two otherwise-identical
        // requests differing only in chairs/outside are not collapsed.
        high_chair_count: normalized.payload.high_chair_count ?? null,
        outside_seating: normalized.payload.outside_seating ?? null,
        communication_consent: communicationConsentIdempotencyPart(normalized.payload.communication_consent),
      })

    const turnstileToken = typeof body.turnstile_token === 'string' ? body.turnstile_token : null

    const upstream = await fetch(`${API_BASE_URL}/table-bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'Idempotency-Key': idempotencyKey,
        // Management API reads the Turnstile token from this header, not from the body
        ...(turnstileToken ? { 'x-turnstile-token': turnstileToken } : {})
      },
      cache: 'no-store',
      // skip_customer_sms: website bookings show PayPal buttons inline, so customer
      // doesn't need a separate SMS payment link. The management API will set
      // skip_customer_sms=false when inline PayPal setup fails so the customer
      // also receives an SMS link (spec §6, §8.9).
      // Always forward booking_type='regular', defence in depth against hostile
      // or stale clients (spec §6, §8.1).
      body: JSON.stringify({
        ...normalized.payload,
        booking_type: 'regular',
        skip_customer_sms: true
      })
    })

    const rawText = await upstream.text()
    const parsed = safeJsonParse(rawText)
    const fallbackPayload = {
      success: false,
      error: getSafeUpstreamErrorMessage(rawText, 'Booking request failed')
    }

    const responseBody = parsed ?? fallbackPayload

    if (upstream.ok) {
      await forwardConfirmedTableBookingConversion(request, normalized.payload, normalized.attribution, responseBody)
    }

    return new Response(JSON.stringify(responseBody), {
      status: upstream.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
        'X-Idempotency-Key': idempotencyKey
      }
    })
  } catch (error) {
    logError('api/table-bookings', error)
    return createApiErrorResponse(
      'We could not process your booking right now. Please call 01753 682707.',
      503
    )
  }
}
