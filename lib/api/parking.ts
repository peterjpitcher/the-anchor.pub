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

export const FALLBACK_PARKING_RATES: ParkingRateCard = {
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
