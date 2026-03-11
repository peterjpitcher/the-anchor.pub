// The Anchor API Service
// Handles all API calls to the management system

import { logError } from '@/lib/error-handling'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { getSundayLunchDepositAmount } from '@/lib/constants'

// Use internal API routes to avoid CORS issues and keep API key secure
const API_BASE_URL = typeof window === 'undefined'
  ? getManagementApiBaseUrl()  // Server-side: normalize env var and ensure /api suffix
  : '/api'  // Client-side: use Next.js API routes

// API Response wrapper types
// Private Booking Types
export interface PrivateBookingConfig {
  spaces: {
    id: string
    name: string
    description?: string
    capacity_seated?: number
    capacity_standing?: number
    rate_per_hour: number
    minimum_hours: number
    setup_fee: number
  }[]
  packages: {
    id: string
    name: string
    description?: string
    package_type?: string
    category?: 'food' | 'drink' | 'addon'
    cost_per_head: number
    minimum_guests: number
    dietary_notes?: string
  }[]
  vendors: {
    id: string
    name: string
    service_type: string
    typical_rate?: number
    company_name?: string
  }[]
}


export type ItemType = 'space' | 'catering' | 'vendor' | 'other'
export type DiscountType = 'percent' | 'fixed'

export interface PrivateBookingItem {
  item_type: ItemType
  space_id?: string
  package_id?: string
  vendor_id?: string
  description: string
  quantity: number
  unit_price: number
  line_total: number // Kept for frontend calculation/display, backend might recalculate
  discount_type?: DiscountType
  discount_value?: number
  discount_reason?: string
  notes?: string
}

export interface PrivateBookingRequest {
  customer_first_name: string
  customer_last_name?: string
  contact_phone: string
  contact_email?: string
  default_country_code?: string
  event_date?: string
  start_time?: string
  end_time?: string
  guest_count?: number
  event_type?: string
  internal_notes?: string
  items?: PrivateBookingItem[]
}

