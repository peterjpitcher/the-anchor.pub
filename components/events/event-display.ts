// Shared presentational helpers for the design-system event components
// (FeaturedEvent, EventListItem, UpcomingEvents).
//
// These are display-only derivations. All booking labels, sold-out / capacity
// logic and image fallbacks come from the existing domain helpers — this file
// never duplicates or paraphrases those. (spec §6.2)

import type { CSSProperties } from 'react'
import type { Event } from '@/lib/api'
import { getEventRemainingCapacity, isEventFree } from '@/lib/api'
import { getEventLocalIsoDate } from '@/lib/event-calendar'
import { nowInLondonComponents } from '@/lib/time-london'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getEventPriceLabel } from '@/lib/event-pricing'

/** Capacity threshold below which a "n tables left" badge is shown (spec §6.2). */
export const LOW_CAPACITY_THRESHOLD = 12

/**
 * Relative day label for the badge row: "Today", "Tomorrow", or the weekday
 * (e.g. "Saturday"). Computed in Europe/London so the boundary matches the
 * pub's day, not the server's UTC day.
 */
export function getRelativeDayLabel(startDate: string): string {
  const eventIso = getEventLocalIsoDate(startDate)
  if (!eventIso) return 'Date TBC'

  const { year, month, day } = nowInLondonComponents()
  const todayMs = Date.UTC(year, month - 1, day)

  const [ey, em, ed] = eventIso.split('-').map(Number)
  if (!ey || !em || !ed) return 'Date TBC'
  const eventMs = Date.UTC(ey, em - 1, ed)

  const dayDiff = Math.round((eventMs - todayMs) / 86_400_000)
  if (dayDiff <= 0) return 'Today'
  if (dayDiff === 1) return 'Tomorrow'

  return new Date(Date.UTC(ey, em - 1, ed, 12)).toLocaleDateString('en-GB', {
    weekday: 'long',
    timeZone: 'UTC'
  })
}

/**
 * Price display text. "Free entry" when the event is free (per the existing
 * isEventFree helper), otherwise the formatted offer price. Returns null when
 * no price information is available.
 */
export function getEventPriceText(event: Event): string | null {
  if (isEventFree(event)) return 'Free entry'

  return getEventPriceLabel(event)
}

/**
 * Number of remaining tables/places when the event is running low (below the
 * threshold and above zero). Returns null when capacity is unknown or the
 * event is full / not low.
 */
export function getLowCapacityCount(event: Event): number | null {
  // Read via the shared resolver, not event.remainingAttendeeCapacity alone:
  // the management API's list response carries the count under snake_case
  // names, so a single-spelling read silently returns null for every event.
  const remaining = getEventRemainingCapacity(event)
  if (remaining === null) return null
  if (remaining <= 0 || remaining >= LOW_CAPACITY_THRESHOLD) return null
  return remaining
}

/**
 * Tinted category chip styling: `{category.color}1f` background (≈12% alpha)
 * with the category colour as the text colour. Returns null when the event has
 * no category. (spec §6.2)
 */
export function getCategoryChipStyle(event: Event): CSSProperties | null {
  const colour = event.category?.color
  if (!colour) return null
  return {
    backgroundColor: `${colour}1f`,
    color: colour
  }
}

/** Poster/thumbnail source with the canonical event fallback (spec §6.2). */
export function getEventImage(event: Event): string {
  const candidate =
    event.image?.find((src) => typeof src === 'string' && src.trim().length > 0) ||
    event.posterImageUrl ||
    event.heroImageUrl ||
    event.thumbnailImageUrl
  return candidate && candidate.trim().length > 0 ? candidate : DEFAULT_EVENT_IMAGE
}

/** Internal event detail page path. */
export function getEventDetailHref(event: Event): string {
  return `/events/${event.slug || event.id}`
}
