import { NextRequest } from 'next/server'
import { anchorAPI } from '@/lib/api'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { getSafeUpstreamErrorMessage, safeJsonParse } from '@/lib/upstream-json'
import { getSundayLunchCutoffDate, hasSundayLunchCutoffPassed, isSundayIsoDate } from '@/lib/sunday-lunch-cutoff'
import {
  isTimeWithinRanges,
  normalizeTime,
  resolveServiceRanges
} from '@/lib/table-booking-service-windows'
import { checkSpamProtection } from '@/lib/spam-protection'

const API_BASE_URL = getManagementApiBaseUrl()
const API_KEY = process.env.ANCHOR_API_KEY

type BookingPurpose = 'food' | 'drinks'

type SundayPreorderItem = {
  menu_dish_id: string
  quantity: number
}

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
  sunday_lunch?: boolean
  dietary_requirements?: string[]
  allergies?: string[]
  sunday_preorder_items?: SundayPreorderItem[]
  default_country_code?: string
}

type LegacyTableBookingPayload = {
  booking_type?: 'regular' | 'sunday_lunch'
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
  menu_selections?: Array<{
    menu_dish_id?: string
    guest_name?: string
    custom_item_name?: string
    item_type?: string
    quantity?: number
    price_at_booking?: number
  }>
}

function mergeNotes(...parts: Array<string | undefined>): string | undefined {
  const merged = parts
    .map((part) => asTrimmedString(part))
    .filter((part): part is string => Boolean(part))

  if (merged.length === 0) return undefined
  return merged.join('\n')
}

function createIdempotencyKey(prefix: string): string {
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

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => asTrimmedString(entry))
      .filter((entry): entry is string => Boolean(entry))
  }

  const single = asTrimmedString(value)
  return single ? [single] : []
}

// Aggregates menu_selections entries into sunday_preorder_items keyed by
// menu_dish_id. Entries without a menu_dish_id are skipped -- they'll still
// appear in the auto-generated note blob as a kitchen-side fallback, but the
// management API now expects structured UUIDs so it can populate
// table_booking_items.
function buildSundayPreorderItems(
  value: unknown
): SundayPreorderItem[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined

  const totals = new Map<string, number>()

  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue
    const item = entry as Record<string, unknown>
    const menuDishId = asTrimmedString(item.menu_dish_id)
    if (!menuDishId) continue
    const quantity = asPositiveInt(item.quantity) ?? 1
    totals.set(menuDishId, (totals.get(menuDishId) ?? 0) + quantity)
  }

  if (totals.size === 0) return undefined

  return Array.from(totals, ([menu_dish_id, quantity]) => ({ menu_dish_id, quantity }))
}

// A human-readable fallback summary of the pre-order in case saveSundayPreorder
// on the management side fails -- it stays in the free-text notes column so
// the kitchen is never blind. Once we have confidence in the structured path
// we can drop this.
function buildMenuSelectionFallbackNote(
  value: LegacyTableBookingPayload['menu_selections']
): string | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined

  const parts = value
    .slice(0, 12)
    .map((item) => {
      const guest = asTrimmedString(item.guest_name) || 'Guest'
      const dish = asTrimmedString(item.custom_item_name) || 'Menu item'
      const quantity = asPositiveInt(item.quantity) || 1
      return `${guest}: ${dish} x${quantity}`
    })
    .join(' | ')

  if (!parts) return undefined
  return `Sunday lunch pre-order: ${parts}`
}

