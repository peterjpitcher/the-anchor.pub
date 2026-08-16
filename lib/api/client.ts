// AnchorAPI class and anchorAPI singleton

import { logError } from '@/lib/error-handling'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { computeLargeGroupDepositAmount } from '@/lib/constants'
import {
  buildSlotsWithKitchenState,
  londonNowParts,
  normalizeTime,
  resolveCombinedServiceRanges,
  type BookingType,
  type SlotBusynessOptions
} from '@/lib/table-booking-service-windows'

import type { EventsResponse, EventCategoriesResponse, EventAvailability, Event } from './events'
import { FALLBACK_EVENT_CATEGORIES, createFallbackEvent, createFallbackEventsResponse } from './events'
import type { MenuResponse, DietaryMenuResponse, SundayLunchMenuResponse, MenuSectionItem } from './menu'
import {
  CHRISTMAS_MENU_CODE,
  FALLBACK_CHRISTMAS_MENU,
  FALLBACK_SUNDAY_LUNCH_MENU
} from './menu'
import type { BusinessHours, AmenitiesResponse } from './hours'
import type { BookingPeriodResponse, TableAvailabilityResponse, TableBookingLoadResponse, TableBookingRequest, TableBookingResponse } from './bookings'
import type {
  ParkingRateCard,
  ParkingAvailabilitySlot,
  ParkingBookingRequest,
  ParkingBookingResponse,
  ParkingBookingDetails,
  ParkingCreateOrderRequest,
  ParkingCreateOrderResponse,
  ParkingCaptureResponse
} from './parking'
import { FALLBACK_PARKING_RATES } from './parking'
import type { MenuItem } from './menu'

/**
 * How stale a menu price may be, in seconds.
 *
 * Menu prices are live from the management database, and an uncached fetch used
 * to force every menu page to server-render on each request. This is the agreed
 * compromise: short enough that a till price change reaches the site quickly,
 * long enough that the menu pages can be statically regenerated. Keep it small.
 */
const MENU_PRICE_REVALIDATE_SECONDS = 300

// Use internal API routes to avoid CORS issues and keep API key secure
const API_BASE_URL = typeof window === 'undefined'
  ? getManagementApiBaseUrl()  // Server-side: normalize env var and ensure /api suffix
  : '/api'  // Client-side: use Next.js API routes

const buildPhaseSkipLogged = new Set<string>()

type ManagementTableBookingPayload = {
  phone: string
  first_name?: string
  last_name?: string
  email?: string
  date: string
  time: string
  party_size: number
  purpose: 'food' | 'drinks'
  notes?: string
  sunday_lunch?: boolean
  default_country_code?: string
  // High-chair request (0-2) and outside-seating flag, forwarded to the
  // management API so the agent path supports the same features as the form.
  high_chair_count?: number
  // AMS management API wire key for the outside flag (the form/proxy inbound key
  // is `is_outside_seating`; the management endpoint expects `outside_seating`).
  outside_seating?: boolean
  // The seasonal period the guest was shown and what they answered. Advisory
  // only: the database re-reads the live period for the date and refuses an id
  // naming a different one. Note there is no deposit key here and there must
  // never be one, because the server prices it.
  booking_period_id?: string
  booking_period_answer?: boolean
}

type ManagementTableBookingResult = {
  state: 'confirmed' | 'pending_payment' | 'blocked'
  table_booking_id: string | null
  booking_reference: string | null
  reason: string | null
  blocked_reason:
    | 'outside_hours'
    | 'cut_off'
    | 'no_table'
    | 'private_booking_blocked'
    | 'too_large_party'
    | 'customer_conflict'
    | 'in_past'
    | 'blocked'
    | null
  next_step_url: string | null
  hold_expires_at: string | null
  table_name: string | null
  notification_channel?: 'email' | 'whatsapp' | 'sms' | null
  // High chairs actually reserved by the server (may be < requested) and the
  // outside-seating flag echoed back so callers can reflect the granted result.
  high_chairs_granted?: number
  is_outside_seating?: boolean
}

function toSlotBusynessOptions(load?: TableBookingLoadResponse | null): SlotBusynessOptions | undefined {
  if (!load || !Array.isArray(load.bookings)) {
    return undefined
  }

  return {
    load: load.bookings,
    thresholds: {
      windowMinutes: load.window_minutes,
      filling: load.filling_threshold_covers,
      busy: load.busy_threshold_covers,
    },
  }
}

export interface TableAvailabilityQuery {
  partySize?: number
  purpose?: 'food' | 'drinks'
  outside?: boolean
  requiresAccessibleTable?: boolean
  highChairCount?: number
}

export class AnchorAPI {
  private baseURL: string
  private apiKey: string

  constructor(apiKey?: string) {
    this.baseURL = API_BASE_URL
    this.apiKey = apiKey || process.env.ANCHOR_API_KEY || ''

    // Only warn on server-side where API key is expected
    if (!this.apiKey && typeof window === 'undefined') {
      console.warn('ANCHOR_API_KEY is not set. API calls will fail.')
    }
  }

