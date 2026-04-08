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

function buildNameLine(firstName?: string, lastName?: string): string | undefined {
  const fullName = [asTrimmedString(firstName), asTrimmedString(lastName)]
    .filter(Boolean)
    .join(' ')

  if (!fullName) return undefined
  return `Name: ${fullName}`
}

function buildMenuSelectionNotes(value: unknown): string | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined

  const parts = value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null
      const item = entry as Record<string, unknown>
      const guest = asTrimmedString(item.guest_name) || 'Guest'
      const dish = asTrimmedString(item.custom_item_name) || asTrimmedString(item.item_name)
      const quantity = asPositiveInt(item.quantity) || 1
      if (!dish) return null
      return `${guest}: ${dish} x${quantity}`
    })
    .filter((line): line is string => Boolean(line))

  if (parts.length === 0) return undefined
  return `Sunday lunch pre-order: ${parts.join(' | ')}`
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

function buildLegacyNotes(payload: LegacyTableBookingPayload): string | undefined {
  const lines: string[] = []

  const firstName = asTrimmedString(payload.customer?.first_name)
  const lastName = asTrimmedString(payload.customer?.last_name)
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  if (fullName) lines.push(`Name: ${fullName}`)

  const email = asTrimmedString(payload.customer?.email)
  if (email) lines.push(`Email: ${email}`)

  const occasion = asTrimmedString(payload.celebration_type)
  if (occasion) lines.push(`Occasion: ${occasion}`)

  const specialRequirements = asTrimmedString(payload.special_requirements)
  if (specialRequirements) lines.push(`Special requirements: ${specialRequirements}`)

  const dietaryRequirements = toStringList(payload.dietary_requirements)
  if (dietaryRequirements.length > 0) {
    lines.push(`Dietary requirements: ${dietaryRequirements.join(', ')}`)
  }

  const allergies = toStringList(payload.allergies)
  if (allergies.length > 0) {
    lines.push(`Allergies: ${allergies.join(', ')}`)
  }

  if (Array.isArray(payload.menu_selections) && payload.menu_selections.length > 0) {
    const selectionSummary = payload.menu_selections
      .slice(0, 12)
      .map((item) => {
        const guest = asTrimmedString(item.guest_name) || 'Guest'
        const dish = asTrimmedString(item.custom_item_name) || 'Menu item'
        const quantity = asPositiveInt(item.quantity) || 1
        return `${guest}: ${dish} x${quantity}`
      })
      .join(' | ')

    if (selectionSummary) {
      lines.push(`Sunday lunch pre-order: ${selectionSummary}`)
    }
  }

  const explicitNotes = asTrimmedString(payload.notes)
  if (explicitNotes) lines.push(`Notes: ${explicitNotes}`)

  if (lines.length === 0) return undefined
  return lines.join('\n')
}

function normaliseIncomingPayload(input: unknown): {
  payload?: ManagementTableBookingPayload
  error?: string
} {
  if (!input || typeof input !== 'object') {
    return { error: 'Invalid request body' }
  }

  const body = input as Record<string, unknown>

  const isNewShape =
    typeof body.phone === 'string' ||
    typeof body.purpose === 'string' ||
    typeof body.sunday_lunch === 'boolean'

  if (isNewShape) {
    const phone = asTrimmedString(body.phone)
    const date = asTrimmedString(body.date)
    const time = asTrimmedString(body.time)
    const partySize = asPositiveInt(body.party_size)
    const purpose = body.purpose === 'drinks' ? 'drinks' : body.purpose === 'food' ? 'food' : undefined
    const firstName = asTrimmedString(body.first_name)
    const lastName = asTrimmedString(body.last_name)
    const menuSelectionNotes = buildMenuSelectionNotes(body.menu_selections)
    const notes = mergeNotes(buildNameLine(firstName, lastName), menuSelectionNotes, asTrimmedString(body.notes))
    const sundayLunch = body.sunday_lunch === true
    const defaultCountryCode = asTrimmedString(body.default_country_code)

    if (!phone || !date || !time || !partySize || !purpose) {
      return { error: 'Missing required fields: phone, date, time, party_size, purpose' }
    }

    return {
      payload: {
        phone,
        ...(firstName ? { first_name: firstName } : {}),
        ...(lastName ? { last_name: lastName } : {}),
        ...(asTrimmedString(body.email) ? { email: asTrimmedString(body.email) } : {}),
        date,
        time,
        party_size: partySize,
        purpose,
        ...(notes ? { notes } : {}),
        ...(sundayLunch ? { sunday_lunch: true } : {}),
        ...(defaultCountryCode ? { default_country_code: defaultCountryCode } : {})
      }
    }
  }

  const legacy = body as LegacyTableBookingPayload
  const phone = asTrimmedString(legacy.customer?.mobile_number) || asTrimmedString(legacy.customer_phone)
  const date = asTrimmedString(legacy.date)
  const time = asTrimmedString(legacy.time)
  const partySize = asPositiveInt(legacy.party_size)
  const purpose = legacy.purpose === 'drinks' ? 'drinks' : 'food'
  const sundayLunch = legacy.booking_type === 'sunday_lunch'
  const notes = buildLegacyNotes(legacy)

  if (!phone || !date || !time || !partySize) {
    return { error: 'Missing required fields: phone, date, time, and party_size' }
  }

  return {
    payload: {
      phone,
      date,
      time,
      party_size: partySize,
      purpose,
      ...(notes ? { notes } : {}),
      ...(sundayLunch ? { sunday_lunch: true } : {})
    }
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
