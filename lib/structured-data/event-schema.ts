import { Event, getEventTicketTypes, hasMultipleTicketPrices } from '@/lib/api'
import { getEventDateRangeUtc } from '@/lib/event-calendar'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getEventWebsiteUrl } from '@/lib/event-url'
import { getSchemaEventStatus, getSchemaOfferAvailability, getSafeAccessibilityNotes, CATEGORY_ROUTES } from '@/lib/event-seo-strategy'
import { getEventPresentation } from '@/lib/event-presentation'
import { getEventSchemaDescription } from '@/lib/event-copy'


const SITE_ORIGIN = 'https://www.the-anchor.pub'
const CATEGORY_PAGE_PATHS = new Set(Object.values(CATEGORY_ROUTES))

function isSameOriginCategoryPath(url: URL): boolean {
  if (url.origin !== SITE_ORIGIN) return false
  const normalisedPath = url.pathname.replace(/\/+$/, '')
  return CATEGORY_PAGE_PATHS.has(normalisedPath)
}

function isManagementUrl(url: URL): boolean {
  const hostname = url.hostname.toLowerCase()
  return hostname.includes('orangejelly') || hostname.startsWith('management.')
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
    if (isManagementUrl(parsed)) return fallbackUrl
    if (isSameOriginCategoryPath(parsed)) return fallbackUrl
    return parsed.href
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
    if (isManagementUrl(parsed)) return null
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
  // Same resolver the page uses, so the markup cannot advertise tickets for a
  // night the page itself says has ended. schema.org has no "completed" event
  // status (the enumeration is Scheduled / Cancelled / Postponed / Rescheduled
  // / MovedOnline), so `startDate` in the past is what tells a crawler the
  // event is over. What must not happen is pairing that past date with a live
  // offer, a reserve action or remaining capacity.
  const presentation = getEventPresentation(event)
  const isBookable = presentation.includeSchemaOffers
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

  // When the event sells 2+ ticket types at differing prices, emit one Offer per
  // type so search engines surface the real price range. Otherwise keep the
  // single legacy Offer object unchanged.
  const priceCurrency = event.offers?.priceCurrency || 'GBP'
  const offers: Record<string, unknown> | Record<string, unknown>[] = hasMultipleTicketPrices(event)
    ? getEventTicketTypes(event).map((type) => {
        const typeOffer: Record<string, unknown> = {
          '@type': 'Offer',
          name: type.name,
          url: bookingUrl,
          availability: getSchemaOfferAvailability(event),
          price: type.price.toFixed(2),
          priceCurrency
        }
        if (event.offers?.validFrom) {
          typeOffer.validFrom = event.offers.validFrom
        }
        return typeOffer
      })
    : offer

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': eventUrl,
    identifier: event.identifier || event.id,
    name: event.name,
    description: getEventSchemaDescription(event),
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
    ...(isBookable && { offers }),
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
    ...(isBookable &&
      event.remainingAttendeeCapacity !== undefined && {
        remainingAttendeeCapacity: event.remainingAttendeeCapacity
      }),
    url: eventUrl,
    ...(event.mainEntityOfPage && { mainEntityOfPage: sanitiseMainEntityOfPage(event.mainEntityOfPage, eventUrl) }),
    ...(isBookable && {
      potentialAction: sanitisePotentialAction(event.potentialAction) ?? {
        '@type': 'ReserveAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: eventUrl,
          actionPlatform: [
            'https://schema.org/DesktopWebPlatform',
            'https://schema.org/MobileWebPlatform'
          ]
        }
      }
    }),
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
  // Same suppression as the visible page: never assert an accessibility
  // feature the SSOT verifies we do not have.
  const safeAccessibilityNotes = getSafeAccessibilityNotes(event)
  if (safeAccessibilityNotes) {
    schema.accessibilityFeature = [safeAccessibilityNotes]
  }

  return schema
}
