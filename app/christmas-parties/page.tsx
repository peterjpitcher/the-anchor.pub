import type { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { ChristmasPartiesPageClient } from './client-components'
import { ChristmasHeroPrimaryCta, ChristmasHeroSecondaryCta } from './christmas-hero-ctas'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { HeroWrapper } from '@/components/hero/HeroWrapper'

export const metadata: Metadata = {
  title: 'Christmas Parties Near Heathrow & Staines | The Anchor',
  description:
    'Plan 2026 Christmas parties, shared party nights and private festive hire at The Anchor near Heathrow Terminal 5 and Staines. Three-course menus from GBP 36.95, buffets for 26+, corporate packages, Prosecco upgrades, free parking outside the ULEZ and rapid rides from airport hotels.',
  keywords:
    'christmas party venue near heathrow, christmas party pub staines, shared christmas party heathrow, corporate christmas party heathrow, christmas dinner staines, christmas party pub surrey, christmas party packages heathrow, cheap christmas parties heathrow, christmas buffet near heathrow, private christmas dining surrey',
  openGraph: {
    title: 'Christmas Parties 2026 Near Heathrow Terminal 5 | Shared Nights & Private Hire',
    description:
      'A proper village-pub Christmas with shared party nights, private hire, generous roasts and buffet options. Free parking minutes from Heathrow Terminal 5 and close to Staines, Ashford and Windsor.',
    images: [{ url: '/images/page-headers/christmas-parties/2026/hero-table.png', width: 1200, height: 630, alt: 'Christmas parties at The Anchor near Heathrow' }]
  },
  twitter: getTwitterMetadata({
    title: 'Christmas Parties 2026 Near Heathrow Terminal 5 | Shared Nights & Private Hire',
    description: 'A proper village-pub Christmas with shared party nights, private hire, generous roasts and buffet options. Free parking minutes from Heathrow Terminal 5.',
    images: ['/images/page-headers/christmas-parties/2026/hero-table.png']
  }),
  alternates: {
    canonical: '/christmas-parties'
  }
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'Christmas Parties & Festive Dinners 2026 at The Anchor, Stanwell Moor',
  description:
    'Celebrate Christmas 2026 at The Anchor near Heathrow Terminal 5. Three-course pub roasts with Yorkshire puddings and pigs in blankets, free parking outside the ULEZ, buffet options for informal gatherings, and space for up to 60 seated guests.',
  startDate: '2026-11-24',
  endDate: '2026-12-23',
  eventStatus: 'https://schema.org/EventScheduled',
  image: ['https://www.the-anchor.pub/images/page-headers/christmas-parties/2026/hero-table.png'],
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
        value: 'Up to 60 seated, 200 standing for Christmas events'
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
      description: 'Two or three-course children’s Christmas menu with smaller portions and the same trimmings.'
    },
    {
      '@type': 'Offer',
      name: 'Shared party night package (Tue–Thu)',
      price: '36.95',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      description: 'Shared Christmas party nights with crackers, festive playlists and three-course menus – ideal for airport teams and Surrey offices.'
    }
  ],
  addOn: [
    {
      '@type': 'Offer',
      name: 'All the Trimmings Board',
      price: '11.95',
      priceCurrency: 'GBP',
      description: 'Serves four guests – extra Yorkshire puddings, pigs in blankets, roast potatoes, stuffing balls, seasonal veg and gravy.'
    },
    {
      '@type': 'Offer',
      name: 'XL Trimmings Board',
      price: '21.95',
      priceCurrency: 'GBP',
      description: 'Serves eight guests – doubles up the festive sides so the whole table can feast.'
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
      <HeroWrapper
        id="christmas-hero"
        route="/christmas-parties"
       
        title="A proper village-pub Christmas minutes from Heathrow"
        description="Three-course feasts piled with herb-crusted triple-cooked roast potatoes, pigs in blankets and sage & onion stuffing - with crackers, candles and festive decor waiting at your table."
        eyebrow={<span className="text-red-100">Christmas 2026</span>}
        image={{
          src: '/images/page-headers/christmas-parties/2026/hero-table.png',
          alt: 'Festive Christmas dinner table setting at The Anchor near Heathrow',
          priority: true
        }}
        ctaContainerClassName="w-full max-w-4xl"
        primaryCta={<ChristmasHeroPrimaryCta />}
        secondaryCta={<ChristmasHeroSecondaryCta />}
      />
      <ChristmasPartiesPageClient structuredData={structuredData} />
    </>
  )
}
