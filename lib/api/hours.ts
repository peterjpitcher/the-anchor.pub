// Business hours domain types and helpers

import { logError } from '@/lib/error-handling'

// Kitchen status types
export type KitchenOpen = {
  opens: string
  closes: string
}

export type KitchenClosed = {
  is_closed: true
}

export type KitchenStatus = KitchenOpen | KitchenClosed | null

export interface DayHoursEntry {
  opens: string
  closes: string
  kitchen?: KitchenStatus
  is_closed: boolean
  is_kitchen_closed?: boolean
  schedule_config?: Array<{
    name?: string
    starts_at: string
    ends_at: string
    capacity: number
    booking_type: string
    slot_type?: string
  }>
}

export interface BusinessHours {
  regularHours: {
    [key: string]: DayHoursEntry
  }
  /**
   * Published weekly schedules whose start date has not yet arrived.
   *
   * `regularHours` above is only the schedule in force on the date the API
   * resolved (today, unless `?date=` was sent). Anything painting a future
   * date - the seven-day table, opening-hours schema, a booking date months
   * out - must resolve against these first. See `resolveRegularHoursForDate`.
   */
  upcomingVersions?: Array<{
    effectiveFrom: string
    label?: string | null
    hours: Record<string, DayHoursEntry>
  }>
  specialHours: Array<{
    date: string
    opens?: string
    closes?: string
    is_closed: boolean
    status?: 'closed' | 'modified'
    reason?: string
    note?: string
    kitchen?: KitchenStatus
    is_kitchen_closed?: boolean
    schedule_config?: Array<{
      name?: string
      starts_at: string
      ends_at: string
      capacity: number
      booking_type: string
    }>
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
      sundayLunch?: {
        enabled: boolean
        startsAt: string | null
        endsAt: string | null
        capacity: number | null
        message: string | null
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

// Standalone helper that uses the singleton
export async function getBusinessHours(): Promise<BusinessHours | null> {
  const { anchorAPI } = await import('./client')
  try {
    return await anchorAPI.getBusinessHours()
  } catch (error) {
    logError('api-business-hours', error)
    return null
  }
}

/**
 * Cached hours for server-rendering the seven-day table, so crawlers and no-JS
 * clients read real times instead of a loading placeholder while the page stays
 * on ISR. Do not read `currentStatus` from this: it is stale by design. Live
 * open/closed state comes from the client provider.
 */
export async function getBusinessHoursSnapshot(): Promise<BusinessHours | null> {
  const { anchorAPI } = await import('./client')
  try {
    return await anchorAPI.getBusinessHoursSnapshot()
  } catch (error) {
    logError('api-business-hours-snapshot', error)
    return null
  }
}
