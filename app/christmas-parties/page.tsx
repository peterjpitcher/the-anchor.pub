import type { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { ChristmasPartiesPageClient } from './client-components'
import { ChristmasHeroPrimaryCta, ChristmasHeroSecondaryCta } from './christmas-hero-ctas'
import { InteriorHero } from '@/components/hero'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: { absolute: 'Christmas Parties Near Heathrow | 2026 | The Anchor' },
  description:
    'Plan a Christmas party near Heathrow, or request a sit-down Christmas lunch or dinner. Festive meals are pre-order only. Free parking. Enquire for live pricing.',
  openGraph: {
    title: 'Christmas Parties & Festive Dining Near Heathrow | The Anchor',
    description:
      'Plan a Christmas party, or request a pre-order sit-down Christmas lunch or dinner near Heathrow. Free parking and flexible party spaces.',
    images: [{ url: '/images/page-headers/christmas-parties/2026/hero-table.jpg', width: 1200, height: 630, alt: 'Christmas parties at The Anchor near Heathrow' }]
  },
  twitter: getTwitterMetadata({
    title: 'Christmas Parties & Festive Dining Near Heathrow | The Anchor',
    description: 'Plan a Christmas party, or request a pre-order sit-down Christmas lunch or dinner near Heathrow. Free parking and flexible party spaces.',
    images: ['/images/page-headers/christmas-parties/2026/hero-table.jpg']
  }),
  alternates: {
    canonical: '/christmas-parties'
  }
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'Christmas Party Venue 2026: The Anchor, Stanwell Moor near Heathrow',
  description:
    'Christmas party venue near Heathrow Airport. Festive pub Christmas dinners, buffets for larger groups, free parking outside the ULEZ, and space for 10+ to 150 guests.',
  // Christmas party service window (owner-confirmed): 1 Nov – 23 Dec 2026.
  startDate: '2026-11-01',
  endDate: '2026-12-23',
  eventStatus: 'https://schema.org/EventScheduled',
  image: ['https://www.the-anchor.pub/images/page-headers/christmas-parties/2026/hero-table.jpg'],
  location: {
    '@type': 'Place',
    name: 'The Anchor, Stanwell Moor',
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
    },
    amenityFeature: [
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Free parking near Heathrow Terminal 5',
        value: '20 spaces on-site, two minutes from M25 Junction 14'
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Outside the ULEZ zone',
        value: 'No additional city charge for guests arriving by car'
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Village pub dining rooms',
        value: 'Private hire for 10+ to 150 guests'
      }
    ],
    areaServed: [
      { '@type': 'City', name: 'Staines-upon-Thames' },
      { '@type': 'City', name: 'Ashford' },
      { '@type': 'City', name: 'Windsor' },
      { '@type': 'Place', name: 'Heathrow Airport' }
    ]
  },
  organizer: {
    '@type': 'Organization',
    name: 'The Anchor',
    url: 'https://www.the-anchor.pub',
    email: 'manager@the-anchor.pub',
    telephone: '+44 1753 682707'
  },
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
  offers: [
    {
      '@type': 'Offer',
      name: 'Festive three-course menu (Tue–Thu)',
      price: '36.95',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      validFrom: '2026-09-01',
      availabilityStarts: '2026-09-01',
      availabilityEnds: '2026-12-23',
      url: 'https://www.the-anchor.pub/christmas-parties',
      description: 'Three-course Christmas dinner with Yorkshire puddings, pigs in blankets, roast potatoes, seasonal vegetables and gravy. Available Tuesday to Thursday.'
    },
    {
      '@type': 'Offer',
      name: 'Festive three-course menu (Fri–Sat)',
      price: '39.95',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      validFrom: '2026-09-01',
      availabilityStarts: '2026-09-01',
      availabilityEnds: '2026-12-23',
      url: 'https://www.the-anchor.pub/christmas-parties',
      description: 'Friday and Saturday Christmas dinners with all the trimmings, perfect for larger celebrations.'
    },
    {
      '@type': 'Offer',
      name: 'Children’s festive menu (under 12)',
      price: '15.95',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      validFrom: '2026-09-01',
      availabilityStarts: '2026-09-01',
      availabilityEnds: '2026-12-23',
      url: 'https://www.the-anchor.pub/christmas-parties',
      description: 'Two or three-course children’s Christmas menu with smaller portions and the same trimmings.'
    },
    {
      '@type': 'Offer',
      name: 'Shared party night package (Tue–Thu)',
      price: '36.95',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      validFrom: '2026-09-01',
      availabilityStarts: '2026-09-01',
      availabilityEnds: '2026-12-23',
      url: 'https://www.the-anchor.pub/christmas-parties',
      description: 'Shared Christmas party nights with crackers, festive playlists and three-course menus, ideal for airport teams and Surrey offices.'
    }
  ],
  addOn: [
    {
      '@type': 'Offer',
      name: 'All the Trimmings Board',
      price: '11.95',
      priceCurrency: 'GBP',
      description: 'Serves four guests, extra Yorkshire puddings, pigs in blankets, roast potatoes, stuffing balls, seasonal veg and gravy.'
    },
    {
      '@type': 'Offer',
      name: 'XL Trimmings Board',
      price: '21.95',
      priceCurrency: 'GBP',
      description: 'Serves eight guests, doubles up the festive sides so the whole table can feast.'
    },
    {
      '@type': 'Offer',
      name: 'Bundle A arrival & finale',
      price: '9.95',
      priceCurrency: 'GBP',
      description: 'Glass of Prosecco on arrival plus coffee and mince pie to finish.'
    }
  ]
}

export default function ChristmasPartiesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Christmas Parties', url: '/christmas-parties' }
        ]}
      />
      <InteriorHero
        image="/images/page-headers/christmas-parties/2026/hero-table.jpg"
        crumb="Christmas Parties"
        kicker="Christmas 2026"
        title="Christmas parties and festive dining near Heathrow"
        lead="Plan a Christmas party, or request a sit-down Christmas lunch or dinner by pre-order. We are around seven minutes from Heathrow Terminal 5, traffic dependent, with free parking and flexible space for groups."
        actions={
          <>
            <ChristmasHeroPrimaryCta />
            <ChristmasHeroSecondaryCta />
          </>
        }
      />
      <ChristmasPartiesPageClient structuredData={structuredData} />
      <InternalLinkingSection
        title="More Christmas Party Planning"
        links={[
          {
            href: '/blog/cheap-christmas-parties-heathrow',
            title: 'Cheap Christmas Parties Near Heathrow',
            description: 'Practical ideas for keeping Christmas party costs sensible without losing the atmosphere.',
          },
          {
            href: '/corporate-christmas-parties',
            title: 'Corporate Christmas Parties',
            description: 'Work Christmas party options for Heathrow, Staines and Surrey teams.',
          },
        ]}
      />
      <OrganicSearchClusterLinks
        cluster="privateRooms"
        currentPath="/christmas-parties"
        title="Private room and party venue options"
        intro="Compare Christmas parties with private hire, function rooms and corporate event options near Heathrow."
      />
    </>
  )
}
