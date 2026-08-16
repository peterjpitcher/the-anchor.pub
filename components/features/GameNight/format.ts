import type { GameNightConfig } from '@/lib/game-nights'
import type { Event } from '@/lib/api'
import { formatEventLocalDate } from '@/lib/event-calendar'

/**
 * Short date for CTA labels and date pills, e.g. "Wed, 19 Aug".
 *
 * Goes through formatEventLocalDate rather than the Date constructor so the day
 * is the Europe/London day. A UTC server formatting a 7pm event would otherwise
 * be one date out for part of the year.
 */
export function gameNightShortDate(startDate: string): string {
  return formatEventLocalDate(startDate, {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

/**
 * The primary CTA label, with the next confirmed date in it.
 *
 * A dated CTA ("Book your table for Wed, 19 Aug") outperforms a generic one
 * ("Book a table") because it answers "when" at the same time as "what", and it
 * proves the night is actually running. Falls back to the config's undated label
 * when nothing is bookable, where the page offers a phone call instead.
 */
export function buildGameNightCtaLabel(
  config: GameNightConfig,
  nextEvent: Event | null | undefined
): string {
  if (!nextEvent) return config.bookingCtaFallback
  return `${config.bookingCtaPrefix} ${gameNightShortDate(nextEvent.startDate)}`
}
