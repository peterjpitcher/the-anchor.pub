/**
 * Dates that move every year but are fully computable.
 *
 * These exist so annually-recurring things stop being typed as literals. A
 * literal is a silent time bomb: it works this year, then the feature quietly
 * disappears on 1 January and stays gone until somebody notices and edits code.
 * The header promo links were exactly that, hardcoded to 2026.
 *
 * Everything here is pure and returns an ISO `YYYY-MM-DD` string, which is what
 * `parseLondonDate` in lib/time-london.ts expects.
 */

const iso = (year: number, month: number, day: number): string =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

/**
 * Easter Sunday in the Gregorian calendar, by the Anonymous Gregorian computus
 * (Meeus/Jones/Butcher). Valid for any year from 1583.
 *
 * Easter is the anchor for the other movable feasts below, which is why it is
 * computed rather than tabulated.
 */
export function getEasterSunday(year: number): string {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return iso(year, month, day)
}

/**
 * Mothering Sunday, the UK Mother's Day. The fourth Sunday of Lent, which is
 * exactly three weeks before Easter Sunday.
 *
 * Deliberately not the US Mother's Day (second Sunday of May), which is a
 * different date and not the one our customers mean.
 */
export function getMotheringSunday(year: number): string {
  const easter = new Date(`${getEasterSunday(year)}T00:00:00Z`)
  easter.setUTCDate(easter.getUTCDate() - 21)
  return easter.toISOString().slice(0, 10)
}

/** Valentine's Day. Fixed, but computed here so every occasion lives in one place. */
export function getValentinesDay(year: number): string {
  return iso(year, 2, 14)
}

/** Father's Day in the UK: the third Sunday of June. */
export function getFathersDay(year: number): string {
  const june1 = new Date(Date.UTC(year, 5, 1))
  // 0 = Sunday. Days to the first Sunday, then two more weeks.
  const daysToFirstSunday = (7 - june1.getUTCDay()) % 7
  return iso(year, 6, 1 + daysToFirstSunday + 14)
}
