import Image from 'next/image'
import Link from 'next/link'
import {
  CalendarDays,
  Clock,
  DoorOpen,
  HelpCircle,
  Mic,
  Music,
  PartyPopper,
  Sparkles,
  Ticket,
  type LucideIcon
} from 'lucide-react'
import type { Event } from '@/lib/api'
import { isEventSoldOut } from '@/lib/api'
import { formatEventLocalDate, formatEventLocalTime } from '@/lib/event-calendar'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Badge } from '@/components/ui/primitives/Badge'
import { Button } from '@/components/ui/primitives/Button'
import { EventBookingButton } from '@/components/EventBookingButton'
import { cn } from '@/lib/utils'
import {
  getCategoryChipStyle,
  getEventDetailHref,
  getEventImage,
  getEventPriceText,
  getLowCapacityCount,
  getRelativeDayLabel
} from './event-display'

// Lucide icon by category slug — a small, static map (no dynamic class names).
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'quiz-nights': HelpCircle,
  quiz: HelpCircle,
  'live-music': Music,
  music: Music,
  'music-bingo': Music,
  karaoke: Mic,
  'drag-shows': Sparkles,
  'hosted-nights': Sparkles
}

function getCategoryIcon(event: Event): LucideIcon {
  const slug = event.category?.slug?.toLowerCase().trim()
  if (slug && CATEGORY_ICONS[slug]) return CATEGORY_ICONS[slug]
  return PartyPopper
}

interface MetaCellProps {
  label: string
  value: string
}

function MetaCell({ label, value }: MetaCellProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
        {label}
      </span>
      <span className="font-display text-base text-ink-strong">{value}</span>
    </div>
  )
}

export interface FeaturedEventProps {
  event: Event
  className?: string
}

/**
 * The headline upcoming event (spec §6.2). Restyle over the existing event
 * logic: labels come from EventBookingButton/getEventBookingCopy, sold-out and
 * low-capacity badges from isEventSoldOut / remainingAttendeeCapacity, image
 * via getEventImage, which yields null when the event has no artwork.
 */
export function FeaturedEvent({ event, className }: FeaturedEventProps) {
  const CategoryIcon = getCategoryIcon(event)
  const chipStyle = getCategoryChipStyle(event)
  const soldOut = isEventSoldOut(event)
  const lowCapacity = soldOut ? null : getLowCapacityCount(event)
  const priceText = getEventPriceText(event)
  const doorTime = event.doorTime ? formatEventLocalTime(event.doorTime) : null
  const detailHref = getEventDetailHref(event)
  const dateLabel = formatEventLocalDate(event.startDate, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
  const timeLabel = formatEventLocalTime(event.startDate)
  const imageSrc = getEventImage(event)

  return (
    <Card hover accent className={cn('group relative cursor-pointer overflow-hidden', className)}>
      <Link
        href={detailHref}
        aria-label={`View ${event.name} details`}
        className="absolute inset-0 z-10 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-anchor-gold"
      />
      {/* Without artwork the poster track is dropped, not left empty, so the
          body spans the full card rather than sitting in a 1fr column beside a
          340px gap. */}
      <div className={cn('grid grid-cols-1', imageSrc && 'lg:grid-cols-[340px_1fr]')}>
        {/* Poster: event artwork is always 1:1, so keep it square and uncropped
            at every breakpoint (full-width below lg, 340px in its column at
            lg+). self-center is load-bearing: without it the grid's default
            vertical stretch overrides the ratio, stretching the box to the row
            height and computing width from it, which crops the art and
            overflows the 340px track into the card body. */}
        {imageSrc && (
          <div className="relative aspect-square lg:self-center">
            <Image
              src={imageSrc}
              alt={event.image_alt_text || event.name}
              fill
              sizes="(max-width: 1024px) 100vw, 340px"
              className="object-cover"
            />
          </div>
        )}

        <CardBody className="flex flex-col gap-4 lg:gap-3">
          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="gold" dot>
              {getRelativeDayLabel(event.startDate)}
            </Badge>
            {event.category && (
              <span
                className="inline-flex items-center gap-1.5 rounded-pill px-[0.85em] py-[0.4em] font-sans text-xs font-semibold leading-none"
                style={chipStyle ?? undefined}
              >
                <CategoryIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {event.category.name}
              </span>
            )}
            {soldOut ? (
              <Badge variant="danger">Sold out</Badge>
            ) : lowCapacity !== null ? (
              <Badge variant="success" dot>
                {lowCapacity} {lowCapacity === 1 ? 'table' : 'tables'} left
              </Badge>
            ) : null}
          </div>

          {/* Name */}
          <h3 className="font-display text-h3 text-ink-strong transition-colors group-hover:text-accent-text">
            {event.name}
          </h3>

          {/* Short description (gold, 600) */}
          {event.shortDescription && (
            <p className="font-sans font-semibold text-accent-text">
              {event.shortDescription}
            </p>
          )}

          {/* Description: clamped at lg+ so long copy can't push the card
              taller than the square poster (full text lives on the detail
              page). */}
          {event.description && (
            <p className="text-ink-muted lg:line-clamp-3">{event.description}</p>
          )}

          {/* Meta row */}
          <div className="grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-3">
            <MetaCell label="Date" value={dateLabel} />
            <MetaCell label="Time" value={timeLabel} />
            {priceText && <MetaCell label="Price" value={priceText} />}
            {/* "Arrive from", never "Doors": the pub opens hours before any event
                starts, and a "Doors 6:30pm" label tells a customer it is shut
                until then. docs/SSOT.md §10 bans the wording. */}
            {doorTime && <MetaCell label="Arrive from" value={doorTime} />}
          </div>

          {/* Actions: md buttons so both fit one row at lg+, keeping the
              content column no taller than the 340px square poster. */}
          <div className="pointer-events-none relative z-20 mt-auto flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
            <EventBookingButton
              event={event}
              size="md"
              fullWidth={false}
              source="featured_event"
              className="pointer-events-auto whitespace-normal sm:w-auto"
            />
            <Button asChild variant="outline" size="md">
              <Link href={detailHref} className="pointer-events-auto">View details</Link>
            </Button>
          </div>
        </CardBody>
      </div>
    </Card>
  )
}
