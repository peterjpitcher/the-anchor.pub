import { Event } from '@/lib/api'
import { getEventDateRangeUtc } from '@/lib/event-calendar'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getEventWebsiteUrl } from '@/lib/event-url'
import { getSchemaEventStatus, getSchemaOfferAvailability, CATEGORY_ROUTES } from '@/lib/event-seo-strategy'


const SITE_ORIGIN = 'https://www.the-anchor.pub'
const CATEGORY_PAGE_PATHS = new Set(Object.values(CATEGORY_ROUTES))

function isSameOriginCategoryPath(url: URL): boolean {
  if (url.origin !== SITE_ORIGIN) return false
  const normalisedPath = url.pathname.replace(/\/+$/, '')
  return CATEGORY_PAGE_PATHS.has(normalisedPath)
}

function sanitiseSchemaUrl(
  rawUrl: string | null | undefined,
  fallbackUrl: string
): string {
  if (!rawUrl || typeof rawUrl !== 'string') return fallbackUrl
  const trimmed = rawUrl.trim()
  if (!trimmed) return fallbackUrl

  try {
    const parsed = new URL(trimmed, SITE_ORIGIN)
    if (isSameOriginCategoryPath(parsed)) return fallbackUrl
    return trimmed
  } catch {
    return fallbackUrl
  }
}

function sanitisePotentialAction(
  action: Event['potentialAction'] | undefined
): Event['potentialAction'] | null {
  if (!action?.target?.urlTemplate) return action ?? null

  try {
    const parsed = new URL(action.target.urlTemplate, SITE_ORIGIN)
    if (isSameOriginCategoryPath(parsed)) return null
    return action
  } catch {
    return action
  }
}

function sanitiseMainEntityOfPage(
  mainEntity: Event['mainEntityOfPage'] | undefined,
  eventUrl: string
): Event['mainEntityOfPage'] | undefined {
  if (!mainEntity) return undefined
  const id = mainEntity['@id']
  if (!id) return mainEntity

  try {
    const parsed = new URL(id, SITE_ORIGIN)
    if (isSameOriginCategoryPath(parsed)) {
      return { '@type': 'WebPage', '@id': eventUrl }
    }
    return mainEntity
  } catch {
    return mainEntity
  }
}

export function buildEventSchema(event: Event) {
  const eventUrl = getEventWebsiteUrl(event, { absolute: true })
  const eventImage = event.image?.[0] || event.heroImageUrl || event.thumbnailImageUrl || DEFAULT_EVENT_IMAGE
  const bookingUrl =
    sanitiseSchemaUrl(event.bookingUrl, '') ||
    sanitiseSchemaUrl(event.offers?.url, '') ||
    eventUrl
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
    availability: getSchemaOfferAvailability(event)
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

  const schema: Record<string, unknown> = {
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
    eventStatus: getSchemaEventStatus(event),
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
    ...(event.mainEntityOfPage && { mainEntityOfPage: sanitiseMainEntityOfPage(event.mainEntityOfPage, eventUrl) }),
    potentialAction: sanitisePotentialAction(event.potentialAction) ?? {
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

  // Conditionally add accessibility feature from event data
  if (event.accessibility_notes) {
    schema.accessibilityFeature = [event.accessibility_notes]
  }

  // Conditionally add refund policy from event data
  if (event.cancellation_policy) {
    schema.refundPolicy = event.cancellation_policy
  }

  return schema
}
