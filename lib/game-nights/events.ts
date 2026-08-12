import {
  getEventCategories,
  getUpcomingEventsByCategory,
  type Event,
  type EventCategory
} from '@/lib/api'
import type { GameNightConfig } from './types'

/** How far ahead to list, and how many dates to take. */
const MAX_EVENTS = 60
const HORIZON_DAYS = 365

const normalise = (value?: string | null) =>
  value?.toLowerCase().replace(/\s+/g, ' ').trim() ?? ''

function resolveCategoryIds(categories: EventCategory[], config: GameNightConfig): string[] {
  return config.categories
    .map((label) => {
      const targetName = normalise(label.name)
      const targetSlug = normalise(label.slug)

      return categories.find(
        (category) =>
          normalise(category.name) === targetName || normalise(category.slug) === targetSlug
      )?.id
    })
    .filter((id): id is string => Boolean(id))
}

/**
 * Upcoming events for a game night, ascending by start date.
 *
 * All four game pages had their own copy of this lookup, and karaoke's copy had
 * grown a second, multi-category version to catch a legacy category. Keeping four
 * copies meant the horizon, the sort and the de-duplication could drift apart
 * silently, and only karaoke's copy handled more than one category.
 *
 * De-duplicates by event id, which matters whenever a config lists more than one
 * category: an event filed under both would otherwise appear twice.
 */
export async function getGameNightEvents(config: GameNightConfig): Promise<Event[]> {
  const categories = await getEventCategories()
  const categoryIds = resolveCategoryIds(categories, config)
  if (!categoryIds.length) return []

  const eventSets = await Promise.all(
    categoryIds.map((categoryId) =>
      getUpcomingEventsByCategory(categoryId, MAX_EVENTS, HORIZON_DAYS)
    )
  )

  const unique = Array.from(
    new Map(eventSets.flat().map((event) => [event.id, event])).values()
  )

  return unique.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  )
}
