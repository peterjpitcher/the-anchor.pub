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

/** Today's calendar date in London, as YYYY-MM-DD. */
export function londonIsoDate(base: Date = new Date()): string {
  const { year, month, day } = nowInLondonComponents(base)
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

type LondonWallClock = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

const LONDON_WALL_CLOCK = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  // h23, not `hour12: false`: some ICU builds resolve the latter to h24, where
  // midnight formats as "24".
  hourCycle: 'h23'
})

/** The London wall clock at an instant. */
export function londonWallClock(instant: Date): LondonWallClock {
  const parts = LONDON_WALL_CLOCK.formatToParts(instant)
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? Number.NaN)
  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour') % 24,
    minute: read('minute')
  }
}

const pad2 = (value: number) => String(value).padStart(2, '0')

/**
 * An instant as the value of an `<input type="datetime-local">`, on the London
 * clock: "2026-11-10T10:00".
 *
 * Date#getHours and its siblings read the clock of the device showing the page.
 * The pub's car park runs on UK time, so the boxes are filled in UK time
 * whatever the device is set to.
 */
export function toLondonDateTimeLocal(instant: Date): string {
  const { year, month, day, hour, minute } = londonWallClock(instant)
  return `${String(year).padStart(4, '0')}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}`
}

/**
 * A date and time typed on the London clock ("2026-11-10T10:00"), as an instant.
 *
 * `new Date('2026-11-10T10:00')` reads the string on the DEVICE's clock, so a
 * phone set to New York time turned a 10am arrival into 3pm in London, and the
 * guest only found out on the confirmation page, after paying.
 *
 * The two clock-change edges are settled the way a guest would expect:
 *  - the hour that happens twice when the clocks go back (01:00 to 01:59 on the
 *    last Sunday of October) is read as the FIRST one, still on summer time;
 *  - the hour that never happens when they go forward (01:00 to 01:59 on the
 *    last Sunday of March) is read as the same time an hour later, as a phone's
 *    own clock would show it.
 *
 * Returns null for anything that is not a real date and time.
 */
export function londonWallClockToInstant(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(String(value).trim())
  if (!match) return null

  const [year, month, day, hour, minute] = match.slice(1, 6).map(Number)
  const second = match[6] ? Number(match[6]) : 0
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) {
    return null
  }

  // The typed time read as if London were on UTC. London is never behind UTC and
  // never more than an hour ahead, so the real instant is this or an hour before.
  const asUtc = Date.UTC(year, month - 1, day, hour, minute, second)
  const typed = new Date(asUtc)
  if (typed.getUTCMonth() !== month - 1 || typed.getUTCDate() !== day) return null

  const matches = (candidate: number) => {
    const clock = londonWallClock(new Date(candidate))
    return (
      clock.year === year &&
      clock.month === month &&
      clock.day === day &&
      clock.hour === hour &&
      clock.minute === minute
    )
  }

  const HOUR_MS = 60 * 60 * 1000
  // Summer time first, so the repeated hour in October resolves to its first pass.
  if (matches(asUtc - HOUR_MS)) return new Date(asUtc - HOUR_MS)
  if (matches(asUtc)) return new Date(asUtc)
  // The missing hour in March: no instant shows this time on a London clock.
  return new Date(asUtc)
}

/**
 * An instant as "10 Nov 2026, 10:00" on the London clock, for a summary line.
 */
export function formatLondonDateTime(instant: Date): string {
  return instant.toLocaleString('en-GB', {
    timeZone: 'Europe/London',
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

/**
 * A YYYY-MM-DD calendar date as a Date pinned to 00:00 UTC on that date.
 *
 * It is a calendar-date anchor, NOT midnight in London: during British Summer
 * Time London's midnight is 23:00 UTC the day before. Use it to compare or
 * format whole dates (always with `timeZone: 'UTC'` or the helpers in this
 * file). For a real London time of day, use `londonWallClockToInstant`.
 */
export function parseLondonDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
}

/**
 * Format a fixed YYYY-MM-DD calendar date as "12 September 2026", in London.
 *
 * For dates held in code, such as a "Last updated" line. It takes no clock, so
 * the result cannot drift with the day the page happens to be rendered.
 *
 * Throws on anything that is not a real calendar date. A typo in a
 * hand-maintained date then fails the test and the build, rather than printing
 * "Invalid Date" or quietly rolling 30 February into March.
 */
export function formatLondonLongDate(dateStr: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  const date = parseLondonDate(dateStr)

  // Date.UTC rolls an impossible day forward (30 February becomes 2 March), so
  // the parsed date has to read back as the same year, month and day.
  const isRealDate =
    match !== null &&
    date.getUTCFullYear() === Number(match[1]) &&
    date.getUTCMonth() + 1 === Number(match[2]) &&
    date.getUTCDate() === Number(match[3])

  if (!isRealDate) {
    throw new Error(`formatLondonLongDate: "${dateStr}" is not a real YYYY-MM-DD date`)
  }

  return date.toLocaleDateString('en-GB', {
    timeZone: 'Europe/London',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}