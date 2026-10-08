/**
 * The words in front of a night's arrival time.
 *
 * Every night is "Arrive from 6:30pm" except cash bingo, which is "Arrive by
 * 6:30pm": the owner wants people in by then so there is time to get a drink,
 * order food and buy books before the first game at 7pm (docs/SSOT.md section
 * 10, Cash Bingo, owner-confirmed 17 August 2026). The /cash-bingo page already
 * said "by" while each cash bingo night's own page said "from" (site review
 * finding C2-027).
 *
 * It is a rule about the format, so it is read from the category and does not
 * wait for somebody to type it into each record. The management app calls the
 * category "Bingo Night"; Music Bingo is a different category and stays "from".
 */
export type EventArrivalLabel = 'Arrive from' | 'Arrive by'

type ArrivalLabelSource = {
  name?: string | null
  category?: { slug?: string | null; name?: string | null } | null
}

function isCashBingo(event: ArrivalLabelSource): boolean {
  const slug = event.category?.slug?.toLowerCase().trim() ?? ''
  const category = event.category?.name?.toLowerCase().trim() ?? ''
  const name = event.name?.toLowerCase() ?? ''

  if (/\bmusic\b/.test(category) || slug.includes('music')) return false
  return slug === 'bingo-night' || category === 'bingo night' || /\bcash bingo\b/.test(`${category} ${name}`)
}

export function getEventArrivalLabel(event: ArrivalLabelSource): EventArrivalLabel {
  return isCashBingo(event) ? 'Arrive by' : 'Arrive from'
}
