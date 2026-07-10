export function normaliseChristmasEnquiryTime(value?: string): string | undefined {
  if (!value) return undefined

  const trimmed = value.trim()
  if (!trimmed || /^flexible$/i.test(trimmed)) return undefined
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed)) return trimmed

  const twelveHourMatch = trimmed.match(/^(1[0-2]|0?[1-9]):([0-5]\d)\s*([ap]m)$/i)
  if (!twelveHourMatch) return undefined

  const [, hourText, minute, meridiem] = twelveHourMatch
  let hour = Number(hourText) % 12
  if (meridiem.toLowerCase() === 'pm') hour += 12
  return `${String(hour).padStart(2, '0')}:${minute}`
}
