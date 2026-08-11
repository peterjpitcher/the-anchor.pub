import Image from 'next/image'
import Link from 'next/link'
import { getUpcomingEventsByCategory, getUpcomingEvents, formatEventDate, formatEventTime, formatPrice, getLowestTicketTypePrice, hasMultipleTicketPrices } from '@/lib/api'
import { getEventWebsitePath } from '@/lib/event-url'
import type { Event } from '@/lib/api'

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
            const imageSrc =
              (event.image && event.image[0]) ||
              event.heroImageUrl ||
              event.thumbnailImageUrl ||
              null
            const altText =
              event.image_alt_text || `${event.name} at The Anchor`

            return (
              <Link
                key={event.id}
                href={href}
                className="group block overflow-hidden rounded-lg border border-line bg-surface shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-anchor-gold-dark"
              >
                {/* Thumbnail with category badge overlay. Artwork-less events
                    drop the whole block rather than show a stock photo, so the
                    badge moves inline into the body below. */}
                {imageSrc && (
                  <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                      src={imageSrc}
                      alt={altText}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {event.category && (
                      <span
                        className="absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: `${event.category.color}cc`,
                          color: '#ffffff',
                        }}
                      >
                        {event.category.name}
                      </span>
                    )}
                  </div>
                )}

                {/* Card body */}
                <div className="p-4">
                  {!imageSrc && event.category && (
                    <span
                      className="mb-2 inline-block px-2 py-0.5 text-xs font-semibold rounded-full"
                      style={{
                        backgroundColor: `${event.category.color}cc`,
                        color: '#ffffff',
                      }}
                    >
                      {event.category.name}
                    </span>
                  )}
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
