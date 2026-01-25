'use client'

import { useBusinessHours } from '@/hooks/useBusinessHours'
import { formatTime12Hour } from '@/lib/time-utils'

/**
 * Returns kitchen hours as a string for use in static content
 * This is a client component that renders on mount
 */
export function KitchenHoursString() {
  const { hours } = useBusinessHours()
  
  if (!hours) {
    return "Tuesday to Friday from 6pm-9pm, Saturday from 1pm-7pm, and Sunday from 1pm-6pm"
  }
  
  // Build kitchen hours string from API data
  const schedule: string[] = []
  
  // Tuesday to Friday
  const weekdays = ['tuesday', 'wednesday', 'thursday', 'friday']
  const weekdayHours = weekdays.map(day => {
    const dayHours = hours.regularHours[day]
    if (!dayHours || !dayHours.kitchen) return null
    if ('is_closed' in dayHours.kitchen && dayHours.kitchen.is_closed === true) return null
    if (!('opens' in dayHours.kitchen) || !('closes' in dayHours.kitchen)) return null
    return {
      opens: formatTime12Hour(dayHours.kitchen.opens),
      closes: formatTime12Hour(dayHours.kitchen.closes)
    }
  }).filter(Boolean)
  
  // Check if all weekdays have same hours
  if (weekdayHours.length > 0 && weekdayHours.every(h => 
    h?.opens === weekdayHours[0]?.opens && h?.closes === weekdayHours[0]?.closes
  )) {
    schedule.push(`Tuesday to Friday from ${weekdayHours[0]?.opens}-${weekdayHours[0]?.closes}`)
  } else {
    // Add individually
    weekdays.forEach(day => {
      const dayHours = hours.regularHours[day]
      if (dayHours?.kitchen && 'opens' in dayHours.kitchen && 'closes' in dayHours.kitchen) {
        const opens = formatTime12Hour(dayHours.kitchen.opens)
        const closes = formatTime12Hour(dayHours.kitchen.closes)
        schedule.push(`${day.charAt(0).toUpperCase() + day.slice(1)} from ${opens}-${closes}`)
      }
    })
  }
  
  // Saturday
  const saturdayHours = hours.regularHours.saturday
  if (saturdayHours?.kitchen && 'opens' in saturdayHours.kitchen && 'closes' in saturdayHours.kitchen) {
    const opens = formatTime12Hour(saturdayHours.kitchen.opens)
    const closes = formatTime12Hour(saturdayHours.kitchen.closes)
    schedule.push(`Saturday from ${opens}-${closes}`)
  }
  
  // Sunday
  const sundayHours = hours.regularHours.sunday
  if (sundayHours?.kitchen && 'opens' in sundayHours.kitchen && 'closes' in sundayHours.kitchen) {
    const opens = formatTime12Hour(sundayHours.kitchen.opens)
    const closes = formatTime12Hour(sundayHours.kitchen.closes)
    schedule.push(`Sunday from ${opens}-${closes}`)
  }
  
  return schedule.join(', ')
}
