export const LONDON_TIME_ZONE = 'Europe/London' as const

export const SUNDAY_LUNCH_CUTOFF_HOUR = 13
export const SUNDAY_LUNCH_CUTOFF_MINUTE = 0
export const SUNDAY_LUNCH_CUTOFF_SECOND = 0

type LondonNowParts = {
  isoDate: string
  seconds: number
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function isSundayIsoDate(isoDate: string): boolean {
  if (!isIsoDate(isoDate)) return false
  const [year, month, day] = isoDate.split('-').map((part) => Number.parseInt(part, 10))
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return false
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay() === 0
}

function addDaysIsoDate(isoDate: string, days: number): string | null {
  if (!isIsoDate(isoDate)) return null
  const [year, month, day] = isoDate.split('-').map((part) => Number.parseInt(part, 10))
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null

  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function getSundayLunchCutoffDate(isoSundayDate: string): string | null {
  if (!isSundayIsoDate(isoSundayDate)) return null
  return addDaysIsoDate(isoSundayDate, -1)
}

function londonNowParts(base: Date = new Date()): LondonNowParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: LONDON_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    hourCycle: 'h23'
  })

  const parts = formatter.formatToParts(base)
  const map = Object.fromEntries(
    parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value])
  )

  const isoDate = `${map.year}-${map.month}-${map.day}`
  const hour = Number.parseInt(map.hour || '0', 10)
  const minute = Number.parseInt(map.minute || '0', 10)
  const second = Number.parseInt(map.second || '0', 10)

  return {
    isoDate,
    seconds: hour * 3600 + minute * 60 + second
  }
}

export function hasSundayLunchCutoffPassed(isoSundayDate: string, now: Date = new Date()): boolean {
  const cutoffDate = getSundayLunchCutoffDate(isoSundayDate)
  if (!cutoffDate) return false

  const nowLondon = londonNowParts(now)
  const cutoffSeconds =
    SUNDAY_LUNCH_CUTOFF_HOUR * 3600 +
    SUNDAY_LUNCH_CUTOFF_MINUTE * 60 +
    SUNDAY_LUNCH_CUTOFF_SECOND

  if (nowLondon.isoDate > cutoffDate) return true
  if (nowLondon.isoDate < cutoffDate) return false
  return nowLondon.seconds > cutoffSeconds
}

