import { AvailabilityData, DayAvailability, TimeSlot, SundayLunchOverride } from '@/components/features/BookingWizard/types'
import { getEffectiveDayHours, isKitchenClosed, isVenueClosed } from '@/lib/hours-utils'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'

// Cache availability data for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000
let availabilityCache: {
  data: AvailabilityData | null
  timestamp: number
} = {
  data: null,
  timestamp: 0
}

/**
 * Pre-load availability for the next 30 days
 * This runs server-side to avoid async loading issues for AI agents
 */
export async function getAvailabilityForNext30Days(): Promise<AvailabilityData> {
  // Check cache
  if (availabilityCache.data && Date.now() - availabilityCache.timestamp < CACHE_DURATION) {
    return availabilityCache.data
  }
  
  const days: DayAvailability[] = []
  const blockedDates: string[] = []
  const sundayRoastDates: string[] = []
  let sundayLunchEnabled = true
  let sundayLunchMessage: string | null = null
  let sundayLunchUpdatedAt: string | undefined
  const sundayLunchOverrides: SundayLunchOverride[] = []

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Generate dates for next 30 days
  const dates: string[] = []
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    dates.push(date.toISOString().split('T')[0])
  }
  
  const populateFallbackAvailability = () => {
    for (const dateStr of dates) {
      const date = new Date(dateStr + 'T12:00:00')
      const isSunday = date.getDay() === 0
      const dayOfWeek = date.getDay()
      
      // Basic hours based on day of week
      const times: TimeSlot[] = []
      if (dayOfWeek !== 1) { // Not Monday (usually closed)
        for (let hour = 12; hour <= 21; hour++) {
          for (let min = 0; min < 60; min += 30) {
            if (hour === 21 && min === 30) break
            
            const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
            times.push({
              time: timeStr,
              available: true,
              busy: false,
              remaining: 10
            })
          }
        }
      }
      
      days.push({
        date: dateStr,
        isClosed: dayOfWeek === 1,
        isKitchenClosed: dayOfWeek === 1,
        times
      })
      
      if (dayOfWeek === 1) {
        blockedDates.push(dateStr)
      }
      
      if (isSunday && dayOfWeek !== 1) {
        sundayRoastDates.push(dateStr)
      }
    }
  }
  
  const skipExternal =
    typeof window === 'undefined' &&
    process.env.NEXT_PHASE === 'phase-production-build' &&
    process.env.ENABLE_BUILD_TIME_EXTERNAL_API !== 'true'

  if (!skipExternal) {
    try {
      const managementApiBaseUrl = getManagementApiBaseUrl()
      const businessHoursUrl = process.env.ANCHOR_API_KEY
        ? `${managementApiBaseUrl}/business/hours`
        : 'http://localhost:3000/api/business/hours'
      const businessHoursResponse = await fetch(
        businessHoursUrl,
        {
          headers: {
            'X-API-Key': process.env.ANCHOR_API_KEY || ''
          }
        }
      )
      
      if (businessHoursResponse.ok) {
        const hoursData = await businessHoursResponse.json()
        const businessHours = hoursData.data || hoursData
        const sundayStatus = businessHours.serviceStatus?.sunday_lunch

        if (sundayStatus) {
          sundayLunchEnabled = sundayStatus.isEnabled !== false
          sundayLunchMessage = sundayStatus.message || null
          sundayLunchUpdatedAt = sundayStatus.updatedAt
        } else {
          sundayLunchEnabled = true
          sundayLunchMessage = null
          sundayLunchUpdatedAt = undefined
        }

        if (Array.isArray(businessHours.serviceOverrides?.sunday_lunch)) {
          for (const override of businessHours.serviceOverrides.sunday_lunch) {
            sundayLunchOverrides.push({
              startDate: override.startDate,
              endDate: override.endDate,
              isEnabled: override.isEnabled,
              message: override.message ?? null,
            })
          }
        }
        
        // Process each date
        for (const dateStr of dates) {
          const date = new Date(dateStr + 'T12:00:00')
          const isSunday = date.getDay() === 0
          
          // Get effective hours for this date (handles special hours override)
          const effectiveHours = getEffectiveDayHours(
            dateStr,
            businessHours.regularHours,
            businessHours.specialHours
          )
          
          // Check if venue is closed
          const isClosed = isVenueClosed(effectiveHours)
          
          // Check if kitchen is closed using unified logic
          // Business rule: Monday kitchen is closed by default
          const dayOfWeek = date.getDay()
          const isMonday = dayOfWeek === 1
          
          // For Mondays, only consider kitchen open if special hours explicitly say so
          let kitchenClosed = isKitchenClosed(effectiveHours)
          if (isMonday && !businessHours.specialHours?.find((sh: any) => sh.date === dateStr)) {
            // It's a regular Monday (no special hours), so kitchen is closed
            kitchenClosed = true
          }
          
          // Check for special hours note
          let specialNote: string | undefined
          const special = businessHours.specialHours?.find((sh: any) => sh.date === dateStr)
          if (special) {
            specialNote = special.note || special.reason
          }
          
          // Generate time slots if venue is open
          const times: TimeSlot[] = []
          if (!isClosed && effectiveHours.opens && effectiveHours.closes) {
            const openTime = parseTime(effectiveHours.opens)
            const closeTime = parseTime(effectiveHours.closes)
            
            // Generate 30-minute slots
            let currentTime = openTime
            while (currentTime < (closeTime || 24)) {
              const hours = Math.floor(currentTime)
              const minutes = (currentTime % 1) * 60
              const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
              
              // Determine availability based on kitchen hours
              let available = true
              
              // If kitchen is explicitly closed, no times are available for food bookings
              if (kitchenClosed) {
                available = false
              } else if (effectiveHours.kitchen && typeof effectiveHours.kitchen === 'object' && 
                        'opens' in effectiveHours.kitchen && 'closes' in effectiveHours.kitchen) {
                // If kitchen has specific hours, check if current time is within them
                const kitchenOpen = parseTime(effectiveHours.kitchen.opens)
                const kitchenClose = parseTime(effectiveHours.kitchen.closes)
                available = currentTime >= kitchenOpen && currentTime < kitchenClose
              }
              // If kitchen is not closed and no specific hours, assume it follows venue hours
              
              times.push({
                time: timeStr,
                available,
                busy: false,
                remaining: available ? 10 : 0
              })
              
              currentTime += 0.5 // Add 30 minutes
            }
          }
          
          // Add to appropriate lists
          if (isClosed) {
            blockedDates.push(dateStr)
          }

          if (isSunday) {
            const override = sundayLunchOverrides.find(
              (entry) => entry.startDate <= dateStr && entry.endDate >= dateStr
            )
            const effectiveSundayLunchEnabled = override
              ? override.isEnabled !== false
              : sundayLunchEnabled

            if (!effectiveSundayLunchEnabled) {
              specialNote = override?.message || sundayLunchMessage || 'Sunday lunch bookings are currently unavailable.'
            } else if (!isClosed && !kitchenClosed) {
              // If a special hours record exists for this date, check that it includes
              // a sunday_lunch entry in schedule_config. An empty schedule_config means
              // the management app's "Sunday Lunch Closed" toggle is ON.
              const specialHoursRecord = (businessHours.specialHours || []).find(
                (sh: Record<string, unknown>) => sh.date === dateStr
              )
              const hasSpecialRecord = specialHoursRecord !== undefined
              const specialConfig = hasSpecialRecord && Array.isArray(specialHoursRecord.schedule_config)
                ? (specialHoursRecord.schedule_config as Array<Record<string, unknown>>)
                : null
              const hasSundayLunchEntry = specialConfig !== null
                ? specialConfig.some(
                    (entry) =>
                      typeof entry.booking_type === 'string' &&
                      entry.booking_type.trim().toLowerCase() === 'sunday_lunch'
                  )
                : true // No special record → fall back to regular hours (which may have sunday_lunch)

              if (hasSundayLunchEntry) {
                sundayRoastDates.push(dateStr)
              }
            }
          }
          
          days.push({
            date: dateStr,
            isClosed,
            isKitchenClosed: kitchenClosed,
            times,
            specialNote
          })
        }
      } else {
        populateFallbackAvailability()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn('Failed to fetch business hours for availability:', message)
      populateFallbackAvailability()
    }
  } else {
    populateFallbackAvailability()
  }
  
  const availabilityData: AvailabilityData = {
    days,
    blockedDates,
    sundayRoastDates,
    sundayLunchStatus: {
      isEnabled: sundayLunchEnabled,
      message: sundayLunchMessage ?? null,
      updatedAt: sundayLunchUpdatedAt,
    },
    sundayLunchOverrides: sundayLunchOverrides.map((override) => ({ ...override })),
  }
  
  // Update cache
  availabilityCache = {
    data: availabilityData,
    timestamp: Date.now()
  }
  
  return availabilityData
}

/**
 * Parse time string to decimal hours
 */
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours + minutes / 60
}

/**
 * Check if a date is available for booking
 */
export function isDateAvailable(date: string, availabilityData: AvailabilityData): boolean {
  return !availabilityData.blockedDates.includes(date)
}

/**
 * Get available times for a specific date
 */
export function getTimesForDate(date: string, availabilityData: AvailabilityData): TimeSlot[] {
  const dayData = availabilityData.days.find(d => d.date === date)
  return dayData?.times || []
}

/**
 * Check if a date is a Sunday with roast available
 */
export function isSundayRoastDate(date: string, availabilityData: AvailabilityData): boolean {
  return availabilityData.sundayRoastDates.includes(date)
}
