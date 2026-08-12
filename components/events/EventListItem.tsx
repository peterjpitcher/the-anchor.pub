import Image from 'next/image'
import Link from 'next/link'
import type { Event } from '@/lib/api'
import { isEventSoldOut } from '@/lib/api'
import { formatEventLocalDate, formatEventLocalTime } from '@/lib/event-calendar'
import { Card } from '@/components/ui/layout/Card'
import { Badge } from '@/components/ui/primitives/Badge'
import { EventBookingButton } from '@/components/EventBookingButton'
import { cn } from '@/lib/utils'
import {
  getEventDetailHref,
  getEventImage,
  getLowCapacityCount
} from './event-display'

export interface EventListItemProps {
  event: Event
  className?: string
}

/**
 * Compact event row in the upcoming list (spec §6.2): 120px square thumb (92px
 * below 640px), uppercase date line, name, short description, small booking
 * button. Logic (sold-out, capacity, label) is reused from the existing
 * helpers — nothing is duplicated here.
 */
export function EventListItem({ event, className }: EventListItemProps) {
  const soldOut = isEventSoldOut(event)
  const lowCapacity = soldOut ? null : getLowCapacityCount(event)
  const detailHref = getEventDetailHref(event)
  const imageSrc = getEventImage(event)
  const dateLine = `${formatEventLocalDate(event.startDate, {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })} · ${formatEventLocalTime(event.startDate)}`

  return (
    <Card hover accent className={cn('group relative h-full cursor-pointer', className)}>
      <Link
        href={detailHref}
        aria-label={`View ${event.name} details`}
        className="absolute inset-0 z-10 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-anchor-gold"
      />
      <div className="flex h-full gap-4 p-4">
        {/* Thumb: 92px below 640px, 120px from sm up. Dropped entirely when the
            event has no artwork, so the text simply fills the row. */}
        {imageSrc && (
          <div className="relative h-[92px] w-[92px] flex-shrink-0 overflow-hidden rounded-sm sm:h-[120px] sm:w-[120px]">
            <Image
              src={imageSrc}
              alt={event.image_alt_text || event.name}
              fill
              sizes="120px"
              className="object-cover"
            />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-accent-text">
              {dateLine}
            </span>
            {soldOut ? (
              <Badge variant="danger">Sold out</Badge>
            ) : lowCapacity !== null ? (
              <Badge variant="success" dot>
                {lowCapacity} {lowCapacity === 1 ? 'table' : 'tables'} left
              </Badge>
            ) : null}
          </div>

          <h3 className="font-display text-h4 text-ink-strong transition-colors group-hover:text-accent-text">
            {event.name}
          </h3>

          {event.shortDescription && (
            <p className="line-clamp-2 text-sm text-ink-muted">
              {event.shortDescription}
            </p>
          )}

          <div className="pointer-events-none relative z-20 mt-auto pt-1">
            <EventBookingButton
              event={event}
              size="sm"
              fullWidth={false}
              source="event_list_item"
              className="pointer-events-auto whitespace-normal max-[640px]:w-full"
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
