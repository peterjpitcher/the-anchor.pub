import type { ReactNode } from 'react'
import type { Event } from '@/lib/api'
import { cn } from '@/lib/utils'
import { FeaturedEvent } from './FeaturedEvent'
import { EventListItem } from './EventListItem'

export interface UpcomingEventsProps {
  /** Already-fetched, ordered upcoming events (e.g. from `/api/events?limit=3`). */
  events: Event[]
  /** Rendered when there are no events to show. */
  emptyState?: ReactNode
  className?: string
}

/**
 * Design-system layout for the upcoming-events sections (spec §6.2):
 * the first event renders as the FeaturedEvent split card, the remainder as a
 * 2-column list (1-col below lg), with a --space-5 gap throughout.
 *
 * Presentational only — callers fetch via the existing `/api/events` proxy and
 * pass the events in. Booking labels and states come from the child components,
 * which in turn use the existing event helpers.
 */
export function UpcomingEvents({ events, emptyState, className }: UpcomingEventsProps) {
  if (!events || events.length === 0) {
    return emptyState ? <>{emptyState}</> : null
  }

  const [featured, ...rest] = events

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <FeaturedEvent event={featured} />

      {rest.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {rest.map((event) => (
            <EventListItem key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
