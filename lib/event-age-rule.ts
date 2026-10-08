import type { Event } from '@/lib/api'

/**
 * The age rule the site states for a kind of night, whatever the record says.
 *
 * The event record has no age field. The tasting night page sold six alcoholic
 * tastings and never said who could come (site review finding C2-015), and the
 * owner confirmed on 7 October 2026 that a tasting night is for over 18s only
 * (docs/SSOT.md section 10, Tasting Nights). That is a rule about the format,
 * not about one date, so it is stated here for every night in the category and
 * does not wait for somebody to type it into each record.
 *
 * Only formats whose rule the SSOT states outright belong here. Cash bingo's
 * rule has two halves that must be published together and is carried by its own
 * page; every other night welcomes all ages with a supervising adult.
 */
export const TASTING_NIGHT_AGE_RULE = 'Over 18s only'

type AgeRuleSource = {
  category?: Pick<NonNullable<Event['category']>, 'slug' | 'name'> | null
}

export function getEventAgeRule(event: AgeRuleSource): string | null {
  const slug = event.category?.slug?.toLowerCase().trim() ?? ''
  const name = event.category?.name?.toLowerCase().trim() ?? ''
  if (/(^|-)tasting(-|$)/.test(slug) || /\btasting\b/.test(name)) return TASTING_NIGHT_AGE_RULE
  return null
}
