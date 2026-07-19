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
  title: { absolute: 'Christmas Party Venue Near Heathrow & Staines | The Anchor' },
  description:
    'Christmas party venue near Heathrow and Staines. Sit-down festive meals by pre-order, buffets and full venue hire for up to 200. Free parking, £10pp deposit.',
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
        title="Christmas parties near Heathrow, Staines and Surrey"
        lead="A village pub Christmas party venue seven minutes from Heathrow Terminal 5 and eight from Staines, with around 20 free parking spaces. Bookings run 1 November to 23 December, from small team dinners to 60 seated or 200 standing, secured with a £10 per person deposit."
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
            href: '/blog/office-christmas-party-planning-guide',
            title: 'Office Christmas Party Planning Guide',
            description: 'A step-by-step guide for organisers, from setting the date to collecting pre-orders.',
          },
          {
            href: '/blog/christmas-party-food-ideas',
            title: 'Christmas Party Food Ideas',
            description: 'Sit-down, buffet and sharing options to suit your group and budget.',
          },
          {
            href: '/private-hire',
            title: 'Private Hire at The Anchor',
            description: 'Function room and venue hire for celebrations all year round.',
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