export interface PrivateBookingResponse {
  success: boolean
  data: {
    id: string
    reference: string
  }
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// Types based on API documentation
export interface Event {
  '@type': 'Event'
  id: string
  slug: string
  name: string
  brief?: string | null
  event_type?: string | null
  description: string | null // Short description (same as shortDescription)
  shortDescription?: string | null
  longDescription?: string | null
  highlights?: string[]
  keywords?: string | string[] // Can be string or array
  startDate: string
  endDate?: string | null
  doorTime?: string | null // New field: doors open time
  duration?: string | null // New field: ISO 8601 duration
  about?: string | null // New field: extended description
  eventStatus: string
  event_status?: string // Exposed raw status from API
  date?: string | null
  time?: string | null
  end_time?: string | null
  doors_time?: string | null
  duration_minutes?: number | null
  last_entry_time?: string | null
  eventAttendanceMode: string
  location: {
    '@type': 'Place'
    name: string
    address: {
      '@type': 'PostalAddress'
      streetAddress: string
      addressLocality: string
      addressRegion: string
      postalCode: string
      addressCountry: string
    }
  }
  performer?: {
    '@type': 'MusicGroup' | 'Person' | 'Organization'
    name: string
  }
  offers?: {
    '@type': 'Offer'
    price: string
    priceCurrency: string
    availability: string
    validFrom: string
    url?: string
    inventoryLevel?: {
      '@type': 'QuantitativeValue'
      value: number
    }
  }
  image?: string[]
  video?: string[] // New field: event video URLs
  heroImageUrl?: string | null // Legacy field
  thumbnailImageUrl?: string | null // Legacy field
  posterImageUrl?: string | null // Legacy field
  galleryImages?: string[] // Legacy field
  promoVideoUrl?: string | null // Legacy field
  highlightVideos?: string[] // Legacy field
  organizer?: {
    '@type': 'Organization'
    name: string
    url?: string
  }
  isAccessibleForFree?: boolean
  remainingAttendeeCapacity?: number // Available tickets
  maximumAttendeeCapacity?: number // Total capacity
  capacity?: number | null
  seats_remaining?: number | null
  is_full?: boolean
  waitlist_enabled?: boolean
  booking_mode?: 'table' | 'general' | 'mixed' | string | null
  payment_mode?: string | null
  price?: number | null
  price_per_seat?: number | null
  is_free?: boolean | null
  bookingUrl?: string | null // External booking link
  booking_url?: string | null
  url?: string // New field: event page URL
  identifier?: string // New field: same as id
  created_at?: string
  updated_at?: string
  performer_name?: string | null
  performer_type?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  category?: {
    id: string
    name: string
    slug: string
    color: string
    icon?: string
  }
  booking_rules?: {
    max_seats_per_booking: number
    requires_customer_details: boolean
    allows_notes: boolean
    sms_confirmation_enabled: boolean
  }
  custom_messages?: {
    confirmation?: string
    reminder?: string
  }
  mainEntityOfPage?: {
    '@type': 'WebPage'
    '@id': string
  }
  potentialAction?: {
    '@type': 'ReserveAction'
    target: {
      '@type': 'EntryPoint'
      urlTemplate: string
      inLanguage: string
    }
    result: {
      '@type': 'Reservation'
      name: string
    }
  }
  faq?: Array<{ // Updated field name from faqPage
    '@type': 'Question'
    name: string
    acceptedAnswer: {
      '@type': 'Answer'
      text: string
    }
  }>
  faqPage?: { // Keep legacy field for compatibility
    '@type': 'FAQPage'
    mainEntity: Array<{
      '@type': 'Question'
      name: string
      acceptedAnswer: {
        '@type': 'Answer'
        text: string
      }
    }>
  }
  _meta?: {
    lastUpdated: string
  }
}

export interface EventsResponse {
  events: Event[]
  pagination: {
    total: number
    limit: number
    offset: number
  }
}

// Private Booking API Methods
export async function getPrivateBookingConfig(): Promise<ApiResponse<PrivateBookingConfig>> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/private-booking/config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch private booking config: ${res.statusText}`)
    }

    return await res.json()
  } catch (error) {
    logError('Error fetching private booking config', error)
    // Fallback? Or let it fail handled by UI
    return {
      success: false,
      error: {
        code: 'CONFIG_FETCH_ERROR',
        message: 'Could not load pricing configuration'
      }
    }
  }
}

export async function createPrivateBooking(data: PrivateBookingRequest): Promise<ApiResponse<PrivateBookingResponse['data']>> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/private-booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })

    const responseData = await res.json()

    if (!res.ok) {
      return {
        success: false,
        error: {
          code: 'BOOKING_CREATION_ERROR',
          message: responseData.error || 'Failed to create booking'
        }
      }
    }

    return responseData
  } catch (error) {
    logError('Error creating private booking', error)
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to submit booking request'
      }
    }
  }
}

// Helper function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    currencyDisplay: 'code'
  }).format(amount).replace(/\u00A0/g, ' ')
}

// Event Tracking (Analytics)
// Event availability check
export interface EventAvailability {
  available: boolean
  event_id: string
  capacity: number
  booked: number
  remaining: number
  percentage_full: number
}

// Event categories
export interface EventCategory {
  id: string
  name: string
  slug: string
  description: string
  color: string
  icon: string
  is_active: boolean
  default_start_time: string
  default_capacity: number
  event_count: number
}

export interface EventCategoriesResponse {
  categories: EventCategory[]
  meta: {
    total: number
    lastUpdated: string
  }
}

export interface MenuItem {
  '@type': 'MenuItem'
  name: string
  description: string
  offers: {
    '@type': 'Offer'
    price: string
    priceCurrency: string
  }
  nutrition?: {
    '@type': 'NutritionInformation'
    calories: string
  }
  suitableForDiet?: string[]
  menuAddOn?: MenuItem[]
}

export interface MenuSection {
  '@type': 'MenuSection'
  name: string
  hasMenuItem: MenuItem[]
}

export interface MenuSchema {
  '@context': string
  '@type': 'Menu'
  name: string
  hasMenuSection: MenuSection[]
}

export interface MenuSectionItem {
  id: string
  name: string
  description?: string | null
  price: number
  calories?: number | null
  dietary_info?: string[]
  allergens?: string[]
  is_available: boolean
  is_special?: boolean
  available_from?: string | null
  available_until?: string | null
  image_url?: string | null
  sort_order: number
}

export interface MenuSectionData {
  id: string
  name: string
  description?: string | null
  sort_order: number
  items: MenuSectionItem[]
}

export interface MenuResponse {
  menu: MenuSchema
  sections: MenuSectionData[]
}

export interface DietaryMenuItem {
  '@type': 'MenuItem'
  id: string
  name: string
  description?: string
  offers: {
    '@type': 'Offer'
    price: string
    priceCurrency: string
    availability: string
    availableAtOrFrom?: string
    availableThrough?: string
  }
  nutrition?: {
    '@type': 'NutritionInformation'
    calories?: string
  }
  dietary_info?: string[]
  allergens?: string[]
  image?: string
}

export interface DietaryMenuSection {
  '@type': 'MenuSection'
  name: string
  items: DietaryMenuItem[]
  sort_order?: number
}

export interface DietaryMenuResponse {
  dietary_type: string
  menu_sections: DietaryMenuSection[]
  meta: {
    total_items: number
    lastUpdated: string
  }
}

// Kitchen status types
export type KitchenOpen = {
  opens: string
  closes: string
}

export type KitchenClosed = {
  is_closed: true
}

export type KitchenStatus = KitchenOpen | KitchenClosed | null

export interface BusinessHours {
  regularHours: {
    [key: string]: {
      opens: string
      closes: string
      kitchen?: KitchenStatus
      is_closed: boolean
      schedule_config?: Array<{
        name: string
        starts_at: string
        ends_at: string
        capacity: number
        booking_type: string
      }>
    }
  }
  specialHours: Array<{
    date: string
    opens?: string
    closes?: string
    is_closed: boolean
    status?: 'closed' | 'modified'
    reason?: string
    note?: string
    kitchen?: KitchenStatus
  }>
  serviceStatus?: Record<
    string,
    {
      displayName: string
      isEnabled: boolean
      message: string | null
      updatedAt: string
    }
  >
  serviceOverrides?: Record<
    string,
    Array<{
      startDate: string
      endDate: string
      isEnabled: boolean
      message: string | null
      updatedAt: string
      createdBy?: string
    }>
  >
  currentStatus: {
    isOpen: boolean
    kitchenOpen: boolean
    closesIn: string | null
    opensIn: string | null
    // Optional new fields for future API version
    currentTime?: string
    timestamp?: string
    services?: {
      venue: {
        open: boolean
        closesIn: string | null
      }
      kitchen: {
        open: boolean
        closesIn: string | null
      }
      bookings: {
        accepting: boolean
        availableSlots: string[]
      }
    }
    capacity?: {
      total: number
      available: number
      percentageFull: number
    }
  }
  // Optional new fields for future API version
  today?: {
    date: string
    dayName: string
    summary: string
    isSpecialHours: boolean
    events: Array<{
      title: string
      time: string
      affectsCapacity: boolean
    }>
  }
  upcomingWeek?: Array<{
    date: string
    dayName: string
    status: 'normal' | 'modified' | 'closed'
    summary: string
    note: string | null
  }>
  patterns?: {
    regularClosures: string[]
    typicalBusyTimes: {
      [key: string]: string[]
    }
    quietTimes: {
      [key: string]: string[]
    }
  }
  services?: {
    kitchen: {
      lunch?: {
        start: string
        end: string
      }
      dinner?: {
        start: string
        end: string
      }
      sundayLunch?: {
        available: boolean
        slots: string[]
        bookingRequired: boolean
        lastOrderTime: string
        message?: string | null
      }
    }
    bar: {
      happyHour?: {
        days: string[]
        start: string
        end: string
      }
    }
    privateHire: {
      available: boolean
      minimumNotice: string
      spaces: string[]
    }
  }
  planning?: {
    nextClosure?: {
      date: string
      reason: string
    }
    nextModifiedHours?: {
      date: string
      reason: string
      changes: string
    }
    seasonalChanges?: {
      summerHours?: {
        active: boolean
        period: string
        changes: string
      }
    }
  }
  integration?: {
    bookingApi: string
    eventsApi: string
    lastUpdated: string
    updateFrequency: string
  }
  timezone: string
  lastUpdated: string
}

export interface Amenity {
  type: string
  available: boolean
  details?: string | null
  capacity?: number | null
  [key: string]: unknown
}

export interface AmenitiesResponse {
  amenities: Amenity[]
  lastUpdated?: string
}

// Table Booking Types
export interface TableAvailabilitySlot {
  time: string
  available?: boolean
  available_capacity: number
  reason?: string
  requires_prepayment?: boolean
}

export interface TableAvailabilityResponse {
  date: string
  day?: string
  available: boolean
  time_slots: TableAvailabilitySlot[]
  kitchen_hours?: {
    opens: string
    closes: string
  } | null
  message?: string
  special_notes?: string
  time?: string
  party_size?: number
  remaining_capacity?: number
}

export interface TableBookingRequest {
  // Required fields
  booking_type: 'regular' | 'sunday_lunch'
  date: string
  time: string
  party_size: number
  purpose?: 'food' | 'drinks'
  customer: {
    first_name: string
    last_name: string
    email?: string
    mobile_number: string
    sms_opt_in?: boolean
  }
  // Optional fields
  duration_minutes?: number  // 60-240, default: 120
  special_requirements?: string
  dietary_requirements?: string[]  // Array of dietary needs
  allergies?: string[]  // Array of allergies
  celebration_type?: string  // birthday, anniversary, etc.
  source?: string  // website, phone, walk-in, social_media (default: website)
  // Legacy fields for backward compatibility
  customer_name?: string
  customer_first_name?: string
  customer_last_name?: string
  customer_phone?: string
  occasion?: string  // UI field that gets mapped to celebration_type
  marketing_opt_in?: boolean
  menu_selections?: Array<{
    custom_item_name: string
    item_type: string
    quantity: number
    guest_name: string
    price_at_booking: number
    special_requests?: string
  }>
}

export interface TableBookingResponse {
  booking_id: string
  booking_reference: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'pending_payment'
  customer_id?: string
  state?: 'confirmed' | 'pending_payment' | 'blocked'
  table_booking_id?: string | null
  reason?: string | null
  blocked_reason?:
    | 'outside_hours'
    | 'cut_off'
    | 'no_table'
    | 'private_booking_blocked'
    | 'too_large_party'
    | 'customer_conflict'
    | 'in_past'
    | 'blocked'
    | null
  next_step_url?: string | null
  hold_expires_at?: string | null
  table_name?: string | null
  // New API format uses confirmation_details instead of booking_details
  confirmation_details?: {
    date: string
    time: string
    party_size: number
    duration_minutes: number
    special_requirements?: string
    occasion?: string
  }
  // Keep booking_details for backward compatibility
  booking_details?: {
    date: string
    time: string
    party_size: number
    duration_minutes: number
    special_requirements?: string
    occasion?: string
  }
  confirmation_sent: boolean
  sms_status?: string
  payment_required?: boolean
  payment_details?: {
    amount?: number  // For compatibility
    deposit_amount: number
    total_amount: number
    outstanding_amount: number
    currency: string
    payment_url: string
    expires_at: string
  }
  cancellation_policy?: string
}

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
}

// Parking Booking Types
export interface ParkingCustomerDetails {
  first_name: string
  last_name: string
  email?: string
  mobile_number: string
}

export interface ParkingVehicleDetails {
  registration: string
  make?: string
  model?: string
  colour?: string
}

export interface ParkingBookingRequest {
  customer: ParkingCustomerDetails
  vehicle: ParkingVehicleDetails
  start_at: string
  end_at: string
  notes?: string
}

export interface ParkingPricingBreakdownItem {
  unit: 'hour' | 'day' | 'week' | 'month' | string
  quantity: number
  rate: number
  subtotal: number
}

export interface ParkingBookingResponse {
  booking_id: string
  reference: string
  amount: number
  currency: string
  pricing_breakdown?: ParkingPricingBreakdownItem[]
  payment_due_at: string
  paypal_approval_url: string
}

export interface ParkingBookingDetails {
  id: string
  reference: string
  status: 'pending_payment' | 'confirmed' | 'completed' | 'cancelled' | 'expired'
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed' | 'expired'
  customer_first_name: string
  customer_last_name: string
  customer_mobile: string
  customer_email?: string | null
  vehicle_registration: string
  vehicle_make?: string | null
  vehicle_model?: string | null
  vehicle_colour?: string | null
  start_at: string
  end_at: string
  calculated_price: number
  override_price?: number | null
  payment_due_at: string
  created_at: string
  updated_at: string
}

export interface ParkingCreateOrderRequest {
  customer: ParkingCustomerDetails
  vehicle: ParkingVehicleDetails
  start_at: string
  end_at: string
  notes?: string
}

// Management tools returns this from /parking/bookings when source:'website'.
// request<T>() automatically unwraps { success: true, data: {...} } → data.
export interface ParkingCreateOrderResponse {
  paypal_order_id: string
  booking_id: string
  reference: string
  amount: number
  currency: string
  pricing_breakdown?: ParkingPricingBreakdownItem[]  // needed for wizard step 4 price display
}

export interface ParkingCaptureResponse {
  booking_id: string
  reference: string
  status: string
}

export interface ParkingAvailabilitySlot {
  start_at: string
  end_at: string
  reserved: number
  remaining: number
  capacity: number
}

export interface ParkingRateCard {
  id: string
  effective_from: string
  hourly_rate: number
  daily_rate: number
  weekly_rate: number
  monthly_rate: number
  capacity_override?: number | null
  notes?: string | null
  created_at: string
}

export interface SundayLunchMenuItem {
  id: string
  name: string
  description?: string
  price: number
  dietary_info?: string[]
  allergens?: string[]
  is_available?: boolean
  included?: boolean
}

export interface SundayLunchMenuResponse {
  menu_date: string
  mains: SundayLunchMenuItem[]
  sides: SundayLunchMenuItem[]
  cutoff_time?: string
}

const buildPhaseSkipLogged = new Set<string>()

const FALLBACK_EVENT_CATEGORIES: EventCategoriesResponse = {
  categories: [
    {
      id: 'drag-shows',
      name: 'Hosted Nights',
      slug: 'drag-shows',
      description: 'Hosted nights with special guests (including Nikki Manfadge), plus one-off event evenings. See /whats-on for details.',
      color: '#8b5cf6',
      icon: '',
      is_active: true,
      default_start_time: '20:00',
      default_capacity: 120,
      event_count: 0
    },
    {
      id: 'quiz-nights',
      name: 'Quiz Nights',
      slug: 'quiz-nights',
      description: 'Weekly quiz nights with rolling jackpots and prizes.',
      color: '#0ea5e9',
      icon: '',
      is_active: true,
      default_start_time: '19:30',
      default_capacity: 80,
      event_count: 0
    },
    {
      id: 'live-music',
      name: 'Live Music',
      slug: 'live-music',
      description: 'Acoustic sets, tribute nights, and live bands.',
      color: '#22c55e',
      icon: '',
      is_active: true,
      default_start_time: '20:00',
      default_capacity: 100,
      event_count: 0
    }
  ],
  meta: {
    total: 3,
    lastUpdated: '2024-01-01T00:00:00.000Z'
  }
}

const FALLBACK_PARKING_RATES: ParkingRateCard = {
  id: 'fallback-parking-rates',
  effective_from: '2024-01-01T00:00:00.000Z',
  hourly_rate: 2.5,
  daily_rate: 12,
  weekly_rate: 55,
  monthly_rate: 180,
  capacity_override: 40,
  notes: 'Offline fallback rates. Contact the venue to confirm current pricing.',
  created_at: '2024-01-01T00:00:00.000Z'
}

const FALLBACK_SUNDAY_LUNCH_MENU: SundayLunchMenuResponse = {
  menu_date: '2024-01-01',
  mains: [
    {
      id: 'fallback-roasted-chicken',
      name: 'Roasted Chicken',
      description: 'Oven-roasted chicken breast with sage & onion stuffing balls, herb and garlic-crusted roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy',
      price: 19.99,
      dietary_info: [],
      allergens: [],
      is_available: true
    },
    {
      id: 'fallback-lamb-shank',
      name: 'Slow-Cooked Lamb Shank',
      description: 'Tender slow-braised lamb shank in rich red wine gravy, served with herb and garlic-crusted roast potatoes, seasonal vegetables, and a Yorkshire pudding',
      price: 23.99,
      dietary_info: [],
      allergens: [],
      is_available: true
    },
    {
      id: 'fallback-crispy-pork-belly',
      name: 'Crispy Pork Belly',
      description: 'Crispy crackling and tender slow-roasted pork belly with Bramley apple sauce, herb and garlic-crusted roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy',
      price: 21.99,
      dietary_info: [],
      allergens: [],
      is_available: true
    },
    {
      id: 'fallback-wellington-v',
      name: 'Beetroot & Butternut Squash Wellington (V)',
      description: 'Golden puff pastry filled with beetroot & butternut squash, served with herb and garlic-crusted roast potatoes, seasonal vegetables, and vegetarian gravy',
      price: 19.99,
      dietary_info: ['vegetarian'],
      allergens: ['gluten'],
      is_available: true
    },
    {
      id: 'fallback-kids-roasted-chicken',
      name: 'Kids Roasted Chicken',
      description: 'A smaller portion of our roasted chicken with herb and garlic-crusted roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy',
      price: 13.99,
      dietary_info: [],
      allergens: [],
      is_available: true
    }
  ],
  sides: [
    {
      id: 'fallback-roast-potatoes',
      name: 'Roast Potatoes',
      description: 'Herb and garlic-crusted roast potatoes.',
      price: 0,
      dietary_info: ['vegetarian'],
      allergens: [],
      included: true
    },
    {
      id: 'fallback-yorkshire-pudding',
      name: 'Yorkshire Pudding',
      description: 'Traditional Yorkshire pudding.',
      price: 0,
      dietary_info: [],
      allergens: ['gluten'],
      included: true
    },
    {
      id: 'fallback-seasonal-veg',
      name: 'Seasonal Vegetables',
      description: 'Fresh seasonal vegetables.',
      price: 0,
      dietary_info: ['vegetarian'],
      allergens: [],
      included: true
    },
    {
      id: 'fallback-red-wine-gravy',
      name: 'Red Wine Gravy',
      description: 'Red wine gravy (vegetarian gravy available on request).',
      price: 0,
      dietary_info: [],
      allergens: [],
      included: true
    }
  ],
  cutoff_time: '2024-01-06T13:00:00.000Z'
}

function createFallbackEvent(eventId: string): Event {
  const normalizedId = eventId.replace(/\/+$/, '')
  const id = normalizedId || 'the-anchor-event'
  const now = new Date()
  const nextSaturday = new Date(now)
  nextSaturday.setDate(now.getDate() + (6 - now.getDay() + 7) % 7)
  nextSaturday.setHours(20, 0, 0, 0)

  return {
    '@type': 'Event',
    id,
    slug: id,
    name: 'The Anchor Live Event',
    description: 'Offline placeholder for our live events. Call 01753 682707 for the latest lineup.',
    shortDescription: 'Offline event placeholder.',
    startDate: nextSaturday.toISOString(),
    endDate: null,
    doorTime: '2025-01-01T19:00:00+00:00',
    duration: 'PT3H',
    about: null,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'The Anchor, Stanwell Moor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Horton Road',
        addressLocality: 'Stanwell Moor',
        addressRegion: 'Surrey',
        postalCode: 'TW19 6AQ',
        addressCountry: 'GB'
      }
    },
    performer: {
      '@type': 'MusicGroup',
      name: 'Resident Entertainers'
    },
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      validFrom: now.toISOString(),
      url: 'https://www.the-anchor.pub/private-hire'
    },
    image: [DEFAULT_EVENT_IMAGE],
    video: [],
    heroImageUrl: DEFAULT_EVENT_IMAGE,
    thumbnailImageUrl: DEFAULT_EVENT_IMAGE,
    posterImageUrl: DEFAULT_EVENT_IMAGE,
    galleryImages: [],
    promoVideoUrl: null,
    highlightVideos: [],
    organizer: {
      '@type': 'Organization',
      name: 'The Anchor'
    },
    isAccessibleForFree: true,
    remainingAttendeeCapacity: 60,
    maximumAttendeeCapacity: 120,
    url: `https://www.the-anchor.pub/events/${id}`,
    identifier: id,
    metaTitle: 'Event at The Anchor',
    metaDescription: 'Join us at The Anchor for live entertainment near Heathrow Airport.',
    category: {
      id: 'fallback',
      name: 'Venue Event',
      slug: 'venue-event',
      color: '#005131',
      icon: ''
    },
    booking_rules: {
      max_seats_per_booking: 6,
      requires_customer_details: true,
      allows_notes: true,
      sms_confirmation_enabled: true
    },
    custom_messages: {},
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.the-anchor.pub/events/${id}`
    },
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.the-anchor.pub/private-hire',
        inLanguage: 'en-GB'
      },
      result: {
        '@type': 'Reservation',
        name: 'Event Reservation'
      }
    },
    faq: [],
    faqPage: undefined
  }
}

function createFallbackEventsResponse(): EventsResponse {
  const event = createFallbackEvent('the-anchor-showcase')
  return {
    events: [event],
    pagination: {
      total: 1,
      limit: 1,
      offset: 0
    }
  }
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

    return summary ? `Sunday lunch pre-order: ${summary}` : undefined
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
      ...(defaultCountryCode ? { default_country_code: defaultCountryCode } : {})
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
    // Deposit is £10/person for both Sunday lunch and groups of 7+
    const depositAmount = pendingPayment ? getSundayLunchDepositAmount(Number(originalRequest.party_size || 1)) : 0
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

    const mapItem = (item: MenuSectionItem): SundayLunchMenuItem => ({
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
      const mapped: SundayLunchMenuItem[] = []

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
    }
  ): TableAvailabilityResponse {
    const bookingType = params.booking_type === 'sunday_lunch' ? 'sunday_lunch' : 'regular'
    const normalizeClock = (value: string): string => {
      if (/^\d{2}:\d{2}$/.test(value)) return value
      if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5)
      return value
    }
    const isValidClock = (value: string): boolean => /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
    const toMinutes = (value: string): number => {
      const normalized = normalizeClock(value)
      const [hours, minutes] = normalized.split(':')
      return (Number.parseInt(hours || '0', 10) * 60) + Number.parseInt(minutes || '0', 10)
    }
    const toClock = (totalMinutes: number): string => {
      const normalized = ((totalMinutes % 1440) + 1440) % 1440
      const hours = Math.floor(normalized / 60)
      const minutes = normalized % 60
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    }
    const londonNowParts = (): { isoDate: string; minutes: number } => {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/London',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      const parts = formatter.formatToParts(new Date())
      const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
      return {
        isoDate: `${map.year}-${map.month}-${map.day}`,
        minutes: (Number.parseInt(map.hour || '0', 10) * 60) + Number.parseInt(map.minute || '0', 10)
      }
    }

    const [yearRaw, monthRaw, dayRaw] = params.date.split('-')
    const year = Number.parseInt(yearRaw || '', 10)
    const month = Number.parseInt(monthRaw || '', 10)
    const day = Number.parseInt(dayRaw || '', 10)
    const dayKey = Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)
      ? new Date(Date.UTC(year, month - 1, day))
          .toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' })
          .toLowerCase()
      : 'monday'

    const regularDay = (businessHours.regularHours?.[dayKey] || null) as Record<string, unknown> | null
    const specialDay = ((businessHours.specialHours || []) as Array<Record<string, unknown>>).find(
      (entry) => entry?.date === params.date
    ) || null

    const isClosed =
      specialDay?.status === 'closed' ||
      specialDay?.is_closed === true ||
      (specialDay && specialDay.opens === null && specialDay.closes === null) ||
      regularDay?.is_closed === true

    if (isClosed) {
      return {
        date: params.date,
        time: normalizeClock(params.time),
        party_size: params.party_size,
        available: false,
        time_slots: [],
        message: 'We are closed on that date. Please choose another day.'
      }
    }

    const parseScheduleConfig = (value: unknown): Array<{ startsAt: string; endsAt: string; bookingType?: string; capacity: number }> => {
      if (!Array.isArray(value)) return []
      const entries: Array<{ startsAt: string; endsAt: string; bookingType?: string; capacity: number }> = []

      for (const entry of value) {
        if (!entry || typeof entry !== 'object') continue

        const source = entry as Record<string, unknown>
        const startsAt = normalizeClock(String(source.starts_at || ''))
        const endsAt = normalizeClock(String(source.ends_at || ''))
        if (!isValidClock(startsAt) || !isValidClock(endsAt) || toMinutes(endsAt) <= toMinutes(startsAt)) {
          continue
        }

        const rawCapacity = source.capacity
        const parsedCapacity =
          typeof rawCapacity === 'number'
            ? Math.floor(rawCapacity)
            : typeof rawCapacity === 'string'
            ? Number.parseInt(rawCapacity, 10)
            : 50

        entries.push({
          startsAt,
          endsAt,
          bookingType: this.asTrimmedString(source.booking_type),
          capacity: Number.isFinite(parsedCapacity) && parsedCapacity > 0 ? parsedCapacity : 50
        })
      }

      return entries
    }

    const scheduleConfig = parseScheduleConfig(
      (specialDay?.schedule_config as unknown) ?? (regularDay?.schedule_config as unknown)
    )
    const typedSchedule = scheduleConfig.filter((entry) => entry.bookingType === bookingType)
    const fallbackSchedule = bookingType === 'regular' && typedSchedule.length === 0
      ? scheduleConfig
      : typedSchedule

    const ranges = fallbackSchedule.map((entry) => ({
      startsAt: entry.startsAt,
      endsAt: entry.endsAt,
      capacity: entry.capacity
    }))

    if (ranges.length === 0) {
      const kitchen = ((specialDay?.kitchen as any) || (regularDay?.kitchen as any) || null) as Record<string, unknown> | null
      const kitchenOpens = typeof kitchen?.opens === 'string' ? normalizeClock(kitchen.opens) : null
      const kitchenCloses = typeof kitchen?.closes === 'string' ? normalizeClock(kitchen.closes) : null

      if (bookingType === 'sunday_lunch') {
        if (!kitchenOpens || !kitchenCloses || !isValidClock(kitchenOpens) || !isValidClock(kitchenCloses)) {
          return {
            date: params.date,
            time: normalizeClock(params.time),
            party_size: params.party_size,
            available: false,
            time_slots: [],
            message: 'Sunday lunch is unavailable for that date. Please choose another date or call us.'
          }
        }

        ranges.push({
          startsAt: kitchenOpens,
          endsAt: kitchenCloses,
          capacity: 50
        })
      } else {
        const venueOpens = normalizeClock(String(specialDay?.opens || regularDay?.opens || kitchenOpens || '12:00'))
        const venueCloses = normalizeClock(String(specialDay?.closes || regularDay?.closes || kitchenCloses || '22:00'))
        if (!isValidClock(venueOpens) || !isValidClock(venueCloses) || toMinutes(venueCloses) <= toMinutes(venueOpens)) {
          return {
            date: params.date,
            time: normalizeClock(params.time),
            party_size: params.party_size,
            available: false,
            time_slots: [],
            message: 'We could not determine available times for that date.'
          }
        }

        ranges.push({
          startsAt: venueOpens,
          endsAt: venueCloses,
          capacity: 50
        })
      }
    }

    const londonNow = londonNowParts()
    const minMinutesForToday =
      londonNow.isoDate === params.date
        ? Math.ceil((londonNow.minutes + 60) / 30) * 30
        : undefined

    const slots = new Map<string, TableAvailabilitySlot>()
    for (const range of ranges) {
      const start = toMinutes(range.startsAt)
      const end = toMinutes(range.endsAt)
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue

      for (let cursor = start; cursor < end; cursor += 30) {
        if (typeof minMinutesForToday === 'number' && cursor < minMinutesForToday) {
          continue
        }

        const slotTime = toClock(cursor)
        const availableCapacity = Math.max(range.capacity, 0)
        const isAvailable = availableCapacity >= params.party_size
        const existing = slots.get(slotTime)

        if (!existing) {
          slots.set(slotTime, {
            time: slotTime,
            available: isAvailable,
            available_capacity: availableCapacity,
            reason: isAvailable ? undefined : 'party_too_large'
          })
          continue
        }

        const mergedCapacity = Math.max(existing.available_capacity || 0, availableCapacity)
        const mergedAvailable = mergedCapacity >= params.party_size
        slots.set(slotTime, {
          ...existing,
          available_capacity: mergedCapacity,
          available: mergedAvailable,
          reason: mergedAvailable ? undefined : existing.reason || 'party_too_large'
        })
      }
    }

    const timeSlots = Array.from(slots.values()).sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
    const available = timeSlots.some((slot) => slot.available === true || (slot.available_capacity || 0) >= params.party_size)

    return {
      date: params.date,
      time: normalizeClock(params.time),
      party_size: params.party_size,
      available,
      time_slots: timeSlots,
      message: available
        ? 'These times are based on current service windows and will be confirmed instantly when you continue.'
        : 'No online times are currently available for this request. Please choose an alternative or join the waitlist.',
      special_notes:
        'If your preferred time is unavailable, choose a nearby slot or call 01753 682707 to join the waitlist.'
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
    const baseEndpoint = endpoint.split('?')[0]
    const isBuildPhase =
      typeof window === 'undefined' &&
      process.env.NEXT_PHASE === 'phase-production-build' &&
      process.env.ENABLE_BUILD_TIME_EXTERNAL_API !== 'true'

    if (isBuildPhase) {
      const buildFallback = this.getFallbackResponse(baseEndpoint)
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

      const fallback = this.getFallbackResponse(baseEndpoint)

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
  } = {}): Promise<EventsResponse> {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.append(key, value.toString())
      }
    })

    return this.request<EventsResponse>(`/events?${query.toString()}`)
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
  async getMenu(): Promise<MenuResponse> {
    return this.request<MenuResponse>('/menu')
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

    const businessHours = await this.getBusinessHours()
    return this.buildTableAvailabilityFromBusinessHours(businessHours, {
      ...params,
      time: normalizedTime
    })
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

  async getSundayLunchMenu(date?: string): Promise<SundayLunchMenuResponse> {
    const menuDate = this.asTrimmedString(date) || this.getLondonIsoDate()
    const query = date ? `?date=${encodeURIComponent(date)}` : ''

    if (typeof window !== 'undefined') {
      try {
        const payload = await this.request<unknown>(`/table-bookings/menu/sunday-lunch${query}`)
        const candidate = this.unwrapSuccessData<SundayLunchMenuResponse>(payload) || (payload as SundayLunchMenuResponse)
        if (candidate && Array.isArray(candidate.mains) && Array.isArray(candidate.sides)) {
          return {
            ...candidate,
            menu_date: candidate.menu_date || menuDate
          }
        }
      } catch (error) {
        logError('api-sunday-lunch-menu-client', error)
      }

      return {
        ...FALLBACK_SUNDAY_LUNCH_MENU,
        menu_date: menuDate
      }
    }

    try {
      const menu = await this.getMenu()
      const mapped = this.mapSundayLunchMenuFromMenu(menu, menuDate)
      if (mapped) {
        return mapped
      }
    } catch (error) {
      logError('api-sunday-lunch-menu-server', error, { menuDate })
    }

    return {
      ...FALLBACK_SUNDAY_LUNCH_MENU,
      menu_date: menuDate
    }
  }

  // Business Information
  async getBusinessHours(): Promise<BusinessHours> {
    const data = await this.request<BusinessHours>('/business/hours', {
      // Never cache business hours: currentStatus/closesIn/opensIn are time-sensitive.
      next: { revalidate: 0 }
    })
    return data
  }

  async getAmenities(): Promise<AmenitiesResponse> {
    return this.request('/business/amenities')
  }

  private getFallbackResponse(endpoint: string): any | null {
    if (endpoint === '/event-categories') {
      return FALLBACK_EVENT_CATEGORIES
    }

    if (endpoint === '/parking/rates') {
      return FALLBACK_PARKING_RATES
    }

    if (endpoint === '/table-bookings/menu/sunday-lunch') {
      return FALLBACK_SUNDAY_LUNCH_MENU
    }

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

// Helper function for business hours
export async function getBusinessHours(): Promise<BusinessHours | null> {
  try {
    return await anchorAPI.getBusinessHours()
  } catch (error) {
    logError('api-business-hours', error)
    return null
  }
}

// Helper functions for common use cases
const MAX_EVENTS_LIMIT = 100

export async function getUpcomingEvents(limit: number = 10, daysLookahead?: number): Promise<Event[]> {
  try {
    const safeLimit = Math.min(Math.max(Math.floor(limit), 1), MAX_EVENTS_LIMIT)

    const now = new Date()
    const params: {
      from_date: string
      to_date?: string
      limit: number
      status: string
    } = {
      from_date: now.toISOString().split('T')[0],
      limit: safeLimit,
      status: 'scheduled'
    }

    if (typeof daysLookahead === 'number' && Number.isFinite(daysLookahead)) {
      const toDate = new Date(now)
      toDate.setDate(now.getDate() + daysLookahead)
      params.to_date = toDate.toISOString().split('T')[0]
    }

    const response = await anchorAPI.getEvents(params)
    const events = response.events || []
    const nowMs = Date.now()

    return events.filter(event => {
      const startMs = Date.parse(event.startDate)
      return Number.isFinite(startMs) && startMs > nowMs
    })
  } catch (error) {
    logError('api-upcoming-events', error, { limit, daysLookahead })
    return createFallbackEventsResponse().events
  }
}

export async function getUpcomingEventsByCategory(
  categoryId: string,
  limit: number = 10,
  daysLookahead?: number
): Promise<Event[]> {
  if (!categoryId) return []

  try {
    const safeLimit = Math.min(Math.max(Math.floor(limit), 1), MAX_EVENTS_LIMIT)

    const now = new Date()
    const params: {
      from_date: string
      to_date?: string
      limit: number
      status: string
      category_id: string
    } = {
      from_date: now.toISOString().split('T')[0],
      limit: safeLimit,
      status: 'scheduled',
      category_id: categoryId
    }

    if (typeof daysLookahead === 'number' && Number.isFinite(daysLookahead)) {
      const toDate = new Date(now)
      toDate.setDate(now.getDate() + daysLookahead)
      params.to_date = toDate.toISOString().split('T')[0]
    }

    const response = await anchorAPI.getEvents(params)
    const events = response.events || []
    const nowMs = Date.now()

    return events.filter(event => {
      const startMs = Date.parse(event.startDate)
      return Number.isFinite(startMs) && startMs > nowMs
    })
  } catch (error) {
    logError('api-upcoming-events-by-category', error, { categoryId, limit, daysLookahead })
    return []
  }
}

export async function getTodaysEvents(): Promise<Event[]> {
  try {
    const response = await anchorAPI.getTodaysEvents('scheduled')
    const events = response.events || []
    const nowMs = Date.now()

    return events.filter(event => {
      const startMs = Date.parse(event.startDate)
      return Number.isFinite(startMs) && startMs > nowMs
    })
  } catch (error) {
    logError('api-todays-events', error)
    return []
  }
}

export async function getEventsByCategory(category: string, limit: number = 20): Promise<Event[]> {
  try {
    const response = await anchorAPI.getEvents({
      category_id: category,
      limit,
    })
    return response.events || []
  } catch (error) {
    logError('api-events-by-category', error, { category, limit })
    return []
  }
}

// Format helpers
export function formatEventDate(dateString: string): string {
  // Parse the date string and display in UK timezone
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/London'
  })
}

export function formatEventTime(dateString: string): string {
  let date: Date

  // IMPORTANT: The API returns times like "2025-07-18T19:00+00:00" which are UTC
  // But these events are actually scheduled for local UK time (7pm local, not 7pm UTC)
  // So we need to treat the numeric time as local time, ignoring the timezone offset

  // Extract just the date and time part, ignoring any timezone info
  let cleanDateString = dateString

  // Remove timezone offset (+00:00, -05:00, etc) or Z
  if (dateString.includes('+') || dateString.includes('Z')) {
    cleanDateString = dateString.split('+')[0].split('Z')[0]
  } else if (dateString.includes('-') && dateString.lastIndexOf('-') > 10) {
    // Handle negative offsets (but not the date separators)
    cleanDateString = dateString.substring(0, dateString.lastIndexOf('-'))
  }

  // Parse as local time
  if (cleanDateString.includes('T')) {
    date = new Date(cleanDateString)
  } else {
    // Format like "2024-03-20 19:00:00"
    const isoString = cleanDateString.replace(' ', 'T')
    date = new Date(isoString)
  }

  // Format the time
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours >= 12 ? 'pm' : 'am'
  const displayHours = hours % 12 || 12

  // Convert to the desired format (8pm instead of 8:00 pm)
  if (minutes === 0) {
    return `${displayHours}${period}`
  } else {
    return `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`
  }
}

export function formatPrice(price: string | number, currency: string = 'GBP'): string {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'code'
  })
  return formatter
    .format(typeof price === 'string' ? parseFloat(price) : price)
    .replace(/\u00A0/g, ' ')
}

export function isEventSoldOut(event: Event): boolean {
  return event.remainingAttendeeCapacity === 0 ||
    event.offers?.availability === 'https://schema.org/SoldOut'
}

export function isEventFree(event: Event): boolean {
  return event.isAccessibleForFree === true ||
    event.offers?.price === '0' ||
    event.offers?.price === '0.00'
}

export function getEventShortDescription(event: Event, maxLength: number = 150): string {
  // Use shortDescription if available
  if (event.shortDescription) {
    return event.shortDescription
  }

  // Otherwise use description
  if (!event.description) {
    // Generate a default description based on event type
    const name = event.name.toLowerCase()
    if (name.includes('drag')) {
      return 'Join us for a Nikki Manfadge-hosted night and special entertainment. See /whats-on for the latest details.'
    } else if (name.includes('quiz')) {
      return 'Test your knowledge at our popular quiz night. Great prizes to be won!'
    } else if (name.includes('bingo')) {
      return 'Eyes down for a fun-filled bingo session with cash prizes.'
    } else if (name.includes('celebration') || name.includes('party')) {
      return 'Special celebration event - join us for a great time!'
    } else if (name.includes('tasting')) {
      return 'Join us for an exclusive tasting event with expert guidance.'
    } else if (name.includes('roast')) {
      return 'Traditional British Sunday roast with all the trimmings.'
    }
    return `Join us for ${event.name} at The Anchor.`
  }

  // Truncate long descriptions
  if (event.description.length > maxLength) {
    return event.description.substring(0, maxLength).trim() + '...'
  }

  return event.description
}

// Event helper functions
export async function checkEventAvailability(eventId: string, seats: number = 1): Promise<EventAvailability | null> {
  try {
    return await anchorAPI.checkEventAvailability(eventId, seats)
  } catch (error) {
    logError('api-check-availability', error, { eventId, seats })
    return null
  }
}

// Helper to get event categories
export async function getEventCategories(): Promise<EventCategory[]> {
  try {
    const response = await anchorAPI.getEventCategories()
    return response.categories || []
  } catch (error) {
    logError('api-event-categories', error)
    return []
  }
}

// Type guards for kitchen status
export const isKitchenOpen = (kitchen: any): kitchen is KitchenOpen => {
  return kitchen && typeof kitchen === 'object' && 'opens' in kitchen && 'closes' in kitchen
}

export const isKitchenClosed = (kitchen: any): kitchen is KitchenClosed => {
  return kitchen && typeof kitchen === 'object' && 'is_closed' in kitchen && kitchen.is_closed === true
}

export const getKitchenStatus = (kitchen: KitchenStatus): 'open' | 'closed' | 'no-service' => {
  if (isKitchenOpen(kitchen)) return 'open'
  if (isKitchenClosed(kitchen)) return 'closed'
  return 'no-service'
}

// Helper to format door time
export function formatDoorTime(doorTimeString: string | null | undefined): string | null {
  if (!doorTimeString) return null

  // Use the same logic as formatEventTime - strip timezone and treat as local time
  let cleanDateString = doorTimeString

  // Remove timezone offset (+00:00, -05:00, etc) or Z
  if (doorTimeString.includes('+') || doorTimeString.includes('Z')) {
    cleanDateString = doorTimeString.split('+')[0].split('Z')[0]
  } else if (doorTimeString.includes('-') && doorTimeString.lastIndexOf('-') > 10) {
    // Handle negative offsets (but not the date separators)
    cleanDateString = doorTimeString.substring(0, doorTimeString.lastIndexOf('-'))
  }

  // Parse as local time
  let date: Date
  if (cleanDateString.includes('T')) {
    date = new Date(cleanDateString)
  } else {
    // Format like "2024-03-20 19:00:00"
    const isoString = cleanDateString.replace(' ', 'T')
    date = new Date(isoString)
  }

  const hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours >= 12 ? 'pm' : 'am'
  const displayHours = hours % 12 || 12

  const timeString = minutes === 0
    ? `${displayHours}${period}`
    : `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`

  return 'Doors: ' + timeString
}

// Helper to format event duration
export function formatEventDuration(duration: string | null | undefined): string | null {
  if (!duration) return null

  // Parse ISO 8601 duration (e.g., PT3H30M)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return null

  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')

  if (hours && minutes) {
    return `${hours}h ${minutes}m`
  } else if (hours) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  } else if (minutes) {
    return `${minutes} minutes`
  }

  return null
}

// Helper to check if event has limited availability
export function hasLimitedAvailability(event: Event): boolean {
  return event.offers?.availability === 'https://schema.org/LimitedAvailability' ||
    (event.remainingAttendeeCapacity !== undefined && event.remainingAttendeeCapacity < 10)
}
