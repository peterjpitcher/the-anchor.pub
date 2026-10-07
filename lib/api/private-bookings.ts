// Private Booking Types and API functions

import { logError } from '@/lib/error-handling'
import { toGuestMessage } from '@/lib/guest-error-messages'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import type { ApiResponse } from './shared'
import type { CommunicationConsentPayload } from '@/lib/communication-consent'

const API_BASE_URL = typeof window === 'undefined'
  ? getManagementApiBaseUrl()
  : '/api'

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
    summary?: string
    includes?: string
    served?: string
    good_to_know?: string
    guest_description?: string
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
  communication_consent?: CommunicationConsentPayload
  // Spam protection fields, checked server-side, not forwarded upstream
  turnstile_token?: string
  website?: string
  _t?: number
}

export interface PrivateBookingResponse {
  success: boolean
  data: {
    id: string
    reference: string
  }
}

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

    // A gateway page or an empty answer is not JSON. It is a failed enquiry
    // like any other, not a reason to throw.
    const responseData = await res.json().catch(() => null)

    // The route answers a failure with `error` as a string (the spam guard) or
    // as `{ code, message }` (everything else). This used to copy whichever
    // arrived into `message`, and the form rendered it: an object there threw
    // "Objects are not valid as a React child", the whole page fell to the
    // error boundary and everything the guest had typed was lost. `message` is
    // now always one sentence with the phone number in it.
    if (!res.ok || !responseData || responseData.success !== true) {
      return {
        success: false,
        error: {
          code: 'BOOKING_CREATION_ERROR',
          message: toGuestMessage(responseData?.error, 'private_hire')
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
        message: toGuestMessage(null, 'private_hire')
      }
    }
  }
}
