import { Event } from '@/lib/api'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getEventWebsiteUrl } from '@/lib/event-url'

function calculateEndDate(startDate: string, duration?: string): string {
  const start = new Date(startDate)
  const durationHours = duration ? parseInt(duration.replace(/\D/g, '')) || 3 : 3
  start.setHours(start.getHours() + durationHours)
  return start.toISOString()
}

export function buildEventSchema(event: Event) {
  const eventUrl = getEventWebsiteUrl(event, { absolute: true })
  const eventImage = event.image?.[0] || event.heroImageUrl || event.thumbnailImageUrl || DEFAULT_EVENT_IMAGE
  const bookingUrl = event.bookingUrl || eventUrl

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
    startDate: event.startDate,
    endDate: event.endDate || calculateEndDate(event.startDate, event.duration || undefined),
    ...(event.doorTime && { doorTime: event.doorTime }),
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
    offers: {
      '@type': 'Offer',
      url: bookingUrl,
      price: event.offers?.price || '0',
      priceCurrency: event.offers?.priceCurrency || 'GBP',
      availability:
        event.remainingAttendeeCapacity === 0
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
      validFrom: event.offers?.validFrom || new Date().toISOString()
    },
    image: Array.isArray(event.image) && event.image.length > 0 ? event.image : [eventImage],
    ...(event.thumbnailImageUrl && { thumbnailUrl: event.thumbnailImageUrl }),
    organizer:
      event.organizer || {
        '@type': 'Organization',
        name: 'The Anchor',
        url: 'https://www.the-anchor.pub'
      },
    isAccessibleForFree: event.isAccessibleForFree || event.offers?.price === '0',
    ...(event.maximumAttendeeCapacity && {
      maximumAttendeeCapacity: event.maximumAttendeeCapacity
    }),
    ...(event.remainingAttendeeCapacity !== undefined && {
      remainingAttendeeCapacity: event.remainingAttendeeCapacity
    }),
    url: eventUrl,
    ...(event.mainEntityOfPage && { mainEntityOfPage: event.mainEntityOfPage }),
    ...(event.potentialAction && { potentialAction: event.potentialAction }),
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
