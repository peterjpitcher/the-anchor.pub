import { Event } from '@/lib/api'
import { buildEventSchema } from '@/lib/structured-data/event-schema'
import { buildBreadcrumbItemList } from '@/lib/breadcrumb-schema'
import { getCategoryPageUrl } from '@/lib/event-seo-strategy'
import { getEventWebsitePath } from '@/lib/event-url'
import { jsonLdSafeStringify } from '@/lib/jsonld'

interface EventSchemaProps {
  event: Event
}

/**
 * Event JSON-LD, plus the BreadcrumbList that matches the visible trail.
 *
 * All 38 event pages rendered a breadcrumb in InteriorHero ("Home / Quiz
 * Night") with no matching structured data, so none of them were eligible for
 * the breadcrumb treatment in results. The trail here mirrors that nav exactly,
 * which is what Google asks for: Home, then the category hub, then this event.
 */
export function EventSchema({ event }: EventSchemaProps) {
  const schema = buildEventSchema(event)

  const categoryName = event.category?.name ?? "What's On"
  const categoryUrl = getCategoryPageUrl(event.category?.slug)
  const eventPath = getEventWebsitePath(event)

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: buildBreadcrumbItemList([
      { name: 'Home', href: '/', url: '/' },
      { name: categoryName, href: categoryUrl, url: categoryUrl },
      { name: event.name, href: eventPath, url: eventPath },
    ]),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSafeStringify(schema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSafeStringify(breadcrumb)
        }}
      />
    </>
  )
}
