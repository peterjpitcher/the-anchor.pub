import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge, Card, CardBody } from '@/components/ui'
import { EventBookingButton } from '@/components/EventBookingButton'
import { getEventWebsiteUrl } from '@/lib/event-url'
import { formatDoorClockTime, formatEventDate, formatEventTime, type Event } from '@/lib/api'

// Shared "upcoming dates" list used by the event category pages (/music-bingo,
// /cash-bingo, /quiz-night, /karaoke). These four pages each carried their own
// copy of this markup, so a layout fix had to be made four times and drifted
// between them. Anything genuinely per-page (eyebrow, meta lines, body copy)
// comes in as a prop or render function.

export interface EventDateCardsProps {
  events: Event[]
  /** Small uppercase label above the event name, e.g. "Music bingo night". */
  eyebrow: string
  /** GTM source passed to the booking button. */
  bookingSource: string
  /** Appended to the image alt text after the event name. */
  imageAltSuffix: string
  /** Right-hand meta block under the start time. `doorTime` is a bare clock time. */
  renderMeta: (event: Event, doorTime: string | null) => ReactNode
  /** Extra body content shown under the event description. */
  renderDetails?: (event: Event) => ReactNode
  /** Shown in place of the list when there are no upcoming events. */
  emptyState: ReactNode
}

const TENTATIVE_AFTER_DAYS = 30

function isTentativeEvent(event: Event): boolean {
  const status = (event.eventStatus || '').toLowerCase()
  if (status.includes('draft')) return true
  if (status.includes('scheduled')) return false

  const horizon = Date.now() + TENTATIVE_AFTER_DAYS * 24 * 60 * 60 * 1000
  return new Date(event.startDate).getTime() > horizon
}

export function EventDateCards({
  events,
  eyebrow,
  bookingSource,
  imageAltSuffix,
  renderMeta,
  renderDetails,
  emptyState
}: EventDateCardsProps) {
  if (!events.length) {
    return (
      <Card accent>
        <CardBody className="text-center">{emptyState}</CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {events.map((event, index) => {
        const doorTime = formatDoorClockTime(event.doorTime)
        const eventUrl = getEventWebsiteUrl(event)
        const imageSrc = event.heroImageUrl || event.image?.[0] || null

        return (
          <Card key={event.id} hover accent className="overflow-hidden">
            {/* Stacks on phones. The meta block keeps its own alignment per
                breakpoint: right-aligning it while it sits on its own full-width
                row left it floating in the middle of the card. */}
            <div className="flex flex-col gap-2 border-b border-line bg-surface-sunk px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-xs uppercase tracking-wide text-ink-muted">{eyebrow}</p>
                  {isTentativeEvent(event) && <Badge variant="outline">Tentative</Badge>}
                </div>
                <Link href={eventUrl} className="block text-xl font-semibold text-ink-strong transition hover:text-accent-text">
                  {event.name}
                </Link>
                <p className="text-sm text-ink-muted line-clamp-1">{formatEventDate(event.startDate)}</p>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <p className="text-lg font-semibold text-ink-strong">{formatEventTime(event.startDate)}</p>
                {renderMeta(event, doorTime)}
              </div>
            </div>

            {/* Top-aligned, not centred: booking labels vary per event ("Book
                seated or standing tickets" vs "Reserve a table, pay quiz entry on
                arrival"), so a centred button starts higher when its label wraps
                to an extra line and the column of CTAs reads as ragged. */}
            <CardBody className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
              {imageSrc && (
                // lg:basis-48 is doing the real work, not lg:w-48. An aspect-ratio
                // box inside a flex item sizes itself from the item's main size, so
                // with the default `flex-basis: auto` the poster resolved to a
                // content-based width of ~650px, squeezed the copy to nothing and
                // pushed the booking button out of line with the other cards.
                // A definite basis breaks that cycle.
                <Link href={eventUrl} className="mx-auto w-full max-w-[16rem] lg:mx-0 lg:w-48 lg:max-w-none lg:shrink-0 lg:grow-0 lg:basis-48">
                  <div className="relative aspect-square overflow-hidden rounded-xl shadow-sm">
                    <Image
                      src={imageSrc}
                      alt={`${event.name} ${imageAltSuffix}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1023px) 256px, 192px"
                      loading={index < 2 ? 'eager' : 'lazy'}
                    />
                  </div>
                </Link>
              )}

              <div className="min-w-0 flex-1 space-y-4">
                {event.description && <p className="leading-relaxed text-ink-muted">{event.description}</p>}
                {renderDetails?.(event)}
              </div>

              {/* 18rem, not 16rem: at 16rem the longest booking label needed a
                  third line, making that one button 88px tall against everyone
                  else's 60px. */}
              <div className="w-full space-y-3 lg:w-72 lg:shrink-0 lg:grow-0 lg:basis-72">
                <EventBookingButton event={event} className="w-full" source={bookingSource} />
              </div>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}
