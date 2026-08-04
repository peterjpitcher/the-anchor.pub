import ssot from '@/SSOT.json'
import {
  CHRISTMAS_DEPOSIT_PER_PERSON,
  CHRISTMAS_MINIMUM_PARTY_SIZE,
  CHRISTMAS_WINDOW_END,
  CHRISTMAS_WINDOW_START,
  formatChristmasWindowLabel
} from '@/lib/christmas-season'

type SsotData = {
  venue: {
    capacity: {
      christmas_seated: number
      christmas_standing: number
    }
  }
  christmas_2026: {
    buffets: {
      min_guests: number
    }
  }
}

const PAGE_URL = 'https://www.the-anchor.pub/christmas-parties'
const BUSINESS_ID = 'https://www.the-anchor.pub/#business'
const WEBSITE_ID = 'https://www.the-anchor.pub/#website'
const HERO_IMAGE =
  'https://www.the-anchor.pub/images/page-headers/christmas-parties/2026/hero-table.jpg'

const { venue, christmas_2026: christmas } = ssot as unknown as SsotData

const BUFFET_MINIMUM_GUESTS = christmas.buffets.min_guests

/**
 * The window and the booking rules come from the season helper, which parses
 * SSOT.json. Nothing here restates a date, so a later season cannot be
 * published from stale copy in this file.
 */
const WINDOW_LABEL = formatChristmasWindowLabel()

function enquiryService(name: string, description: string) {
  return {
    '@type': 'Service',
    name,
    serviceType: name,
    description: `${description} Available from ${CHRISTMAS_WINDOW_START} to ${CHRISTMAS_WINDOW_END}.`,
    provider: { '@id': BUSINESS_ID },
    url: PAGE_URL,
  }
}

/**
 * Page-level markup is deliberately non-priced. SSOT holds every Christmas
 * menu rate as LIVE_FROM_DB, so publishing a figure here would guarantee drift
 * against the management database the moment a price changes. Priced markup is
 * built separately by buildChristmasMenuJsonLd, from live data only.
 */
export const christmasPartiesSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: 'Christmas parties and Christmas dinner near Heathrow',
      description:
        `Christmas dinner and Christmas parties at The Anchor in Stanwell Moor, near Heathrow Airport, ${WINDOW_LABEL}. Minimum ${CHRISTMAS_MINIMUM_PARTY_SIZE} guests, at least 24 hours notice, and a deposit of ${CHRISTMAS_DEPOSIT_PER_PERSON} pounds per person on every Christmas booking.`,
      inLanguage: 'en-GB',
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': BUSINESS_ID },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: HERO_IMAGE,
        caption: 'A table laid for a Christmas party at The Anchor near Heathrow'
      }
    },
    {
      '@type': 'Service',
      '@id': `${PAGE_URL}#christmas-service`,
      name: 'Christmas dinner and Christmas parties at The Anchor',
      serviceType: 'Christmas dinner and Christmas party venue hire',
      description:
        `Christmas dinner and Christmas parties at The Anchor, Stanwell Moor, near Heathrow Airport, ${WINDOW_LABEL}. Menu prices are served live from the management system and confirmed on enquiry.`,
      provider: { '@id': BUSINESS_ID },
      areaServed: [
        { '@type': 'City', name: 'Staines-upon-Thames' },
        { '@type': 'City', name: 'Ashford' },
        { '@type': 'City', name: 'Windsor' },
        { '@type': 'Place', name: 'Heathrow Airport' }
      ],
      audience: [
        {
          '@type': 'BusinessAudience',
          audienceType: 'Mid-week workplace gatherings and airport teams'
        },
        {
          '@type': 'PeopleAudience',
          audienceType: 'Local families and community groups from Stanwell Moor and Staines'
        }
      ],
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceUrl: PAGE_URL,
        servicePhone: '+441753682707'
      },
      isRelatedTo: [
        enquiryService(
          'Christmas party',
          `Private Christmas party hire for up to ${venue.capacity.christmas_seated} seated or ${venue.capacity.christmas_standing} standing guests.`
        ),
        enquiryService(
          'Sit-down Christmas lunch or dinner',
          `A one, two or three course Christmas dinner for ${CHRISTMAS_MINIMUM_PARTY_SIZE} guests or more, booked at least 24 hours ahead. Courses are chosen per person, not for the whole table. Every guest chooses a main. A starter and a dessert are optional, so guests at the same table can have different numbers of courses. Choices are sent to us in advance and we confirm the deadline with the booking. A deposit of ${CHRISTMAS_DEPOSIT_PER_PERSON} pounds per person applies to every Christmas booking, whatever the party size.`
        ),
        enquiryService(
          'Festive buffet',
          `A festive buffet for ${BUFFET_MINIMUM_GUESTS} guests or more.`
        )
      ]
    }
  ]
}

/** A live menu section, reduced to what the JSON-LD builder needs. */
export interface ChristmasMenuJsonLdSection {
  title: string
  items: Array<{
    name: string
    description?: string
    priceValue: number
  }>
}

/**
 * Priced Christmas menu markup, built only from live management-database data.
 *
 * Returns null when there is nothing publishable, so the page never emits an
 * empty Menu node. An item with no usable price is published without an Offer
 * rather than with a null, zero or invented one.
 */
export function buildChristmasMenuJsonLd(
  sections: ChristmasMenuJsonLdSection[]
): Record<string, unknown> | null {
  const publishable = sections.filter((section) => section.items.length > 0)
  if (publishable.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'The Anchor Christmas Menu',
    description: `Christmas menu at The Anchor, Stanwell Moor, ${WINDOW_LABEL}.`,
    url: PAGE_URL,
    isPartOf: { '@id': BUSINESS_ID },
    hasMenuSection: publishable.map((section) => ({
      '@type': 'MenuSection',
      name: section.title,
      hasMenuItem: section.items.map((item) => ({
        '@type': 'MenuItem',
        name: item.name,
        ...(item.description ? { description: item.description } : {}),
        // Only ever a real, positive, live price. No price means no Offer.
        ...(Number.isFinite(item.priceValue) && item.priceValue > 0
          ? {
              offers: {
                '@type': 'Offer',
                priceCurrency: 'GBP',
                price: item.priceValue.toFixed(2),
                availabilityStarts: CHRISTMAS_WINDOW_START,
                availabilityEnds: CHRISTMAS_WINDOW_END
              }
            }
          : {})
      }))
    }))
  }
}
