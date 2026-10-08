import Link from 'next/link'
import { Metadata } from 'next'
import { Container, Button } from '@/components/ui'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { JsonLd } from '@/components/JsonLd'
import { InteriorHero } from '@/components/hero'
import { DEFAULT_OG_IMAGE } from '@/lib/image-fallbacks'
import { getRouteLastModified } from '@/lib/sitemap-lastmod'
import { BRAND, CONTACT, HEATHROW_TIMES, PARKING } from '@/lib/constants'
import { PRIVATE_HIRE_CAPACITY_SUMMARY } from '@/lib/private-hire-capacity'
import { ACCESS_AMENITY_FEATURES, ACCESS_WORDING } from '@/lib/approved-wording'
import { STATIC_HOURS_REVIEW_NOTE } from '@/lib/business-hours-fallback'
import { WeekHours } from '@/components/WeekHours'
import { getBusinessHoursSnapshot } from '@/lib/api'
import { buildKitchenSchedule } from '@/lib/hours-utils'

const PAGE_URL = 'https://www.the-anchor.pub/about/the-anchor-facts'
const PAGE_LAST_MODIFIED = getRouteLastModified('/about/the-anchor-facts')?.toISOString()
const LAST_REVIEWED = '21 May 2026'

export const metadata: Metadata = {
  title: { absolute: 'The Anchor Facts | Food, Hours, Private Hire and Events' },
  description:
    'Factual source page for The Anchor in Stanwell Moor, including address, booking links, food, hours, parking, private hire, events and Heathrow distance.',
  alternates: {
    canonical: '/about/the-anchor-facts',
  },
  openGraph: {
    title: 'The Anchor Facts',
    description:
      'Current facts for The Anchor in Stanwell Moor, including booking links, food, hours, private hire, events and Heathrow distance.',
    url: PAGE_URL,
    type: 'website',
    // Named here because this block replaces the root layout's, picture and all.
    images: [{ url: DEFAULT_OG_IMAGE, alt: 'The Anchor in Stanwell Moor' }],
  },
}

const primaryFacts = [
  ['Venue name', BRAND.name],
  ['Address', `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`],
  ['Phone', CONTACT.phone],
  ['Email', CONTACT.email],
  ['Food served', 'Pub classics, burgers, fish and chips, stone-baked pizzas, vegetarian options and Sunday roasts.'],
  ['Cuisine', 'British pub food, pizza and Sunday roast.'],
  // Bar and kitchen hours are not in this list. They were two rows that said
  // the hours "are loading from the management system" and never changed (site
  // review HT-005, C3-024). The page now renders the live week below the list.
  ['Parking', `${PARKING.capacity} free on-site customer parking spaces.`],
  ['Dog policy', 'Dogs are welcome inside the pub and in the beer garden.'],
  ['Family policy', 'Families are welcome for food, Sunday roast, private hire and hosted events.'],
  ['Accessibility', ACCESS_WORDING],
  ['Private hire capacity', `${PRIVATE_HIRE_CAPACITY_SUMMARY}. Larger events are by enquiry.`],
  ['Hosted event types', 'Quiz nights, Music Bingo, Cash Bingo, karaoke when listed, and terrestrial live sport.'],
  ['Areas served', 'Stanwell Moor, Staines, Heathrow, Ashford, Colnbrook, Bedfont and nearby Surrey villages.'],
  ['Heathrow distance', `${HEATHROW_TIMES.terminal5} minutes by car from Heathrow Terminal 5, with other terminals usually within ${HEATHROW_TIMES.range}.`],
  ['Google rating', 'Use an approved live source. Do not hardcode rating or review count.'],
  ['Last reviewed', LAST_REVIEWED],
] as const

const keyLinks = [
  ['Book a table', '/book-table'],
  ['Food menu', '/food-menu'],
  ['Sunday roast', '/sunday-roast'],
  ['Private hire', '/private-hire'],
  ["What's On", '/whats-on'],
  ['Find us', '/find-us'],
  ['Plane spotting', '/plane-spotting-heathrow'],
] as const

const socialLinks = [
  ['Facebook', 'https://www.facebook.com/theanchorpubsm/'],
  ['Instagram', 'https://www.instagram.com/theanchor.pub/'],
] as const

const factsSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: 'The Anchor Facts',
      description:
        'Factual source page for The Anchor in Stanwell Moor, including food, hours, private hire, events, parking and Heathrow distance.',
      // From git, like the sitemap date for this page. It was typed as
      // 2026-05-21 and stayed there through months of changes.
      ...(PAGE_LAST_MODIFIED ? { dateModified: PAGE_LAST_MODIFIED } : {}),
      about: { '@id': 'https://www.the-anchor.pub/#business' },
    },
    {
      '@type': ['Restaurant', 'BarOrPub'],
      '@id': 'https://www.the-anchor.pub/#business',
      name: BRAND.name,
      url: 'https://www.the-anchor.pub',
      telephone: CONTACT.phoneIntl,
      email: CONTACT.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: CONTACT.address.street,
        addressLocality: CONTACT.address.town,
        addressRegion: CONTACT.address.county,
        postalCode: CONTACT.address.postcode,
        addressCountry: CONTACT.address.country,
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: CONTACT.coordinates.lat,
        longitude: CONTACT.coordinates.lng,
      },
      servesCuisine: ['British', 'Pub Food', 'Pizza', 'Sunday Roast'],
      priceRange: '££',
      hasMenu: 'https://www.the-anchor.pub/food-menu',
      acceptsReservations: true,
      sameAs: socialLinks.map(([, href]) => href),
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: 'Free customer parking', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Dog friendly', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Beer garden', value: true },
        ...ACCESS_AMENITY_FEATURES,
      ],
    },
  ],
}

export default async function AnchorFactsPage() {
  // The week's hours from the management app, rendered on the server: the same
  // cached read the homepage and /find-us use. Null if it cannot be reached;
  // the kitchen line then gives the phone number and WeekHours says so itself.
  const businessHours = await getBusinessHoursSnapshot()
  const kitchenSchedule = businessHours ? buildKitchenSchedule(businessHours) : ''

  return (
    <>
      <JsonLd data={factsSchema} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'About', url: '/about' },
          { name: 'The Anchor Facts', url: '/about/the-anchor-facts' },
        ]}
      />
      <InteriorHero
        image="/images/page-headers/our-pub/the-anchor-our-pub.jpg"
        crumb="The Anchor Facts"
        title="The Anchor Facts"
        lead="Current factual details for food, booking links, opening hours, private hire, hosted events, parking and Heathrow distance."
        actions={
          <>
            <Button asChild size="lg" fullWidth>
              <Link href="/book-table">Book a Table</Link>
            </Button>
            <Button asChild variant="outline" size="lg" fullWidth>
              <Link href="/food-menu">View Food Menu</Link>
            </Button>
          </>
        }
      />

      <section className="py-section-y bg-canvas border-b border-line">
        <Container>
          <div className="mx-auto text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-text">
              Source of truth
            </p>
            <h2 className="mt-3 text-h3 text-ink-strong">
              The Anchor Facts
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">
              Current factual details for The Anchor in Stanwell Moor, including food, booking links, opening hours, private hire, hosted events, parking and Heathrow distance.
            </p>
            <p className="mt-3 text-sm text-ink-muted">
              {STATIC_HOURS_REVIEW_NOTE} Page last reviewed {LAST_REVIEWED}.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link href="/book-table">Book a Table</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/food-menu">View Food Menu</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface border-b border-line">
        <Container>
          <dl className="mx-auto grid gap-4 md:grid-cols-2">
            {primaryFacts.map(([label, value]) => (
              <div key={label} className="rounded-md border border-line bg-surface-sunk p-5">
                <dt className="text-sm font-semibold uppercase tracking-[0.16em] text-accent-text">
                  {label}
                </dt>
                <dd className="mt-2 text-base leading-relaxed text-ink-muted">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mx-auto mt-10">
            <h2 className="text-2xl text-ink-strong">Opening hours</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-muted">
              {kitchenSchedule
                ? `Kitchen hours: ${kitchenSchedule}.`
                : `Call ${CONTACT.phone} for today's kitchen hours.`}
            </p>
            <WeekHours initialHours={businessHours} className="mt-5" />
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas border-b border-line">
        <Container>
          <div className="mx-auto grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl text-ink-strong">Primary Links</h2>
              <ul className="mt-5 space-y-3">
                {keyLinks.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="font-semibold text-accent-text underline underline-offset-4 hover:text-accent">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl text-ink-strong">Social Links</h2>
              <ul className="mt-5 space-y-3">
                {socialLinks.map(([label, href]) => (
                  <li key={href}>
                    <a href={href} className="font-semibold text-accent-text underline underline-offset-4 hover:text-accent">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm leading-relaxed text-ink-muted">
                Facts on this page should match visible site copy, schema, Google Business Profile and booking pages.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
