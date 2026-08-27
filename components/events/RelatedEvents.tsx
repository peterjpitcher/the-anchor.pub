import Image from 'next/image'
import { getEventSquareImage } from '@/lib/event-image'
import Link from 'next/link'
import { getUpcomingEventsByCategory, getUpcomingEvents, formatEventDate, formatEventTime, formatPrice, getLowestTicketTypePrice, hasMultipleTicketPrices } from '@/lib/api'
import { formatEventLocalDate } from '@/lib/event-calendar'
import { getEventWebsitePath } from '@/lib/event-url'
import type { Event } from '@/lib/api'
import { readableInkOn } from '@/lib/contrast'

/**
 * Stands in for the poster on events that have no artwork of their own.
 *
 * The tile grid stretches every card to the tallest, so simply omitting the
 * image left a short body floating in a card sized by its neighbour's poster.
 * This fills the same square with the date instead, which keeps the row even
 * without reintroducing a stock photo.
 */
function EventDatePanel({ startDate }: { startDate: string }) {
  const weekday = formatEventLocalDate(startDate, { weekday: 'long' })
  const day = formatEventLocalDate(startDate, { day: 'numeric' })
  const month = formatEventLocalDate(startDate, { month: 'long' })

  return (
    <div className="flex aspect-square w-full flex-col items-center justify-center gap-1 border-b border-line bg-surface-sunk px-4 text-center">
      <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-accent-text">
        {weekday}
      </span>
      <span className="font-display text-h2 leading-none text-ink-strong">{day}</span>
      <span className="font-sans text-sm font-medium uppercase tracking-[0.14em] text-ink-muted">
        {month}
      </span>
    </div>
  )
}

interface RelatedEventsProps {
  currentEventId: string
  categoryId?: string | null
  categoryName?: string | null
}

export default async function RelatedEvents({
  currentEventId,
  categoryId,
  categoryName,
}: RelatedEventsProps) {
  try {
    const MAX_RELATED = 3

    let related: Event[] = []

    // Step 1: fetch same-category events first
    if (categoryId) {
      const categoryEvents = await getUpcomingEventsByCategory(categoryId, MAX_RELATED + 1)
      related = categoryEvents.filter((e) => e.id !== currentEventId).slice(0, MAX_RELATED)
    }

    // Step 2: backfill from any upcoming events if we don't have 3 yet
    if (related.length < MAX_RELATED) {
      const needed = MAX_RELATED - related.length
      const allEvents = await getUpcomingEvents(MAX_RELATED + 10)
      const existingIds = new Set([currentEventId, ...related.map((e) => e.id)])
      const backfill = allEvents
        .filter((e) => !existingIds.has(e.id))
        .slice(0, needed)
      related = [...related, ...backfill]
    }

    if (related.length === 0) return null

    return (
      <section aria-labelledby="related-events-heading">
        <h2
          id="related-events-heading"
          className="font-display text-h3 text-ink-strong mb-6"
        >
          More Events
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {related.map((event) => {
            const href = getEventWebsitePath(event)
            // The slot below is aspect-square with object-cover, so it must be
            // given the square. A landscape here loses its edges.
            const imageSrc = getEventSquareImage(event)
            const altText =
              event.image_alt_text || `${event.name} at The Anchor`

            return (
              <Link
                key={event.id}
                href={href}
                className="group block overflow-hidden rounded-lg border border-line bg-surface shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-anchor-gold-dark"
              >
                {/* Poster, or the date panel when the event has no artwork.
                    Either way the square is filled, so cards in the same row
                    stay the same height. The category badge overlays both. */}
                <div className="relative aspect-square w-full overflow-hidden">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={altText}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <EventDatePanel startDate={event.startDate} />
                  )}
                  {event.category && (
                    <span
                      className="absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold rounded-full"
                      style={{
                        backgroundColor: event.category.color,
                        // Category colours come from the CMS, so white is not
                        // always readable on them. One purple measured 4.04:1.
                        color: readableInkOn(event.category.color),
                      }}
                    >
                      {event.category.name}
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4">
                  <p className="text-accent-text text-sm font-medium mb-1">
                    {formatEventDate(event.startDate)} · {formatEventTime(event.startDate)}
                  </p>
                  <h3 className="text-ink-strong font-semibold text-base leading-snug mb-2 group-hover:text-accent-text transition-colors line-clamp-2">
                    {event.name}
                  </h3>

                  {/* Price */}
                  {hasMultipleTicketPrices(event) ? (
                    <p className="text-accent-text text-sm font-semibold">
                      {(() => {
                        const lowest = getLowestTicketTypePrice(event)
                        if (lowest === null) return null
                        return lowest <= 0 ? 'Free entry' : `from ${formatPrice(lowest)}`
                      })()}
                    </p>
                  ) : event.offers ? (
                    <p className="text-accent-text text-sm font-semibold">
                      {event.offers.price === '0' || event.offers.price === '0.00'
                        ? 'Free entry'
                        : formatPrice(event.offers.price, event.offers.priceCurrency)}
                    </p>
                  ) : null}
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    )
  } catch {
    // API failure, fail silently so the main event page is unaffected
    return null
  }
}
