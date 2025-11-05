export type WizardFlowStep =
  | 'date'
  | 'sunday_offer'
  | 'party_size'
  | 'menu_selection'
  | 'time'
  | 'details'
  | 'confirm'

export interface MenuSelectionPayload {
  custom_item_name: string
  item_type: 'main' | 'side'
  quantity: number
  guest_name: string
  price_at_booking: number
  special_requests?: string
}

export interface MenuGuestSummary {
  guestName: string
  mainName: string
  price: number
}

export interface MenuExtrasSummary {
  name: string
  quantity: number
  price: number
}

export interface MenuSummary {
  guests: MenuGuestSummary[]
  extras: MenuExtrasSummary[]
  totals: {
    mains: number
    extras: number
    total: number
    deposit: number
  }
}

export interface BookingWizardData {
  // Step 1
  date: string
  
  // Step 2 (Sunday only)
  bookingType: 'regular' | 'sunday_lunch'
  sundayLunchAvailable: boolean
  
  // Step 2b (Sunday lunch only)
  menuSelections?: MenuSelectionPayload[]
  menuSummary?: MenuSummary
  
  // Step 3
  partySize: number
  
  // Step 4
  time: string
  
  // Step 5
  firstName: string
  lastName: string
  phone: string
  email: string
  
  // Step 6
  dietaryRequirements: string[]
  allergies: string
  occasion: string
  specialRequirements: string
  
  // Marketing
  marketingOptIn: boolean
}

export interface TimeSlot {
  time: string
  available: boolean
  busy?: boolean
  remaining?: number
}

export interface DayAvailability {
  date: string
  isClosed: boolean
  isKitchenClosed: boolean
  times: TimeSlot[]
  specialNote?: string
}

export interface SundayLunchOverride {
  startDate: string
  endDate: string
  isEnabled: boolean
  message?: string | null
}

export interface AvailabilityData {
  days: DayAvailability[]
  blockedDates: string[]
  sundayRoastDates: string[]
  sundayLunchStatus?: {
    isEnabled: boolean
    message?: string | null
    updatedAt?: string
  }
  sundayLunchOverrides?: SundayLunchOverride[]
}

export interface DateEventSummary {
  id: string
  name: string
  startDate: string
  slug?: string
  url?: string
  shortDescription?: string | null
}

export type EventsByDate = Record<string, DateEventSummary[]>

export interface WizardStepProps {
  onNext: (data: any) => void
  onBack?: () => void
}

export interface ValidationError {
  field: string
  message: string
}
