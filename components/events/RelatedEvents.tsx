import Image from 'next/image'
import Link from 'next/link'
import { getUpcomingEventsByCategory, getUpcomingEvents, formatEventDate, formatEventTime, formatPrice } from '@/lib/api'
import { getEventWebsitePath } from '@/lib/event-url'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
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
          className="text-2xl font-bold text-anchor-gold mb-6"
        >
          {categoryName ? `More ${categoryName} Events` : 'More Upcoming Events'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {related.map((event) => {
            const href = getEventWebsitePath(event)
            const imageSrc =
              (event.image && event.image[0]) ||
              event.heroImageUrl ||
              event.thumbnailImageUrl ||
              DEFAULT_EVENT_IMAGE
            const altText =
              event.image_alt_text || `${event.name} at The Anchor`

            return (
              <Link
                key={event.id}
                href={href}
                className="group block rounded-lg overflow-hidden bg-anchor-green-dark hover:bg-anchor-green transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-anchor-gold"
              >
                {/* Thumbnail with category badge overlay */}
                <div className="relative aspect-[16/9] w-full overflow-hidden">
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

                {/* Card body */}
                <div className="p-4">
                  <p className="text-anchor-gold text-sm font-medium mb-1">
                    {formatEventDate(event.startDate)} · {formatEventTime(event.startDate)}
                  </p>
                  <h3 className="text-white font-bold text-base leading-snug mb-2 group-hover:text-anchor-gold transition-colors line-clamp-2">
                    {event.name}
                  </h3>

                  {/* Price */}
                  {event.offers && (
                    <p className="text-anchor-gold-vivid text-sm font-semibold">
                      {event.offers.price === '0' || event.offers.price === '0.00'
                        ? 'Free entry'
                        : formatPrice(event.offers.price, event.offers.priceCurrency)}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    )
  } catch {
    // API failure — fail silently so the main event page is unaffected
    return null
  }
}
