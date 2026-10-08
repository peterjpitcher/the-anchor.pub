import type { CommunicationConsentPayload } from '@/lib/communication-consent'

// Parking domain types

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
  communication_consent?: CommunicationConsentPayload
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

/**
 * A parking booking as this site is allowed to hold it: the reference, the
 * times, the vehicle, the amount and the status. Nothing about the person.
 *
 * The management app answers with the whole booking row, which carries a name,
 * a mobile number and an email address. Those can be the details already on
 * file for the mobile number that was typed into the form, not the ones the
 * person typing gave, and the only key to this read is the booking id. So the
 * site never keeps them: `toPublicParkingBooking` below copies the fields
 * named here and drops everything else (site review, 7 October 2026).
 */
export interface ParkingBookingDetails {
  id: string
  reference: string
  status: 'pending_payment' | 'confirmed' | 'completed' | 'cancelled' | 'expired'
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed' | 'expired'
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

/**
 * The only fields of a parking booking that leave the management app's answer.
 * An allow-list on purpose: a field added upstream later stays out until it is
 * named here.
 */
export const PUBLIC_PARKING_BOOKING_FIELDS = [
  'id',
  'reference',
  'status',
  'payment_status',
  'vehicle_registration',
  'vehicle_make',
  'vehicle_model',
  'vehicle_colour',
  'start_at',
  'end_at',
  'calculated_price',
  'override_price',
  'payment_due_at',
  'created_at',
  'updated_at',
] as const satisfies readonly (keyof ParkingBookingDetails)[]

/** Null, an array or anything that is not an object comes back as null. */
export function toPublicParkingBooking(raw: unknown): ParkingBookingDetails | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

  const source = raw as Record<string, unknown>
  const picked: Record<string, unknown> = {}
  for (const field of PUBLIC_PARKING_BOOKING_FIELDS) {
    if (source[field] !== undefined) picked[field] = source[field]
  }
  return picked as unknown as ParkingBookingDetails
}

export interface ParkingCreateOrderRequest {
  customer: ParkingCustomerDetails
  vehicle: ParkingVehicleDetails
  start_at: string
  end_at: string
  notes?: string
  communication_consent?: CommunicationConsentPayload
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
