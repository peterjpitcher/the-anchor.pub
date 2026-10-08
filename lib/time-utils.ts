/**
 * Time utilities for handling API time formats
 */

/**
 * Parse time string from API format (HH:mm:ss) to hour and minute numbers
 * @param timeString - Time in format "HH:mm:ss" or "HH:mm"
 * @returns Object with hour and minute as numbers
 */
export function parseApiTime(timeString: string): { hour: number; minute: number } {
  const parts = timeString.split(':')
  return {
    hour: parseInt(parts[0], 10),
    minute: parseInt(parts[1], 10)
  }
}

/**
 * Format time in 12-hour format
 * @param timeString - Time in format "HH:mm:ss" or "HH:mm"
 * @returns Time in format "h:mma" or "ha" (e.g., "2:30pm" or "2pm")
 */
export function formatTime12Hour(timeString: string): string {
  const { hour, minute } = parseApiTime(timeString)
  const period = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour % 12 || 12
  
  if (minute === 0) {
    return `${displayHour}${period}`
  }
  return `${displayHour}:${minute.toString().padStart(2, '0')}${period}`
}