  private resolveSiteOrigin(): string | null {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }

    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '')
    }

    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, '')
    }

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      return 'http://localhost:3000'
    }

    return null
  }

  private asTrimmedString(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }

  private asPositiveInt(value: unknown): number | undefined {
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

  private toStringList(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value
        .map((entry) => this.asTrimmedString(entry))
        .filter((entry): entry is string => Boolean(entry))
    }

    const single = this.asTrimmedString(value)
    return single ? [single] : []
  }

  private summarizeMenuSelections(menuSelections: TableBookingRequest['menu_selections']): string | undefined {
    if (!Array.isArray(menuSelections) || menuSelections.length === 0) {
      return undefined
    }

    const summary = menuSelections
      .slice(0, 12)
      .map((item) => {
        const guest = this.asTrimmedString(item?.guest_name) || 'Guest'
        const dish = this.asTrimmedString(item?.custom_item_name) || this.asTrimmedString((item as any)?.item_name)
        const quantity = this.asPositiveInt(item?.quantity) || 1
        if (!dish) return null
        return `${guest}: ${dish} x${quantity}`
      })
      .filter((entry): entry is string => Boolean(entry))
      .join(' | ')

    return summary ? `Sunday roast pre-order: ${summary}` : undefined
  }

  private buildLegacyTableBookingNotes(data: TableBookingRequest): string | undefined {
    const lines: string[] = []

    const specialRequirements = this.asTrimmedString(data.special_requirements)
    if (specialRequirements) {
      lines.push(`Special requirements: ${specialRequirements}`)
    }

    const occasion = this.asTrimmedString(data.celebration_type) || this.asTrimmedString((data as any).occasion)
    if (occasion) {
      lines.push(`Occasion: ${occasion}`)
    }

    const dietaryRequirements = this.toStringList(data.dietary_requirements)
    if (dietaryRequirements.length > 0) {
      lines.push(`Dietary requirements: ${dietaryRequirements.join(', ')}`)
    }

    const allergies = this.toStringList(data.allergies)
    if (allergies.length > 0) {
      lines.push(`Allergies: ${allergies.join(', ')}`)
    }

    const menuSummary = this.summarizeMenuSelections(data.menu_selections)
    if (menuSummary) {
      lines.push(menuSummary)
    }

    if (lines.length === 0) return undefined

    const notes = lines.join('\n')
    return notes.length <= 500 ? notes : `${notes.slice(0, 497)}...`
  }

  private toManagementTableBookingPayload(data: TableBookingRequest): ManagementTableBookingPayload {
    const customer = data.customer || ({} as TableBookingRequest['customer'])
    const phone = this.asTrimmedString(customer.mobile_number) || this.asTrimmedString((data as any).customer_phone)

    if (!phone) {
      throw {
        code: 'VALIDATION_ERROR',
        message: 'Customer mobile number is required',
        status: 400
      }
    }

    const firstName = this.asTrimmedString(customer.first_name) || this.asTrimmedString((data as any).customer_first_name)
    const lastName = this.asTrimmedString(customer.last_name) || this.asTrimmedString((data as any).customer_last_name)
    const email = this.asTrimmedString(customer.email)
    const purpose = (data as any).purpose === 'drinks' ? 'drinks' : 'food'
    const notes = this.buildLegacyTableBookingNotes(data)
    const defaultCountryCode = this.asTrimmedString((data as any).default_country_code)

    // High chairs: clamp a defensively-parsed request to 0-2; omit when 0.
    const rawHighChairs = (data as any).high_chair_count
    const parsedHighChairs =
      typeof rawHighChairs === 'number' && Number.isFinite(rawHighChairs)
        ? Math.floor(rawHighChairs)
        : typeof rawHighChairs === 'string' && rawHighChairs.trim().length > 0
        ? Number.parseInt(rawHighChairs.trim(), 10)
        : 0
    const highChairCount = Number.isFinite(parsedHighChairs)
      ? Math.min(Math.max(parsedHighChairs, 0), 2)
      : 0
    const isOutsideSeating = (data as any).is_outside_seating === true

    // The seasonal answer. Sent only as a pair: an id with no answer would leave
    // the server to guess what the guest was asked, and an answer with no id
    // names no period. `false` is a real answer and must survive, so this tests
    // the type and never the truthiness.
    const bookingPeriodId = this.asTrimmedString((data as any).booking_period_id)
    const bookingPeriodAnswer = (data as any).booking_period_answer
    const hasPeriodAnswer = bookingPeriodId && typeof bookingPeriodAnswer === 'boolean'

    return {
      phone,
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
      ...(email ? { email } : {}),
      date: data.date,
      time: data.time,
      party_size: data.party_size,
      purpose,
      ...(notes ? { notes } : {}),
      ...(data.booking_type === 'sunday_lunch' ? { sunday_lunch: true } : {}),
      ...(defaultCountryCode ? { default_country_code: defaultCountryCode } : {}),
      ...(highChairCount > 0 ? { high_chair_count: highChairCount } : {}),
      ...(isOutsideSeating ? { outside_seating: true } : {}),
      ...(hasPeriodAnswer
        ? {
            booking_period_id: bookingPeriodId,
            booking_period_answer: bookingPeriodAnswer as boolean
          }
        : {})
    }
  }

  private isManagementTableBookingResult(input: unknown): input is ManagementTableBookingResult {
    if (!input || typeof input !== 'object') return false
    const source = input as Record<string, unknown>
    return (
      typeof source.state === 'string' &&
      (
        source.state === 'confirmed'
        || source.state === 'pending_payment'
        || source.state === 'blocked'
      ) &&
      ('booking_reference' in source || 'table_booking_id' in source)
    )
  }

  private mapBlockedTableBookingMessage(result: ManagementTableBookingResult): string {
    const blockedReason = result.blocked_reason || 'blocked'

    switch (blockedReason) {
      case 'outside_hours':
        return 'That time is outside our booking hours. Please choose another time or call us.'
      case 'cut_off':
        return 'Online bookings for that slot are now closed. Please call us and we will try to help.'
      case 'no_table':
        return 'No table is currently available for that request.'
      case 'private_booking_blocked':
        return 'This slot is unavailable due to a private booking.'
      case 'too_large_party':
        return 'For larger groups, please call us so we can arrange your booking.'
      case 'customer_conflict':
        return 'A nearby booking already exists for this customer. Please call us if you need help.'
      case 'in_past':
        return 'That booking time is in the past. Please select a future date and time.'
      default:
        return result.reason || 'This booking request is currently unavailable.'
    }
  }

  private mapManagementTableBookingResponse(
    result: ManagementTableBookingResult,
    originalRequest: TableBookingRequest
  ): TableBookingResponse {
    if (result.state === 'blocked') {
      throw {
        code: 'BOOKING_BLOCKED',
        message: this.mapBlockedTableBookingMessage(result),
        status: 409,
        details: result
      }
    }

    const bookingId = result.table_booking_id || result.booking_reference || `tbl_${Date.now()}`
    const bookingReference = result.booking_reference || result.table_booking_id || bookingId
    const pendingPayment = result.state === 'pending_payment'
    const requiresNextStep = pendingPayment
    // Deposit is £10/person for groups of 15+ (large-group policy)
    const depositAmount = pendingPayment ? computeLargeGroupDepositAmount(Number(originalRequest.party_size || 1)) : 0
    const duration =
      typeof originalRequest.duration_minutes === 'number'
        ? originalRequest.duration_minutes
        : 120

    return {
      booking_id: bookingId,
      booking_reference: bookingReference,
      status: requiresNextStep ? 'pending_payment' : 'confirmed',
      state: result.state,
      table_booking_id: result.table_booking_id,
      reason: result.reason,
      blocked_reason: result.blocked_reason,
      next_step_url: result.next_step_url,
      hold_expires_at: result.hold_expires_at,
      table_name: result.table_name,
      notification_channel: result.notification_channel,
      ...(typeof result.high_chairs_granted === 'number'
        ? { high_chairs_granted: result.high_chairs_granted }
        : {}),
      ...(typeof result.is_outside_seating === 'boolean'
        ? { is_outside_seating: result.is_outside_seating }
        : {}),
      confirmation_details: {
        date: originalRequest.date,
        time: originalRequest.time,
        party_size: originalRequest.party_size,
        duration_minutes: duration,
        special_requirements: originalRequest.special_requirements,
        occasion: originalRequest.celebration_type || (originalRequest as any).occasion
      },
      confirmation_sent: true,
      payment_required: requiresNextStep,
      payment_details: requiresNextStep && result.next_step_url
        ? {
            amount: depositAmount,
            deposit_amount: depositAmount,
            total_amount: depositAmount,
            outstanding_amount: depositAmount,
            currency: 'GBP',
            payment_url: result.next_step_url,
            expires_at: result.hold_expires_at || new Date(Date.now() + 15 * 60 * 1000).toISOString()
          }
        : undefined
    }
  }

  private unwrapSuccessData<T>(payload: unknown): T | null {
    if (!payload || typeof payload !== 'object') return null
    const source = payload as Record<string, unknown>

    if (source.success === true && source.data) {
      return source.data as T
    }

    if (source.success === false) {
      return null
    }

    return source as T
  }

  private getLondonIsoDate(): string {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/London',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })

      const parts = formatter.formatToParts(new Date())
      const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
      if (map.year && map.month && map.day) {
        return `${map.year}-${map.month}-${map.day}`
      }
    } catch {
      // Fall through to UTC format
    }

    return new Date().toISOString().slice(0, 10)
  }

  private mapSundayLunchMenuFromMenu(menu: MenuResponse, menuDate: string): SundayLunchMenuResponse | null {
    const sections = Array.isArray(menu?.sections) ? menu.sections : []
    if (sections.length === 0) return null

    const sundaySections = sections.filter((section) =>
      /sunday|roast/i.test(section.name || '')
    )

    if (sundaySections.length === 0) return null

    const mapItem = (item: MenuSectionItem) => ({
      id: item.id,
      name: item.name,
      description: item.description || undefined,
      price: Number(item.price || 0),
      dietary_info: item.dietary_info || [],
      allergens: item.allergens || [],
      is_available: item.is_available !== false
    })

    const toUniqueItems = (items: MenuSectionItem[]) => {
      const seen = new Set<string>()
      const mapped: ReturnType<typeof mapItem>[] = []

      for (const item of items) {
        if (!item || typeof item.id !== 'string') continue
        if (seen.has(item.id)) continue
        seen.add(item.id)
        mapped.push(mapItem(item))
      }

      return mapped
    }

    const mainSections = sundaySections.filter((section) => /main|roast/i.test(section.name || ''))
    const sideSections = sundaySections.filter((section) => /side|extra|add[- ]?on|trimming/i.test(section.name || ''))

    const allSundayItems = sundaySections.flatMap((section) =>
      Array.isArray(section.items) ? section.items : []
    )
    const mainItems =
      mainSections.length > 0
        ? toUniqueItems(mainSections.flatMap((section) => section.items || []))
        : toUniqueItems(allSundayItems)

    if (mainItems.length === 0) {
      return null
    }

    const sideItems = toUniqueItems(sideSections.flatMap((section) => section.items || []))

    return {
      menu_date: menuDate,
      mains: mainItems,
      sides: sideItems,
      cutoff_time: FALLBACK_SUNDAY_LUNCH_MENU.cutoff_time
    }
  }

  private buildTableAvailabilityFromBusinessHours(
    businessHours: BusinessHours,
    params: {
      date: string
      time: string
      party_size: number
      booking_type?: 'regular' | 'sunday_lunch'
      bookingLoad?: TableBookingLoadResponse | null
    }
  ): TableAvailabilityResponse {
    // The public availability contract is now combined: a single bookable slot
    // set with `kitchen_open` stamped per slot, regardless of any `booking_type`
    // or `purpose` hint. Mirror `app/api/table-bookings/availability/route.ts`.
    const bookingType: BookingType = 'regular'
    const normalizedTime = normalizeTime(params.time)

    const { ranges, kitchenRanges, closed, message } = resolveCombinedServiceRanges(
      businessHours,
      params.date,
      { bookingType }
    )

    if (closed) {
      return {
        date: params.date,
        time: normalizedTime,
        party_size: params.party_size,
        available: false,
        time_slots: [],
        message: message || 'We are closed on that date. Please choose another day.'
      }
    }

    const londonNow = londonNowParts()
    const minMinutesForToday =
      londonNow.isoDate === params.date
        ? Math.ceil((londonNow.minutes + 60) / 30) * 30
        : undefined

    const timeSlots = buildSlotsWithKitchenState(
      ranges,
      kitchenRanges,
      params.party_size,
      30,
      minMinutesForToday,
      toSlotBusynessOptions(params.bookingLoad)
    )

    const available = timeSlots.some(
      (slot) => slot.available === true || (slot.available_capacity || 0) >= params.party_size
    )

    return {
      date: params.date,
      time: normalizedTime,
      party_size: params.party_size,
      available,
      time_slots: timeSlots,
      message: message || (available
        ? 'These times are based on current service windows and will be confirmed instantly when you continue.'
        : 'No online times are currently available for this request. Please choose another date or call 01753 682707.'),
      special_notes:
        'If your preferred time is unavailable, choose a nearby slot or call 01753 682707.'
    }
  }

  private async fetchInternalTableAvailability(query: URLSearchParams): Promise<TableAvailabilityResponse | null> {
    const origin = this.resolveSiteOrigin()
    if (!origin) return null

    const response = await fetch(`${origin}/api/table-bookings/availability?${query.toString()}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      const message =
        (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string')
          ? payload.error
          : `Failed to check table availability (${response.status})`
      throw {
        code: 'TABLE_AVAILABILITY_ERROR',
        message,
        status: response.status
      }
    }

    const unwrapped = this.unwrapSuccessData<TableAvailabilityResponse>(payload)
    if (unwrapped && Array.isArray(unwrapped.time_slots)) {
      return unwrapped
    }

    if (payload && typeof payload === 'object' && Array.isArray((payload as TableAvailabilityResponse).time_slots)) {
      return payload as TableAvailabilityResponse
    }

    return null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const [baseEndpoint, endpointQuery] = endpoint.split('?')
    // Query params are kept alongside the base path so a fallback can be
    // chosen per menu code, not just per route.
    const endpointParams = endpointQuery ? new URLSearchParams(endpointQuery) : undefined
    const isBuildPhase =
      typeof window === 'undefined' &&
      process.env.NEXT_PHASE === 'phase-production-build' &&
      process.env.ENABLE_BUILD_TIME_EXTERNAL_API !== 'true'

    if (isBuildPhase) {
      const buildFallback = this.getFallbackResponse(baseEndpoint, endpointParams)
      if (buildFallback) {
        if (!buildPhaseSkipLogged.has(baseEndpoint)) {
          console.warn(`[api-request] Skipping external fetch for ${baseEndpoint} during build`)
          buildPhaseSkipLogged.add(baseEndpoint)
        }
        return buildFallback as T
      }
    }

    try {
      // Try both authentication methods as documented
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      // Add authentication header (using X-API-Key as recommended)
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey
      }

      // Merge with any provided headers
      if (options.headers) {
        Object.assign(headers, options.headers)
      }

      const { next: providedNext, ...requestInit } = options as RequestInit & {
        next?: { revalidate?: number | false }
      }

      const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
        ...requestInit,
        headers,
      }

      if (typeof window === 'undefined') {
        const revalidate =
          typeof providedNext?.revalidate === 'number'
            ? providedNext.revalidate
            : 300
        fetchOptions.next = {
          revalidate,
        }
      }

      const response = await fetch(url, fetchOptions)

      if (!response.ok) {
        let errorCode = 'UNKNOWN_ERROR'
        let errorMessage = `API request failed: ${response.status}`
        let errorDetails: any = {}

        try {
          const errorData = await response.json()

          // Handle API error wrapper format
          if (errorData.success === false && errorData.error) {
            errorCode = errorData.error.code || errorCode
            errorMessage = errorData.error.message || errorMessage
            errorDetails = errorData.error.details || {}
          } else if (errorData.error) {
            errorMessage = errorData.error
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = `${response.status} ${response.statusText}`
        }

        // Map HTTP status to error codes
        if (response.status === 401) {
          errorCode = 'UNAUTHORIZED'
          console.error('Authentication failed. Check ANCHOR_API_KEY environment variable.')
        } else if (response.status === 403) {
          errorCode = 'FORBIDDEN'
        } else if (response.status === 404) {
          errorCode = 'NOT_FOUND'
        } else if (response.status === 429) {
          errorCode = 'RATE_LIMIT_EXCEEDED'
          console.error('Rate limit exceeded. Please try again later.')
        } else if (response.status >= 500) {
          errorCode = 'INTERNAL_ERROR'
        }

        throw {
          code: errorCode,
          message: errorMessage,
          status: response.status,
          details: errorDetails
        }
      }

      const data = await response.json()

      // Handle API success wrapper format
      if (data.success === false && data.error) {
        throw {
          code: data.error.code || 'API_ERROR',
          message: data.error.message || 'API request failed',
          status: response.status,
          details: data.error.details || {}
        }
      }

      // Extract data from wrapper if present
      if (data.success === true && data.data) {
        return data.data
      }

      // Some endpoints return data directly without wrapper (legacy format)
      // Check if this looks like valid data (not an error)
      if (!data.error && !data.success) {
        return data
      }

      // If no wrapper format and no direct data, this is likely an error
      throw {
        code: 'INVALID_RESPONSE',
        message: 'Invalid API response format',
        status: response.status,
        details: { response: data }
      }
    } catch (error: any) {
      const isNetworkError =
        !error?.status ||
        error?.code === 'ENOTFOUND' ||
        error?.code === 'EAI_AGAIN' ||
        error?.code === 'NETWORK_ERROR' ||
        (typeof error?.message === 'string' && /fetch failed|network/i.test(error.message))

      const fallback = this.getFallbackResponse(baseEndpoint, endpointParams)

      // Never serve stale business hours at runtime – a network error shouldn't show wrong times
      const shouldSkipFallback = baseEndpoint === '/business/hours'

      if (fallback && !shouldSkipFallback) {
        console.warn(`[api-request] Using fallback data for ${baseEndpoint}`, {
          reason: isNetworkError ? 'network-unavailable' : error?.code || 'unknown'
        })
        return fallback as T
      }

      const structuredError = {
        code: error?.code || (isNetworkError ? 'NETWORK_ERROR' : 'API_ERROR'),
        message: error?.message || 'Request failed',
        status: error?.status || 0,
        details: error?.details || {}
      }

      if (isNetworkError) {
        console.warn(`[api-request] ${structuredError.message}`, {
          endpoint: baseEndpoint,
          status: structuredError.status
        })
      } else {
        logError('api-request', structuredError, {
          endpoint,
          url,
          method: options.method || 'GET'
        })
      }

      throw structuredError
    }
  }

  // Events
  async getEvents(params: {
    from_date?: string
    to_date?: string
    category_id?: string
    available_only?: boolean
    limit?: number
    offset?: number
    status?: string
  } = {}, options: RequestInit = {}): Promise<EventsResponse> {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.append(key, value.toString())
      }
    })

    return this.request<EventsResponse>(`/events?${query.toString()}`, options)
  }

  async getEvent(idOrSlug: string): Promise<Event> {
    const lookupValue = idOrSlug.trim()
    const encodedLookup = encodeURIComponent(lookupValue)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey
    }

    const searchWindows = [
      0,       // today onwards (future events)
      90,      // include events from the past 3 months
      365      // include events from the past year as a last resort
    ]

    const fetchOptions = (requestHeaders: Record<string, string>) => {
      const options: RequestInit & { next?: { revalidate: number } } = {
        headers: requestHeaders
      }

      if (typeof window === 'undefined') {
        options.next = { revalidate: 300 }
      }

      return options
    }

    const fetchEventsFromBase = async (
      baseUrl: string,
      requestHeaders: Record<string, string>,
      daysAgo: number
    ): Promise<Event[]> => {
      const fromDate = new Date()
      if (daysAgo > 0) {
        fromDate.setDate(fromDate.getDate() - daysAgo)
      }

      const query = new URLSearchParams({
        limit: '200',
        from_date: fromDate.toISOString().split('T')[0]
      })

      const endpoint = `/events?${query.toString()}`
      const url = `${baseUrl}${endpoint}`

      const response = await fetch(url, fetchOptions(requestHeaders))

      if (!response.ok) {
        const payload = await response.text()
        throw {
          code: 'API_EVENTS_ERROR',
          status: response.status,
          message: `Failed to load events list (${response.status})`,
          details: payload
        }
      }

      const data = await response.json()
      if (data.success === false && data.error) {
        throw {
          code: data.error.code || 'API_EVENTS_ERROR',
          status: 400,
          message: data.error.message || 'Unable to load events list',
          details: data.error.details || {}
        }
      }

      const responseData = data.data || data
      return responseData.events || responseData
    }

    const fetchDirectEvent = async (): Promise<Event | null> => {
      const endpoint = `/events/${encodedLookup}`
      const url = `${this.baseURL}${endpoint}`

      const response = await fetch(url, fetchOptions(headers))

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        const errorPayload = await response.text()
        throw {
          code: 'API_EVENT_ERROR',
          status: response.status,
          message: `Failed to load event: ${response.statusText}`,
          details: errorPayload
        }
      }

      const data = await response.json()
      if (data.success === false && data.error) {
        if ((data.error.code === 'NOT_FOUND' || data.error.message === 'Event not found')) {
          return null
        }

        throw {
          code: data.error.code || 'API_EVENT_ERROR',
          status: 400,
          message: data.error.message || 'Unable to retrieve event',
          details: data.error.details || {}
        }
      }

      const resolved = data.data || data
      if (resolved && typeof resolved === 'object' && 'event' in resolved) {
        return (resolved as { event: Event }).event
      }
      return resolved
    }

    const fetchEventsFromWindow = async (daysAgo: number): Promise<Event[]> => {
      try {
        return await fetchEventsFromBase(this.baseURL, headers, daysAgo)
      } catch (primaryError) {
        // If we're on the server, fall back to the public API endpoint
        if (typeof window === 'undefined') {
          const origin = this.resolveSiteOrigin()
          if (origin) {
            try {
              return await fetchEventsFromBase(
                `${origin}/api`,
                { 'Content-Type': 'application/json' },
                daysAgo
              )
            } catch (internalError) {
              logError('api-get-event-fallback-internal', internalError, {
                idOrSlug: lookupValue,
                daysAgo,
                origin
              })
            }
          }
        }

        throw primaryError
      }
    }

    try {
      const directEvent = await fetchDirectEvent()
      if (directEvent) {
        return directEvent
      }
    } catch (error) {
      logError('api-get-event-direct', error, {
        idOrSlug: lookupValue
      })
    }

    console.log('Fetching event from events list for capacity data')

    for (const daysAgo of searchWindows) {
      try {
        const events = await fetchEventsFromWindow(daysAgo)
        const matchedEvent = events.find(event => {
          const candidates = [
            event.id,
            event.slug,
            event.identifier
          ].filter(Boolean).map(value => `${value}`.trim())

          return candidates.some(candidate => candidate === lookupValue)
        })

        if (matchedEvent) {
          return matchedEvent
        }
      } catch (error) {
        logError('api-get-event-fallback', error, {
          idOrSlug: lookupValue,
          daysAgo
        })
      }
    }

    throw { message: 'Event not found', status: 404 }
  }

  async getTodaysEvents(status: string = 'scheduled'): Promise<EventsResponse> {
    const query = new URLSearchParams()
    if (status) query.append('status', status)
    return this.request<EventsResponse>(`/events/today?${query.toString()}`)
  }

  async getEventCategories(): Promise<EventCategoriesResponse> {
    return this.request<EventCategoriesResponse>('/event-categories')
  }

  // Event availability
  async checkEventAvailability(eventId: string, seats: number = 1): Promise<EventAvailability> {
    const requestedSeats = Number.isFinite(seats) && seats > 0 ? Math.floor(seats) : 1

    if (typeof window !== 'undefined') {
      return this.request<EventAvailability>(`/events/${eventId}/availability`, {
        method: 'POST',
        body: JSON.stringify({ seats: requestedSeats })
      })
    }

    const event = await this.getEvent(eventId)
    const maxCapacity =
      typeof event.maximumAttendeeCapacity === 'number' && Number.isFinite(event.maximumAttendeeCapacity)
        ? Math.max(Math.floor(event.maximumAttendeeCapacity), 0)
        : typeof event.capacity === 'number' && Number.isFinite(event.capacity)
        ? Math.max(Math.floor(event.capacity), 0)
        : 0
    const remainingRaw =
      typeof event.remainingAttendeeCapacity === 'number' && Number.isFinite(event.remainingAttendeeCapacity)
        ? event.remainingAttendeeCapacity
        : typeof event.seats_remaining === 'number' && Number.isFinite(event.seats_remaining)
        ? event.seats_remaining
        : event.is_full === true
        ? 0
        : maxCapacity
    const remaining = Math.max(Math.floor(remainingRaw), 0)
    const capacity = Math.max(maxCapacity, remaining)
    const booked = Math.max(capacity - remaining, 0)

    return {
      available: remaining >= requestedSeats,
      event_id: event.id || eventId,
      capacity,
      booked,
      remaining,
      percentage_full: capacity > 0 ? Math.round((booked / capacity) * 100) : 0
    }
  }

  // Menu
  async getMenu(menuCode?: string): Promise<MenuResponse> {
    const trimmedCode = this.asTrimmedString(menuCode)
    const endpoint = trimmedCode
      ? `/menu?menu=${encodeURIComponent(trimmedCode)}`
      : '/menu'

    // Short cache, deliberately short. Prices stay live from the management DB,
    // but an uncached fetch forced every menu page to render per request. Five
    // minutes is the agreed ceiling on how stale a price may be.
    return this.request<MenuResponse>(endpoint, {
      next: { revalidate: MENU_PRICE_REVALIDATE_SECONDS }
    })
  }

  /**
   * Christmas menu, live from the management database. The menu will not exist
   * until the owner approves the Christmas menu container, so a missing or
   * failing menu resolves to an empty menu rather than an exception. Nothing
   * that renders this menu should ever break a build or a page.
   */
  async getChristmasMenu(): Promise<MenuResponse> {
    try {
      const response = await this.getMenu(CHRISTMAS_MENU_CODE)
      if (response && Array.isArray(response.sections)) {
        return response
      }
    } catch (error) {
      logError('api-christmas-menu', error, { menuCode: CHRISTMAS_MENU_CODE })
    }

    return FALLBACK_CHRISTMAS_MENU
  }

  async getMenuSpecials(): Promise<{
    specials: MenuItem[]
  }> {
    return this.request('/menu/specials')
  }

  async getDietaryMenu(type: 'vegetarian' | 'vegan' | 'gluten-free' | 'halal' | 'kosher'): Promise<DietaryMenuResponse> {
    return this.request<DietaryMenuResponse>(`/menu/dietary/${type}`)
  }

  // Table Bookings
  async checkTableAvailability(params: {
    date: string
    time: string
    party_size: number
    duration?: number
    booking_type?: 'regular' | 'sunday_lunch'
  }): Promise<TableAvailabilityResponse> {
    const normalizedTime = /^\d{2}:\d{2}:\d{2}$/.test(params.time)
      ? params.time.slice(0, 5)
      : params.time
    const query = new URLSearchParams({
      date: params.date,
      time: normalizedTime,
      party_size: params.party_size.toString(),
      ...(params.duration && { duration: params.duration.toString() }),
      ...(params.booking_type && { booking_type: params.booking_type })
    })

    if (typeof window !== 'undefined') {
      return this.request<TableAvailabilityResponse>(`/table-bookings/availability?${query}`, {
        next: { revalidate: 0 }
      } as any)
    }

    try {
      const internalAvailability = await this.fetchInternalTableAvailability(query)
      if (internalAvailability) {
        return internalAvailability
      }
    } catch (error) {
      logError('api-table-availability-internal', error, {
        date: params.date,
        time: normalizedTime,
        partySize: params.party_size,
        bookingType: params.booking_type || 'regular'
      })
    }

    const [businessHours, bookingLoad] = await Promise.all([
      this.getBusinessHours(),
      this.getTableBookingLoadSafe(params.date, { partySize: params.party_size }),
    ])
    return this.buildTableAvailabilityFromBusinessHours(businessHours, {
      ...params,
      time: normalizedTime,
      bookingLoad
    })
  }

  // The availability query decides which TABLES qualify, as opposed to how many covers fit.
  async getTableBookingLoad(
    date: string,
    options: RequestInit = {},
    availability?: TableAvailabilityQuery
  ): Promise<TableBookingLoadResponse> {
    const query = new URLSearchParams({ date })
    // Only ask for real table availability when we know the party size: without it the
    // management API cannot say which tables qualify, only how many covers fit.
    if (availability?.partySize && availability.partySize > 0) {
      query.set('party_size', String(availability.partySize))
      query.set('purpose', availability.purpose ?? 'food')
      if (availability.outside) query.set('outside', 'true')
      if (availability.requiresAccessibleTable) query.set('requires_accessible_table', 'true')
      if (availability.highChairCount) query.set('high_chair_count', String(availability.highChairCount))
    }
    return this.request<TableBookingLoadResponse>(`/table-bookings/load?${query.toString()}`, {
      ...options,
      next: { revalidate: 0 },
    } as RequestInit & { next: { revalidate: number } })
  }

  // Load read-out with a bounded wait, then null. A null result means
  // availability is UNKNOWN, never "assume free". Callers must not present
  // locally guessed slots as bookable on the back of a null here; the
  // availability route answers `calculation_state: 'unknown'` instead
  // (review F04).
  //
  // The retry deliberately waits longer and backs off first. Both attempts used
  // to be 3 seconds fired back to back, which covered a slow response but NOT a
  // cold start: when the management API redeploys, its first request pays the
  // serverless boot plus several database round trips, comfortably past 3
  // seconds, and the retry landed inside the same cold window. Every guest on
  // the booking page during a deploy was told we could not check availability,
  // on an API that was working. Warm, this call measures around 1.2 seconds, so
  // the first attempt still fails fast when something is genuinely wrong.
  async getTableBookingLoadSafe(
    date: string,
    availability?: TableAvailabilityQuery,
    timeoutMs = 3000
  ): Promise<TableBookingLoadResponse | null> {
    const attemptTimeouts = [timeoutMs, Math.max(timeoutMs, 6000)]

    for (let attempt = 1; attempt <= attemptTimeouts.length; attempt++) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), attemptTimeouts[attempt - 1])

      try {
        return await this.getTableBookingLoad(date, { signal: controller.signal }, availability)
      } catch (error) {
        console.warn('[table-bookings] Booking load attempt failed', {
          date,
          attempt,
          timeoutMs: attemptTimeouts[attempt - 1],
          error: error instanceof Error ? error.message : String((error as any)?.message || error),
        })
      } finally {
        clearTimeout(timeout)
      }

      // Give a cold instance a moment to finish booting before asking again.
      // Retrying immediately just burns the second attempt on the same boot.
      if (attempt < attemptTimeouts.length) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    return null
  }

  /**
   * The seasonal period that applies to a date, if any.
   *
   * `party_size` is optional and only changes whether `deposit` comes back. Ask
   * WITH it whenever the party size is known, because the deposit is the part
   * the guest has to be told before they commit.
   */
  async getBookingPeriod(
    date: string,
    partySize?: number,
    options: RequestInit = {}
  ): Promise<BookingPeriodResponse> {
    const query = new URLSearchParams({ date })
    if (typeof partySize === 'number' && Number.isFinite(partySize) && partySize > 0) {
      query.set('party_size', String(partySize))
    }
    return this.request<BookingPeriodResponse>(`/table-bookings/periods?${query.toString()}`, {
      ...options,
      next: { revalidate: 0 },
    } as RequestInit & { next: { revalidate: number } })
  }

  /**
   * Period read with a bounded wait, and null on any failure.
   *
   * Null means "we could not ask", and the ONLY safe reading of it is to leave
   * the guest on the ordinary journey: no question, no menu, no deposit. That is
   * the same outcome as a date with no period, which is what most of the year
   * looks like anyway. Failing the other way would either invent a charge or
   * block an ordinary booking because a seasonal lookup timed out.
   */
  /**
   * The same read, but cacheable, for pages rather than the booking form.
   *
   * `getBookingPeriod` pins `revalidate: 0` because the booking form is pricing a
   * real booking and must never act on a stale deposit. A marketing page is
   * doing something different: describing the season. Rendering it per request
   * for data that changes a few times a season would cost every visitor a round
   * trip to the management API, so it gets its own cached entry point instead of
   * quietly loosening the one the booking form depends on.
   */
  async getBookingPeriodCached(
    date: string,
    partySize?: number,
    revalidateSeconds = 3600,
    timeoutMs = 3000
  ): Promise<BookingPeriodResponse | null> {
    const query = new URLSearchParams({ date })
    if (typeof partySize === 'number' && Number.isFinite(partySize) && partySize > 0) {
      query.set('party_size', String(partySize))
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      return await this.request<BookingPeriodResponse>(`/table-bookings/periods?${query.toString()}`, {
        signal: controller.signal,
        next: { revalidate: revalidateSeconds },
      } as RequestInit & { next: { revalidate: number } })
    } catch (error) {
      console.warn('[table-bookings] Cached booking period lookup failed', {
        date,
        error: error instanceof Error ? error.message : String((error as any)?.message || error),
      })
      return null
    } finally {
      clearTimeout(timeout)
    }
  }

  async getBookingPeriodSafe(
    date: string,
    partySize?: number,
    timeoutMs = 3000
  ): Promise<BookingPeriodResponse | null> {
    const maxAttempts = 2
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)

      try {
        return await this.getBookingPeriod(date, partySize, { signal: controller.signal })
      } catch (error) {
        console.warn('[table-bookings] Booking period lookup failed', {
          date,
          attempt,
          error: error instanceof Error ? error.message : String((error as any)?.message || error),
        })
      } finally {
        clearTimeout(timeout)
      }
    }

    return null
  }

  async createTableBooking(
    data: TableBookingRequest,
    idempotencyKey?: string
  ): Promise<TableBookingResponse> {
    const payload = this.toManagementTableBookingPayload(data)
    const endpoint =
      typeof window === 'undefined'
        ? '/table-bookings'
        : '/table-bookings/create'

    const key =
      idempotencyKey ||
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `tbl_${Date.now()}_${Math.random().toString(16).slice(2)}`)

    const headers: Record<string, string> = {
      'Idempotency-Key': key
    }

    const rawResponse = await this.request<unknown>(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers,
    })

    const unwrapped = this.unwrapSuccessData<unknown>(rawResponse) ?? rawResponse
    if (this.isManagementTableBookingResult(unwrapped)) {
      return this.mapManagementTableBookingResponse(unwrapped, data)
    }

    if (
      unwrapped &&
      typeof unwrapped === 'object' &&
      typeof (unwrapped as TableBookingResponse).booking_reference === 'string' &&
      typeof (unwrapped as TableBookingResponse).status === 'string'
    ) {
      return unwrapped as TableBookingResponse
    }

    throw {
      code: 'INVALID_RESPONSE',
      message: 'Invalid table booking response from API',
      status: 502,
      details: unwrapped
    }
  }

  async getTableBooking(
    reference: string,
    customerEmail: string
  ): Promise<TableBookingResponse> {
    if (!customerEmail) {
      throw new Error('Customer email is required to retrieve booking details')
    }

    throw {
      code: 'NOT_SUPPORTED',
      message: 'Booking lookup by reference is not available in the current management API.',
      status: 501,
      details: {
        reference: reference || null
      }
    }
  }

  async cancelTableBooking(
    reference: string,
    options?: { reason?: string; customerEmail?: string }
  ): Promise<{ success: boolean; message: string }> {
    throw {
      code: 'NOT_SUPPORTED',
      message: 'Booking cancellation by reference is not available in the current management API.',
      status: 501,
      details: {
        reference: reference || null,
        hasCustomerEmail: Boolean(options?.customerEmail)
      }
    }
  }

  // Parking
  async getParkingRates(): Promise<ParkingRateCard> {
    return this.request<ParkingRateCard>('/parking/rates')
  }

  async getParkingAvailability(params: {
    start?: string
    end?: string
    granularity?: 'day' | 'hour'
  } = {}): Promise<ParkingAvailabilitySlot[]> {
    const query = new URLSearchParams()
    if (params.start) query.append('start', params.start)
    if (params.end) query.append('end', params.end)
    if (params.granularity) query.append('granularity', params.granularity)

    const endpoint = query.size > 0
      ? `/parking/availability?${query.toString()}`
      : '/parking/availability'

    return this.request<ParkingAvailabilitySlot[]>(endpoint)
  }

  async createParkingBooking(data: ParkingBookingRequest, idempotencyKey?: string): Promise<ParkingBookingResponse> {
    const headers: Record<string, string> = {}
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey
    }

    return this.request<ParkingBookingResponse>('/parking/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
      headers
    })
  }

  async getParkingBooking(id: string): Promise<ParkingBookingDetails> {
    return this.request<ParkingBookingDetails>(`/parking/bookings/${id}`)
  }

  async createParkingPaymentOrder(
    data: ParkingCreateOrderRequest,
    idempotencyKey?: string
  ): Promise<ParkingCreateOrderResponse> {
    const headers: Record<string, string> = {}
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey

    return this.request<ParkingCreateOrderResponse>('/parking/bookings', {
      method: 'POST',
      body: JSON.stringify({ ...data, source: 'website' }),
      headers,
    })
  }

  async captureParkingPayment(orderID: string, bookingId: string): Promise<ParkingCaptureResponse> {
    return this.request<ParkingCaptureResponse>('/parking/payment/capture', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderID, booking_id: bookingId }),
    })
  }

  /**
   * The Sunday roast menu.
   *
   * One path, deliberately. There used to be a browser-only branch calling
   * `/table-bookings/menu/sunday-lunch`, an endpoint neither this site nor the management
   * API has ever served: it 404'd, a registered fallback swallowed the 404, and the caller
   * was handed an empty menu that looked like a real answer. `/menu/sunday-lunch` is the
   * route the management API actually serves.
   */
  async getSundayLunchMenu(date?: string): Promise<SundayLunchMenuResponse> {
    const menuDate = this.asTrimmedString(date) || this.getLondonIsoDate()

    try {
      const payload = await this.request<unknown>('/menu/sunday-lunch', {
        next: { revalidate: MENU_PRICE_REVALIDATE_SECONDS }
      })
      const candidate = this.unwrapSuccessData<SundayLunchMenuResponse>(payload) || (payload as SundayLunchMenuResponse)
      if (candidate && Array.isArray(candidate.mains) && Array.isArray(candidate.sides)) {
        return {
          ...candidate,
          menu_date: candidate.menu_date || menuDate
        }
      }
    } catch (error) {
      logError('api-sunday-lunch-menu-server', error, { menuDate })
    }

    // Fallback: try generic menu endpoint and extract sunday sections
    try {
      const menu = await this.getMenu()
      const mapped = this.mapSundayLunchMenuFromMenu(menu, menuDate)
      if (mapped) {
        return mapped
      }
    } catch (error) {
      logError('api-sunday-lunch-menu-server-fallback', error, { menuDate })
    }

    return {
      ...FALLBACK_SUNDAY_LUNCH_MENU,
      menu_date: menuDate
    }
  }

  // Business Information
  /**
   * Live hours. Pass `forDate` when the answer depends on a specific day rather
   * than today: the pub's weekly schedule is effective-dated, so a booking twelve
   * months out is not governed by this week's hours. Omitting it means "today",
   * and the response shape is the same either way.
   */
  async getBusinessHours(forDate?: string): Promise<BusinessHours> {
    const path = forDate ? `/business/hours?date=${encodeURIComponent(forDate)}` : '/business/hours'
    const data = await this.request<BusinessHours>(path, {
      // Never cache business hours: currentStatus/closesIn/opensIn are time-sensitive.
      next: { revalidate: 0 }
    })
    return data
  }

  /**
   * Cacheable hours, for server-rendered weekly tables only.
   *
   * The uncached `getBusinessHours()` above forces the whole route to render
   * dynamically, which is too high a price on static marketing pages. This
   * variant is cached so those pages stay on ISR and still ship real times in
   * their initial HTML.
   *
   * The trade-off: `currentStatus` / `closesIn` / `opensIn` are stale here and
   * must NOT be used for live open/closed state. The client provider owns that.
   * The regular and special hours themselves change rarely, so the weekly table
   * is safe to cache.
   */
  async getBusinessHoursSnapshot(revalidateSeconds = 3600): Promise<BusinessHours> {
    const data = await this.request<BusinessHours>('/business/hours', {
      next: { revalidate: revalidateSeconds }
    })
    return data
  }

  async getAmenities(): Promise<AmenitiesResponse> {
    return this.request('/business/amenities')
  }

  private getFallbackResponse(endpoint: string, params?: URLSearchParams): any | null {
    // Christmas is a seasonal menu that may not exist in the database yet, so
    // it always has an empty fallback. The main food menu deliberately has
    // none: it must fetch for real or fail loudly.
    if (endpoint === '/menu' && params?.get('menu') === CHRISTMAS_MENU_CODE) {
      return FALLBACK_CHRISTMAS_MENU
    }

    if (endpoint === '/event-categories') {
      return FALLBACK_EVENT_CATEGORIES
    }

    if (endpoint === '/parking/rates') {
      return FALLBACK_PARKING_RATES
    }

    // No entry for the Sunday lunch menu: getSundayLunchMenu owns its own recovery
    // (real menu, then the Sunday sections of the main menu, then the empty fallback),
    // and a silent fallback here only ever hid a request that could not have worked.

    if (endpoint === '/events' || endpoint === '/events/') {
      return createFallbackEventsResponse()
    }

    if (endpoint === '/events/today') {
      return createFallbackEventsResponse()
    }

    if (endpoint.startsWith('/events/')) {
      const eventId = endpoint.replace('/events/', '').replace(/\/+$/, '') || 'event'
      return createFallbackEvent(eventId)
    }

    return null
  }
}

// Export singleton instance with API key from environment
export const anchorAPI = new AnchorAPI(process.env.ANCHOR_API_KEY)
