import {
  isBuildWithoutExternalApi,
  readEventCategories,
  readUpcomingEventsByCategories,
  type EventCategory,
  type EventsReadResult
} from '@/lib/api'
import { logError } from '@/lib/error-handling'
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
 * Upcoming events for a game night, ascending by start date, with the outcome
 * of the read attached.
 *
 * This used to return a bare `Event[]`, built from helpers that turned every
 * failure into `[]`: a failed category lookup, a category that could not be
 * found and a failed events call all arrived at the page as "no dates", and
 * the page then told the visitor the next night was not confirmed. That is a
 * public read path failing open, the same defect /whats-on had until it began
 * reading the outcome as well as the contents.
 *
 * `status` is `ok` only when every read answered, so an empty list is the
 * diary's own answer. `unavailable` means we could not look, and `partial`
 * (possible for karaoke, which reads two categories) means some dates may be
 * missing. Anything short of `ok` is logged here, once for all four pages,
 * because the visitor is not the only one who needs to know.
 *
 * Sorting and de-duplication by event id happen in
 * `readUpcomingEventsByCategories`, which matters whenever a config lists more
 * than one category: an event filed under both would otherwise appear twice.
 */
export async function readGameNightEvents(config: GameNightConfig): Promise<EventsReadResult> {
  const categoriesRead = await readEventCategories()

  // A category that cannot be found reports `unavailable` too, from
  // readUpcomingEventsByCategories: a renamed category would otherwise empty a
  // page silently, and that is a gap, not a verified empty diary.
  const read: EventsReadResult =
    categoriesRead.status === 'ok'
      ? await readUpcomingEventsByCategories(
          resolveCategoryIds(categoriesRead.categories, config),
          MAX_EVENTS,
          HORIZON_DAYS
        )
      : { status: 'unavailable', events: [], failure: categoriesRead.failure }

  if (read.status !== 'ok' && !isBuildWithoutExternalApi()) {
    // Counts and statuses only, never customer data.
    logError('game-night-events', new Error(`${config.slug} events read was ${read.status}`), {
      game: config.slug,
      status: read.status,
      failure: read.failure,
      eventsRendered: read.events.length
    })
  }

  return read
}
