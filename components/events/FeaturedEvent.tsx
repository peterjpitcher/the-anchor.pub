import Image from 'next/image'
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
 * via the DEFAULT_EVENT_IMAGE fallback.
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

  return (
    <Card accent className={cn('overflow-hidden', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr]">
        {/* Poster: 16/10 full-width below lg, square 340px column at lg+ */}
        <div className="relative aspect-[16/10] lg:aspect-square lg:h-full">
          <Image
            src={getEventImage(event)}
            alt={event.image_alt_text || event.name}
            fill
            sizes="(max-width: 1024px) 100vw, 340px"
            className="object-cover"
          />
        </div>

        <CardBody className="flex flex-col gap-4">
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
          <h3 className="font-display text-h3 text-ink-strong">{event.name}</h3>

          {/* Short description (gold, 600) */}
          {event.shortDescription && (
            <p className="font-sans font-semibold text-accent-text">
              {event.shortDescription}
            </p>
          )}

          {/* Description */}
          {event.description && (
            <p className="text-ink-muted">{event.description}</p>
          )}

          {/* Meta row */}
          <div className="grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-3">
            <MetaCell label="Date" value={dateLabel} />
            <MetaCell label="Time" value={timeLabel} />
            {priceText && <MetaCell label="Price" value={priceText} />}
            {doorTime && <MetaCell label="Doors" value={doorTime} />}
          </div>

          {/* Actions */}
          <div className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
            <EventBookingButton
              event={event}
              size="lg"
              fullWidth={false}
              source="featured_event"
              className="whitespace-normal sm:w-auto"
            />
            <Button asChild variant="outline" size="lg">
              <a href={detailHref}>View details</a>
            </Button>
          </div>
        </CardBody>
      </div>
    </Card>
  )
}
