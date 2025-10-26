import { DateTime } from 'luxon'
import { BusinessHours, KitchenStatus } from '@/lib/api'

interface NextChange {
  at: Date
  reason: 'opens' | 'closes' | 'kitchen_opens' | 'kitchen_closes'
}

/**
 * Check if kitchen has opening hours
 */
function isKitchenOpen(kitchen: KitchenStatus): kitchen is { opens: string; closes: string } {
  return kitchen !== null && 'opens' in kitchen && 'closes' in kitchen
}

/**
 * Computes the next status change boundary based on current API data
 * Uses Europe/London timezone consistently to match the venue
 */
export function computeNextStatusChange(data: BusinessHours): NextChange {
  const now = DateTime.now().setZone('Europe/London')
  const { currentStatus, regularHours, specialHours } = data
  
  // Get today's day name for regularHours lookup
  const todayName = now.toFormat('cccc').toLowerCase()
  const todayDateStr = now.toFormat('yyyy-MM-dd')
  
  // Check for special hours for today
  const todaySpecialHours = specialHours?.find(sh => sh.date === todayDateStr)
  
  // Determine today's hours (special hours override regular)
  let todayHours = todaySpecialHours || regularHours[todayName]
  
  // Calculate next venue status change
  let nextVenueChange: DateTime | null = null
  let nextVenueReason: 'opens' | 'closes' = 'opens'
  
  if (currentStatus.isOpen) {
    // We're open, next change is closing
    if (todayHours && 'closes' in todayHours && todayHours.closes) {
      const [closeHour, closeMin] = todayHours.closes.split(':').map(Number)
      nextVenueChange = now.set({ hour: closeHour, minute: closeMin, second: 0, millisecond: 0 })
      
      // If closing time has passed, it's an error in API data, use fallback
      if (nextVenueChange <= now) {
        nextVenueChange = now.plus({ minutes: 60 })
      }
      nextVenueReason = 'closes'
    }
  } else {
    // We're closed, find next opening
    // First check if we open later today
    if (todayHours && 'opens' in todayHours && todayHours.opens && !todayHours.is_closed) {
      const [openHour, openMin] = todayHours.opens.split(':').map(Number)
      const openTime = now.set({ hour: openHour, minute: openMin, second: 0, millisecond: 0 })
      
      if (openTime > now) {
        // We open later today
        nextVenueChange = openTime
        nextVenueReason = 'opens'
      }
    }
    
    // If not opening today, check tomorrow
    if (!nextVenueChange) {
      const tomorrow = now.plus({ days: 1 })
      const tomorrowName = tomorrow.toFormat('cccc').toLowerCase()
      const tomorrowDateStr = tomorrow.toFormat('yyyy-MM-dd')
      
      // Check for special hours tomorrow
      const tomorrowSpecialHours = specialHours?.find(sh => sh.date === tomorrowDateStr)
      const tomorrowHours = tomorrowSpecialHours || regularHours[tomorrowName]
      
      if (tomorrowHours && 'opens' in tomorrowHours && tomorrowHours.opens && !tomorrowHours.is_closed) {
        const [openHour, openMin] = tomorrowHours.opens.split(':').map(Number)
        nextVenueChange = tomorrow.set({ hour: openHour, minute: openMin, second: 0, millisecond: 0 })
        nextVenueReason = 'opens'
      }
    }
  }
  
  // Calculate next kitchen status change
  let nextKitchenChange: DateTime | null = null
  let nextKitchenReason: 'kitchen_opens' | 'kitchen_closes' | null = null
  
  // Only calculate kitchen changes if kitchen service exists today
  const todayKitchen = todayHours?.kitchen
  if (todayHours && todayKitchen && isKitchenOpen(todayKitchen)) {
    if (currentStatus.kitchenOpen) {
      // Kitchen is open, next change is closing
      const [closeHour, closeMin] = todayKitchen.closes.split(':').map(Number)
      const closeTime = now.set({ hour: closeHour, minute: closeMin, second: 0, millisecond: 0 })
      
      if (closeTime > now) {
        nextKitchenChange = closeTime
        nextKitchenReason = 'kitchen_closes'
      }
    } else {
      // Kitchen is closed, check if it opens later today
      const [openHour, openMin] = todayKitchen.opens.split(':').map(Number)
      const openTime = now.set({ hour: openHour, minute: openMin, second: 0, millisecond: 0 })
      
      if (openTime > now) {
        nextKitchenChange = openTime
        nextKitchenReason = 'kitchen_opens'
      }
    }
  }
  
  // Return the earliest change
  let earliestChange = nextVenueChange
  let earliestReason: 'opens' | 'closes' | 'kitchen_opens' | 'kitchen_closes' = nextVenueReason
  
  if (nextKitchenChange && (!earliestChange || nextKitchenChange < earliestChange)) {
    earliestChange = nextKitchenChange
    earliestReason = nextKitchenReason!
  }
  
  // Fallback: if no change found (shouldn't happen), refresh in 60 minutes
  if (!earliestChange) {
    earliestChange = now.plus({ minutes: 60 })
    earliestReason = 'opens'
  }
  
  return {
    at: earliestChange.toJSDate(),
    reason: earliestReason
  }
}

