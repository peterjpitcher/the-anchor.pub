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
