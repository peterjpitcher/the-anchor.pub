// Table Booking domain types

import type { CommunicationConsentPayload } from '@/lib/communication-consent'

export type SlotBusyness = 'quiet' | 'filling' | 'busy'

export interface TableAvailabilitySlot {
  time: string
  available?: boolean
  available_capacity: number
  reason?: string
  requires_prepayment?: boolean
  kitchen_open?: boolean
  busyness?: SlotBusyness
  // High chairs still free in this slot's window (from the AMS load read-out).
  // Absent when the management API does not report it — treat as "unknown".
  high_chairs_remaining?: number
}

// Why a slot cannot be booked, in customer-safe terms. AMS never exposes an
// internal reason here (a private booking reads as `tables_full`).
export type TableAvailabilityPublicReason =
  | 'tables_full'
  | 'kitchen_full'
  | 'outside_full'
  | 'closed'
  | 'too_late'
  | 'too_large'
  | 'unknown'

// One slot of the authoritative read-out. These five keys are the whole
// per-slot contract; anything else is drift and must be a deliberate change in
// both repos (pinned by tests/fixtures/table-availability-contract.json).
export interface TableAvailabilitySlotState {
  time: string
  state: 'available' | 'unavailable'
  public_reason: TableAvailabilityPublicReason | null
  message: string | null
  high_chairs_remaining: number
}

/**
 * The authoritative availability read-out (`data.table_availability`), built by
 * the check_table_availability_v06 RPC in AMS and passed through untouched.
 *
 * `calculation_state: 'unknown'` means the check could not run: NOTHING may be
 * treated as bookable, and the caller must say "please ring" rather than fall
 * back to locally calculated slots (review F04). The route-level unknown
 * fallback carries no `message`, so callers must supply their own copy.
 *
 * `purpose`, `outside`, `requires_accessible_table`, `max_party_size_online`
 * and `duration_minutes` are informational echoes of the request: the website
 * must tolerate every one of them being absent.
 */
export interface TableAvailability {
  contract_version?: number
  calculation_state: 'complete' | 'unknown'
  date?: string
  party_size?: number
  slots?: TableAvailabilitySlotState[]
  // Present on empty-slot responses.
  public_reason?: TableAvailabilityPublicReason
  message?: string
  purpose?: string
  outside?: boolean
  requires_accessible_table?: boolean
  max_party_size_online?: number
  duration_minutes?: number
}

export interface TableBookingLoadResponse {
  date: string
  window_minutes: number
  busy_threshold_covers: number
  filling_threshold_covers: number
  bookings: Array<{
    time: string
    covers: number
  }>
  // Kitchen pacing read-out. PACING ONLY: it knows nothing about tables, so
  // `remaining > 0` must never on its own be treated as bookable. Additive and
  // optional: absent on older API builds. Carries `high_chairs_remaining` so
  // the availability proxy can surface it per slot to the browser.
  slots?: Array<{
    time: string
    covers?: number
    remaining?: number
    high_chairs_remaining?: number
  }>
  // The authoritative answer. Null when no party size was supplied (an older
  // website cannot ask the question), absent on older API builds.
  table_availability?: TableAvailability | null
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
  high_chair_count?: number  // 0-2 requested high chairs
  is_outside_seating?: boolean  // guest asked for an outside/patio table
  communication_consent?: CommunicationConsentPayload
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
  notification_channel?: 'email' | 'whatsapp' | 'sms' | null
  high_chairs_granted?: number  // high chairs actually reserved (may be < requested)
  is_outside_seating?: boolean  // booking flagged as an outside/patio table
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
