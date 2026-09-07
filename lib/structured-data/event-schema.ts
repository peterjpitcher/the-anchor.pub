import { Event, getEventTicketTypes, hasMultipleTicketPrices } from '@/lib/api'
import { resolveEventSquareImage } from '@/lib/event-image'
import { getEventDateRangeUtc } from '@/lib/event-calendar'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getEventWebsiteUrl } from '@/lib/event-url'
import { getSchemaEventStatus, getSchemaOfferAvailability, getSafeAccessibilityNotes, CATEGORY_ROUTES } from '@/lib/event-seo-strategy'
import { getEventPresentation } from '@/lib/event-presentation'
import { getEventSchemaDescription } from '@/lib/event-copy'


const SITE_ORIGIN = 'https://www.the-anchor.pub'
const CATEGORY_PAGE_PATHS = new Set(Object.values(CATEGORY_ROUTES))
/** Last resort when even the category fallback fails to parse as a URL. */
const FALLBACK_EVENT_IMAGE_URL = `${SITE_ORIGIN}${DEFAULT_EVENT_IMAGE}`

function isSameOriginCategoryPath(url: URL): boolean {
  if (url.origin !== SITE_ORIGIN) return false
  const normalisedPath = url.pathname.replace(/\/+$/, '')
  return CATEGORY_PAGE_PATHS.has(normalisedPath)
}

function isManagementUrl(url: URL): boolean {
  const hostname = url.hostname.toLowerCase()
  return hostname.includes('orangejelly') || hostname.startsWith('management.')
}

/**
 * A crawler reads JSON-LD with no page to resolve against, so a relative path
 * in it points nowhere. Everything the schema emits goes through here first.
 *
 * Returns null rather than a guess when the value cannot be parsed, so the
 * caller drops the property instead of publishing rubbish.
 */
function absoluteSchemaUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null
  const trimmed = rawUrl.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed, SITE_ORIGIN)
    // Nothing but a web URL belongs in an image, video or action slot.
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
    // Already absolute, so hand it back byte for byte. Round-tripping through
    // URL rewrites what the API gave us (a bare origin gains a trailing slash,
    // for one), and only the relative case is actually broken.
    return /^https?:\/\//i.test(trimmed) ? trimmed : parsed.href
  } catch {
    return null
  }
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

  const absolute = absoluteSchemaUrl(action.target.urlTemplate)
  if (!absolute) return null

  const parsed = new URL(absolute)
  if (isManagementUrl(parsed)) return null
  if (isSameOriginCategoryPath(parsed)) return null
  return { ...action, target: { ...action.target, urlTemplate: absolute } }
}

function sanitiseMainEntityOfPage(
  mainEntity: Event['mainEntityOfPage'] | undefined,
  eventUrl: string
): Event['mainEntityOfPage'] | undefined {
  if (!mainEntity) return undefined

  // mainEntityOfPage names the page that describes this event, so the event
  // page is always the correct answer when the supplied id is a category page,
  // the internal management app, or does not parse at all.
  const absolute = absoluteSchemaUrl(mainEntity['@id'])
  if (!absolute) return { '@type': 'WebPage', '@id': eventUrl }

  const parsed = new URL(absolute)
  if (isManagementUrl(parsed) || isSameOriginCategoryPath(parsed)) {
    return { '@type': 'WebPage', '@id': eventUrl }
  }
  return { '@type': 'WebPage', '@id': absolute }
}

/**
 * The organiser is our public identity, and the management app is not it.
 *
 * The API answers with its own origin, so every event published
 * `https://management.orangejelly.co.uk` as `organizer.url` and invited search
 * engines to treat the internal booking back office as the organisation behind
 * the night. The same guard that already protects the booking URL, the reserve
 * action and mainEntityOfPage now covers the organiser too.
 *
 * Scope note: this is a rule about SEO identity fields, not about the domain.
 * Backend-issued customer links on that host, the manage-my-booking URL and the
 * PayPal return URLs, are legitimate and are deliberately untouched by this.
 *
 * When the API sends an organiser with no URL we leave the property off rather
 * than assert one: naming a third party promoter and then pointing at our own
 * site would be a claim, not a tidy-up.
 */
function sanitiseOrganizer(
  organizer: Event['organizer'] | undefined
): Record<string, unknown> {
  if (!organizer?.name) {
    return { '@type': 'Organization', name: 'The Anchor', url: SITE_ORIGIN }
  }

  const url = organizer.url ? sanitiseSchemaUrl(organizer.url, SITE_ORIGIN) : null

  return {
    '@type': organizer['@type'] || 'Organization',
    name: organizer.name,
    ...(url && { url })
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
  // Category fallback rather than one generic pub photo, and absolute rather
  // than the site-relative path the fallbacks are stored as: a crawler that
  // reads "/images/..." out of JSON-LD has no origin to resolve it against.
  const eventImages = (
    Array.isArray(event.image) && event.image.length > 0
      ? event.image
      : [resolveEventSquareImage(event)]
  )
    .map(absoluteSchemaUrl)
    .filter((url): url is string => url !== null)
  const image = eventImages.length > 0 ? eventImages : [FALLBACK_EVENT_IMAGE_URL]
  const thumbnailUrl = absoluteSchemaUrl(event.thumbnailImageUrl)
  const videoUrls = (event.video ?? [])
    .map(absoluteSchemaUrl)
    .filter((url): url is string => url !== null)
  const promoVideoUrl = absoluteSchemaUrl(event.promoVideoUrl)
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
    // `performer` is optional, and an absent one is omitted rather than filled.
    // This used to assert an Organization called "The Anchor Entertainment",
    // which exists in no record and in no line of docs/SSOT.md. Inventing an
    // entity to populate an optional property is the same class of error as
    // inventing a price: it is a fact we are publishing about ourselves that
    // nothing backs.
    //
    // There is deliberately NO heuristic here for a performer that is present
    // but wrong. Live quiz records currently name the owner rather than the
    // host (docs/SSOT.md §10 names Question One Quiz Masters), but "looks like
    // a staff name" is not something code can decide: quiz nights do take guest
    // hosts, and karaoke has no fixed host at all, so a guess would overwrite
    // legitimate values. A present-but-wrong record is corrected at source, in
    // the management app, under its own approval.
    ...(event.performer?.name
      ? {
          performer: {
            '@type': event.performer['@type'] || 'Person',
            name: event.performer.name
          }
        }
      : {}),
    ...(isBookable && { offers }),
    image,
    ...(thumbnailUrl && { thumbnailUrl }),
    organizer: sanitiseOrganizer(event.organizer),
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
    ...(videoUrls.length > 0 && {
      video: videoUrls.map((videoUrl, index) => ({
        '@type': 'VideoObject',
        url: videoUrl,
        name: `${event.name} - Video ${index + 1}`
      }))
    }),
    ...(promoVideoUrl && !event.video && {
      video: {
        '@type': 'VideoObject',
        url: promoVideoUrl,
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
