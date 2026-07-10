import type { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { ChristmasPartiesPageClient } from './client-components'
import { ChristmasHeroPrimaryCta, ChristmasHeroSecondaryCta } from './christmas-hero-ctas'
import { InteriorHero } from '@/components/hero'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { christmasPartiesSchema } from '@/lib/christmas-parties-schema'

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
      <ChristmasPartiesPageClient structuredData={christmasPartiesSchema} />
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
