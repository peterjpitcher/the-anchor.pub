import { Event } from '@/lib/api'
import { getEventDateRangeUtc } from '@/lib/event-calendar'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getEventWebsiteUrl } from '@/lib/event-url'

export function buildEventSchema(event: Event) {
  const eventUrl = getEventWebsiteUrl(event, { absolute: true })
  const eventImage = event.image?.[0] || event.heroImageUrl || event.thumbnailImageUrl || DEFAULT_EVENT_IMAGE
  const bookingUrl = event.bookingUrl || eventUrl
  const { start, end } = getEventDateRangeUtc(event)
  const startDate = Number.isNaN(start.getTime()) ? event.startDate : start.toISOString()
  const endDate = Number.isNaN(end.getTime())
    ? event.endDate || undefined
    : end.toISOString()

  const rawPrice = event.offers?.price
  const numericPrice =
    typeof rawPrice === 'string' ? Number.parseFloat(rawPrice) : Number(rawPrice)
  const hasNumericPrice = Number.isFinite(numericPrice)
  const isAccessibleForFree =
    typeof event.isAccessibleForFree === 'boolean'
      ? event.isAccessibleForFree
      : hasNumericPrice
        ? numericPrice <= 0
        : undefined

  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    url: bookingUrl,
    availability:
      event.remainingAttendeeCapacity === 0
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock'
  }

  if (typeof rawPrice === 'string' && rawPrice.trim().length > 0 && hasNumericPrice && numericPrice >= 0) {
    offer.price = rawPrice
  }

  if (event.offers?.priceCurrency) {
    offer.priceCurrency = event.offers.priceCurrency
  }

  if (event.offers?.validFrom) {
    offer.validFrom = event.offers.validFrom
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': eventUrl,
    identifier: event.identifier || event.id,
    name: event.name,
    description:
      event.longDescription ||
      event.about ||
      event.description ||
      event.shortDescription ||
      `Join us for ${event.name} at The Anchor in Stanwell Moor. Experience great food, drinks and entertainment in a welcoming atmosphere.`,
    ...(event.shortDescription && { disambiguatingDescription: event.shortDescription }),
    ...(event.keywords && {
      keywords: Array.isArray(event.keywords) ? event.keywords.join(', ') : event.keywords
    }),
    startDate,
    ...(endDate && { endDate }),
    ...(event.duration && { duration: event.duration }),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'The Anchor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Horton Road',
        addressLocality: 'Stanwell Moor',
        addressRegion: 'Surrey',
        postalCode: 'TW19 6AQ',
        addressCountry: 'GB'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 51.462509,
        longitude: -0.502067
      }
    },
    performer: event.performer
      ? {
          '@type': event.performer['@type'] || 'Person',
          name: event.performer.name
        }
      : {
          '@type': 'Organization',
          name: 'The Anchor Entertainment',
          url: 'https://www.the-anchor.pub'
        },
    offers: offer,
    image: Array.isArray(event.image) && event.image.length > 0 ? event.image : [eventImage],
    ...(event.thumbnailImageUrl && { thumbnailUrl: event.thumbnailImageUrl }),
    organizer:
      event.organizer || {
        '@type': 'Organization',
        name: 'The Anchor',
        url: 'https://www.the-anchor.pub'
      },
    ...(typeof isAccessibleForFree === 'boolean' ? { isAccessibleForFree } : {}),
    ...(event.maximumAttendeeCapacity && {
      maximumAttendeeCapacity: event.maximumAttendeeCapacity
    }),
    ...(event.remainingAttendeeCapacity !== undefined && {
      remainingAttendeeCapacity: event.remainingAttendeeCapacity
    }),
    url: eventUrl,
    ...(event.mainEntityOfPage && { mainEntityOfPage: event.mainEntityOfPage }),
    potentialAction: event.potentialAction ?? {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.the-anchor.pub/book-table',
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform'
        ]
      }
    },
    ...(event.highlights && event.highlights.length > 0 && {
      subjectOf: {
        '@type': 'CreativeWork',
        abstract: event.highlights.join(' • ')
      }
    }),
    ...(event.video && event.video.length > 0 && {
      video: event.video.map((videoUrl, index) => ({
        '@type': 'VideoObject',
        url: videoUrl,
        name: `${event.name} - Video ${index + 1}`
      }))
    }),
    ...(event.promoVideoUrl && !event.video && {
      video: {
        '@type': 'VideoObject',
        url: event.promoVideoUrl,
        name: `${event.name} - Promotional Video`
      }
    })
  }
}