// Parses either of the two shapes the site currently sends -- the "management"
// top-level shape (ManagementTableBookingForm) and the "legacy" nested
// shape with a customer{} wrapper (SundayLunchBookingForm) -- into the single
// structured payload the management API expects. Key guarantee: customer name,
// email, dietary needs, allergies, and per-guest pre-order dishes end up in
// their own structured fields, not stuffed into the notes blob.
function normaliseIncomingPayload(input: unknown): {
  payload?: ManagementTableBookingPayload
  error?: string
} {
  if (!input || typeof input !== 'object') {
    return { error: 'Invalid request body' }
  }

  const body = input as Record<string, unknown>

  // Top-level first_name/last_name/email/phone (management form) takes
  // precedence; fall back to the nested customer{} object for the Sunday lunch
  // form. Either is accepted.
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

  // Sunday lunch is signalled either by a top-level boolean or by the legacy
  // booking_type string. Either works.
  const sundayLunch =
    body.sunday_lunch === true || body.booking_type === 'sunday_lunch'

  // Sunday lunch always implies a food booking; otherwise respect purpose or
  // default to food (kitchen bookings are the common case via this route).
  const explicitPurpose =
    body.purpose === 'drinks' ? 'drinks' : body.purpose === 'food' ? 'food' : undefined
  const purpose: BookingPurpose = sundayLunch
    ? 'food'
    : explicitPurpose ?? (body.purpose === undefined ? 'food' : undefined as unknown as BookingPurpose)

  if (!phone || !date || !time || !partySize || !purpose) {
    return { error: 'Missing required fields: phone, date, time, party_size, purpose' }
  }

  const dietaryRequirements = toStringList(body.dietary_requirements)
  const allergies = toStringList(body.allergies)

  const sundayPreorderItems = buildSundayPreorderItems(body.menu_selections)

  // notes is strictly the user's free-text (e.g. "anniversary dinner") -- the
  // Sunday lunch form labels it "special_requirements", the management form
  // labels it "notes". We also append a human-readable fallback summary of the
  // pre-order so the kitchen isn't blind if the structured items save fails on
  // the management side.
  const userNote =
    asTrimmedString(body.special_requirements) || asTrimmedString(body.notes)
  const occasionNote = asTrimmedString(body.celebration_type)
  const fallbackSelectionNote = sundayLunch
    ? buildMenuSelectionFallbackNote(
        body.menu_selections as LegacyTableBookingPayload['menu_selections']
      )
    : undefined
  const notes = mergeNotes(
    occasionNote ? `Occasion: ${occasionNote}` : undefined,
    userNote,
    fallbackSelectionNote
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
      ...(sundayLunch ? { sunday_lunch: true } : {}),
      ...(dietaryRequirements.length > 0 ? { dietary_requirements: dietaryRequirements } : {}),
      ...(allergies.length > 0 ? { allergies } : {}),
      ...(sundayPreorderItems ? { sunday_preorder_items: sundayPreorderItems } : {}),
      ...(defaultCountryCode ? { default_country_code: defaultCountryCode } : {}),
    },
  }
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

function buildServiceWindowError(payload: ManagementTableBookingPayload): string {
  if (payload.sunday_lunch === true) {
    return 'Sunday lunch is only available during the Sunday lunch service window. Please choose a listed Sunday lunch time or call 01753 682707.'
  }

  if (payload.purpose === 'food') {
    return 'Food bookings are only available during kitchen hours. For later bookings, switch to drinks-only or call 01753 682707.'
  }

  return 'That time is outside our drinks booking window. Please choose another time or call 01753 682707.'
}

export async function POST(request: NextRequest) {
  if (!API_KEY) {
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

    if (normalized.payload.sunday_lunch === true && normalized.payload.purpose !== 'food') {
      return createApiErrorResponse('Sunday lunch bookings must be made as food bookings.', 400)
    }

    // Enforce Sunday lunch pre-order cutoff: 1pm Saturday (London time) before the selected Sunday.
    if (normalized.payload.sunday_lunch === true) {
      if (!isSundayIsoDate(normalized.payload.date)) {
        return createApiErrorResponse('Sunday lunch bookings can only be made for Sundays.', 400)
      }

      if (hasSundayLunchCutoffPassed(normalized.payload.date, new Date())) {
        const cutoffDate = getSundayLunchCutoffDate(normalized.payload.date)
        const cutoffLabel = cutoffDate ? ` (cutoff: 1pm Saturday ${cutoffDate} London time)` : ''

        return createApiErrorResponse(
          `Sunday lunch pre-orders for ${normalized.payload.date} are now closed. Please book a weekday menu table instead or call 01753 682707.${cutoffLabel}`,
          400
        )
      }
    }

    const bookingType = normalized.payload.sunday_lunch === true ? 'sunday_lunch' : 'regular'
    const bookingPurpose = normalized.payload.sunday_lunch === true ? 'food' : normalized.payload.purpose
    const bookingTime = normalizeTime(normalized.payload.time)

    try {
      const businessHours = await anchorAPI.getBusinessHours()
      const serviceWindow = resolveServiceRanges(businessHours, normalized.payload.date, {
        bookingType,
        purpose: bookingPurpose
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
        purpose: bookingPurpose,
        bookingType
      })

      return createApiErrorResponse(
        'We could not verify service hours right now. Please try again shortly or call 01753 682707.',
        503
      )
    }

    const idempotencyKey =
      asTrimmedString(request.headers.get('Idempotency-Key')) || createIdempotencyKey('tbl')

    const turnstileToken = typeof body.turnstile_token === 'string' ? body.turnstile_token : null

    const upstream = await fetch(`${API_BASE_URL}/table-bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        'Idempotency-Key': idempotencyKey,
        // Management API reads the Turnstile token from this header, not from the body
        ...(turnstileToken ? { 'x-turnstile-token': turnstileToken } : {})
      },
      cache: 'no-store',
      // skip_customer_sms: website bookings show PayPal buttons inline, so customer
      // doesn't need a separate SMS payment link
      body: JSON.stringify({
        ...normalized.payload,
        skip_customer_sms: true
      })
    })

    const rawText = await upstream.text()
    const parsed = safeJsonParse(rawText)
    const fallbackPayload = {
      success: false,
      error: getSafeUpstreamErrorMessage(rawText, 'Booking request failed')
    }

    return new Response(JSON.stringify(parsed ?? fallbackPayload), {
      status: upstream.status,
      headers: {
        'Content-Type': 'application/json',
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