/**
 * Helper to get tomorrow's hours from regularHours
 */
export function getTomorrowHours(data: BusinessHours) {
  const now = DateTime.now().setZone('Europe/London')
  const tomorrow = now.plus({ days: 1 })
  const tomorrowName = tomorrow.toFormat('cccc').toLowerCase()
  const tomorrowDateStr = tomorrow.toFormat('yyyy-MM-dd')
  
  // Check for special hours tomorrow
  const tomorrowSpecialHours = data.specialHours?.find(sh => sh.date === tomorrowDateStr)
  
  // Return special hours if they exist, otherwise regular hours
  return tomorrowSpecialHours || data.regularHours[tomorrowName]
}

/**
 * Get today's hours accounting for special hours
 */
export function getTodayHours(data: BusinessHours) {
  const now = DateTime.now().setZone('Europe/London')
  const todayName = now.toFormat('cccc').toLowerCase()
  const todayDateStr = now.toFormat('yyyy-MM-dd')
  
  // Check for special hours today
  const todaySpecialHours = data.specialHours?.find(sh => sh.date === todayDateStr)
  
  // Return special hours if they exist, otherwise regular hours
  return todaySpecialHours || data.regularHours[todayName]
}

/**
 * Format time for display (e.g., "4pm", "10:30am")
 */
export function formatTime12Hour(time: string): string {
  if (!time) return ''
  
  const [hour, minute] = time.split(':').map(Number)
  const period = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  
  if (minute === 0) {
    return `${displayHour}${period}`
  }
  return `${displayHour}:${minute.toString().padStart(2, '0')}${period}`
}

/**
 * Get day name for today
 */
export function getTodayDayName(): string {
  const now = DateTime.now().setZone('Europe/London')
  return now.toFormat('cccc').toLowerCase()
}

/**
 * Get day name for tomorrow
 */
export function getTomorrowDayName(): string {
  const now = DateTime.now().setZone('Europe/London')
  const tomorrow = now.plus({ days: 1 })
  return tomorrow.toFormat('cccc').toLowerCase()
}

interface DayHoursResult {
  hours: any
  dayName: string
  date: DateTime
}

function getHoursForDayOffset(data: BusinessHours, offset: number): DayHoursResult {
  const now = DateTime.now().setZone('Europe/London')
  const target = now.plus({ days: offset })
  const dayNameLower = target.toFormat('cccc').toLowerCase()
  const dateStr = target.toFormat('yyyy-MM-dd')
  const specialHours = data.specialHours?.find(sh => sh.date === dateStr)
  const hours = specialHours || data.regularHours[dayNameLower]
  return {
    hours,
    dayName: target.toFormat('cccc'),
    date: target
  }
}

export interface NextKitchenOpening {
  offset: number
  opens: string
  closes: string
  dayName: string
  date: Date
}

export function findNextKitchenOpening(
  data: BusinessHours,
  options: { includeToday?: boolean; maxDays?: number } = {}
): NextKitchenOpening | null {
  const { includeToday = false, maxDays = 14 } = options
  const startOffset = includeToday ? 0 : 1

  for (let offset = startOffset; offset <= maxDays; offset += 1) {
    const { hours, dayName, date } = getHoursForDayOffset(data, offset)
    if (!hours || hours.is_closed) continue

    const kitchen = (hours as any).kitchen ?? null
    const kitchenClosedFlag = (hours as any).is_kitchen_closed === true

    if (kitchenClosedFlag) continue
    if (!kitchen) continue
    if (!isKitchenOpen(kitchen)) continue

    return {
      offset,
      opens: kitchen.opens,
      closes: kitchen.closes,
      dayName,
      date: date.toJSDate()
    }
  }

  return null
}
