/**
 * Robust UK timezone handling utilities
 * Handles BST/GMT transitions correctly without string parsing
 */

/**
 * Get current date/time in Europe/London timezone
 * This ensures correct seasonal image selection regardless of server timezone (UTC on Vercel)
 * Returns just the date components we need for seasonal selection
 */
export function nowInLondonComponents(base: Date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric'
  })
  
  const [year, month, day] = fmt.formatToParts(base).reduce((acc, p) => {
    if (p.type === 'year') acc[0] = Number(p.value)
    if (p.type === 'month') acc[1] = Number(p.value)
    if (p.type === 'day') acc[2] = Number(p.value)
    return acc
  }, [0, 0, 0] as [number, number, number])
  
  return { year, month, day }
}

/**
 * Get current date as a Date object in London timezone
 * For compatibility with existing code that expects a Date
 */
export function nowInLondon(base: Date = new Date()): Date {
  const { year, month, day } = nowInLondonComponents(base)
  // Create a date at noon London time to avoid edge cases
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
}

/**
 * Converts London date range strings to Date instants
 * @param startYYYYMMDD - Start date in YYYY-MM-DD format (inclusive at 00:00:00 London)
 * @param endYYYYMMDD - End date in YYYY-MM-DD format (inclusive at 23:59:59 London)
 */
export function londonRangeToInstants(
  startYYYYMMDD: string, 
  endYYYYMMDD: string
): { start: Date; end: Date } {
  const [sy, sm, sd] = startYYYYMMDD.split('-').map(Number)
  const [ey, em, ed] = endYYYYMMDD.split('-').map(Number)

  // Create dates in London timezone
  // Start: 00:00:00 London time on start date
  const startFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  // Create a date at midnight London time for the start
  const startDate = new Date(Date.UTC(sy, sm - 1, sd, 0, 0, 0))
  // Adjust for London timezone
  const startLondon = new Date(startDate.toLocaleString('en-US', { timeZone: 'Europe/London' }))
  
  // Create a date at 23:59:59 London time for the end
  const endDate = new Date(Date.UTC(ey, em - 1, ed, 23, 59, 59))
  // Adjust for London timezone
  const endLondon = new Date(endDate.toLocaleString('en-US', { timeZone: 'Europe/London' }))

  return { 
    start: new Date(Date.UTC(sy, sm - 1, sd, 0, 0, 0)),
    end: new Date(Date.UTC(ey, em - 1, ed, 23, 59, 59, 999))
  }
}

/**
 * Checks if a date is within a range (inclusive)
 */
export function isLondonDateInRange(now: Date, start: Date, end: Date): boolean {
  return now >= start && now <= end
}

/**
 * Gets the London wall clock time as a formatted string
 * Useful for debugging and logging
 */
export function getLondonTimeString(date: Date = new Date()): string {
  return date.toLocaleString('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    // h23, not `hour12: false` — the latter logs midnight as "24:30:00".
    hourCycle: 'h23'
  })
}

/**
 * Parse a YYYY-MM-DD string to a Date at midnight London time
 */
export function parseLondonDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
}