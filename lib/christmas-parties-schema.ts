import ssot from '@/SSOT.json'

type SsotData = {
  venue: {
    capacity: {
      christmas_seated: number
      christmas_standing: number
    }
  }
  private_hire: {
    christmas_2026_service_window: string
    christmas_sit_down_meals: string
    christmas_buffets: string
  }
}

const PAGE_URL = 'https://www.the-anchor.pub/christmas-parties'
const BUSINESS_ID = 'https://www.the-anchor.pub/#business'
const WEBSITE_ID = 'https://www.the-anchor.pub/#website'
const HERO_IMAGE =
  'https://www.the-anchor.pub/images/page-headers/christmas-parties/2026/hero-table.jpg'

const SERVICE_WINDOW_PATTERN = /^(\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})/

const { venue, private_hire: privateHire } = ssot as unknown as SsotData

// The window is parsed rather than restated so a later season cannot be published
// from stale copy: SSOT.json is the only place the dates live.
function resolveServiceWindow(): { start: string, end: string } {
  const match = SERVICE_WINDOW_PATTERN.exec(privateHire.christmas_2026_service_window)
  if (!match) {
    throw new Error(
      'SSOT private_hire.christmas_2026_service_window must begin "YYYY-MM-DD to YYYY-MM-DD"'
    )
  }
  return { start: match[1], end: match[2] }
}

const { start: SERVICE_WINDOW_START, end: SERVICE_WINDOW_END } = resolveServiceWindow()

function enquiryOffer(name: string, description: string) {
  return {
    '@type': 'Offer',
    availabilityStarts: SERVICE_WINDOW_START,
    availabilityEnds: SERVICE_WINDOW_END,
    url: PAGE_URL,
    itemOffered: {
      '@type': 'Service',
      name,
      description
    }
  }
}

/**
 * Christmas markup is deliberately non-priced. SSOT holds every Christmas menu
 * rate as LIVE_FROM_DB, so publishing a figure here would guarantee drift
 * against the management database the moment a price changes.
 */
export const christmasPartiesSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: 'Christmas parties and festive dining near Heathrow',
      description:
        'Plan a Christmas party at The Anchor in Stanwell Moor, or request a sit-down Christmas lunch or dinner by pre-order. Free parking, near Heathrow Airport.',
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
      name: 'Christmas parties and festive dining at The Anchor',
      serviceType: 'Christmas party venue hire and festive dining',
      description:
        'Christmas parties and pre-order sit-down festive meals at The Anchor, Stanwell Moor, near Heathrow Airport. Menu pricing is confirmed on enquiry.',
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
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Christmas enquiry options',
        itemListElement: [
          enquiryOffer(
            'Christmas party',
            `Private Christmas party hire for up to ${venue.capacity.christmas_seated} seated or ${venue.capacity.christmas_standing} standing guests.`
          ),
          enquiryOffer('Sit-down Christmas lunch or dinner', privateHire.christmas_sit_down_meals),
          enquiryOffer('Festive buffet', privateHire.christmas_buffets)
        ]
      }
    }
  ]
}
