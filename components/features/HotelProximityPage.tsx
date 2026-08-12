import Link from 'next/link'
import type { Metadata } from 'next'
import { Button, Card, CardBody, SectionHeading, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { CONTACT } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getSundayRoastContent, SUNDAY_ROAST } from '@/lib/sunday-roast'

const SITE_URL = 'https://www.the-anchor.pub'

export interface HotelProximityPageProps {
  /**
   * Display name of the hotel as it appears in headings and body copy
   * (e.g. "Sofitel London Heathrow"). Used verbatim, so include the brand's
   * own casing.
   */
  hotelName: string
  /**
   * Short label for the breadcrumb and hero crumb (e.g. "Sofitel").
   */
  shortName: string
  /**
   * Page slug WITHOUT a leading slash (e.g. "pub-near-sofitel-heathrow").
   * Used to build the canonical URL and the schema @id.
   */
  slug: string
  /**
   * Optional one-line, hotel-specific aside used in the intro paragraph.
   * Must contain only confirmed or genuinely general facts, never an
   * invented distance, fare or price. Example: "popular with international
   * business travellers". Leave undefined for a neutral intro.
   */
  brandNote?: string
}

/**
 * HotelProximityPage: the single shared template behind every
 * `/pub-near-[hotel]-heathrow` page.
 *
 * All hotel pages render identical, SSOT-backed content (free parking, the
 * Sunday roast, the live food menu, the dog-friendly beer garden, a book-a-table
 * CTA) and differ only by the hotel name passed in. We deliberately use general
 * proximity language ("just a few minutes from [hotel]", "7 minutes from
 * Terminal 5") rather than per-hotel walk/drive distances, because we do not
 * hold verified door-to-door figures for each hotel. No food or drink prices
 * appear in copy; those are live from the management database via /food-menu.
 */
export function HotelProximityPage({ hotelName, shortName, slug, brandNote }: HotelProximityPageProps) {
  const sunday = getSundayRoastContent()
  const canonical = `/${slug}`

  const nearbyHotelSchema = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    '@id': `${SITE_URL}/${slug}#nearby`,
    name: `The Anchor, near ${hotelName}`,
    isPartOf: { '@id': `${SITE_URL}/#business` },
    nearbyAttractions: [
      { '@type': 'Hotel', name: hotelName, description: 'A few minutes from The Anchor' },
    ],
  }

  const introNote = brandNote
    ? `Staying at the ${hotelName}? You are ${brandNote}, and The Anchor is just a few minutes away.`
    : `Staying at the ${hotelName}? The Anchor is just a few minutes away.`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([nearbyHotelSchema]) }}
      />

      <InteriorHero
        image={DEFAULT_PAGE_HEADER_IMAGE}
        crumb={shortName}
        title={`Pub Near ${hotelName}`}
        lead="A proper British pub a few minutes away, with free parking, a dog-friendly beer garden and home-cooked food"
      />

      {/* Intro */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto text-center">
            <PageTitle seo={{ structured: true, speakable: true }} className="mb-4">
              {`Pub Near ${hotelName}`}
            </PageTitle>
            <p className="text-lg text-ink-muted">
              {introNote} The Anchor is a traditional pub in Stanwell Moor, the closest village to
              Heathrow Airport and around 7 minutes by car from Terminal 5. We are a proper
              alternative to the hotel restaurant: home-cooked food, a good range of draught lagers
              and beers, free parking and a dog-friendly beer garden under the Heathrow flight path.
            </p>
          </div>
        </Container>
      </section>

      {/* Key facts */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'A Few Minutes', description: `A short taxi or drive from ${hotelName}` },
              { title: '7 Mins from T5', description: 'Around 7 minutes by car from Terminal 5' },
              { title: 'Free Parking', description: 'On-site parking for guests, no fees or time limit' },
              { title: 'Beer Garden', description: 'Dog-friendly, under the Heathrow flight path' },
            ].map((fact) => (
              <Card key={fact.title} accent>
                <CardBody className="p-6 text-center">
                  <p className="font-display text-h4 text-ink-strong">{fact.title}</p>
                  <p className="mt-1 text-sm text-ink-muted">{fact.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Skip the hotel restaurant */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title={`Skip the Hotel Restaurant Near ${shortName}`}
              lead={`After a long journey it is tempting to eat where you are staying, but the ${hotelName} restaurant is not your only option. The Anchor is a short hop away and gives you a proper pub dinner instead of room service.`}
            />
            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Why Guests Make the Trip</h3>
                  <ul className="space-y-3 text-ink">
                    {[
                      'Home-cooked British food, prices live on our menu',
                      'A good range of draught lagers and beers, plus wines and spirits',
                      'Warm, unpretentious pub atmosphere, no dress code',
                      'Dog-friendly beer garden with water bowls and treats',
                      'Free parking on site if you have a hire car',
                      'Full receipts for business travellers',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="text-accent-text font-bold" aria-hidden="true">
                          {'✓'}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Getting Here</h3>
                  <div className="space-y-3 text-ink-muted">
                    <div>
                      <p className="font-semibold text-ink">By taxi or Uber</p>
                      <p className="text-sm">
                        Most Heathrow hotels are only a few minutes away. Ask the driver for
                        &quot;The Anchor, Stanwell Moor&quot; or give them the postcode below.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">By car</p>
                      <p className="text-sm">
                        We are in Stanwell Moor village, close to the M25 (Junction 14) and around 7
                        minutes from Terminal 5. Free parking for all pub guests.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-line">
                      <p className="text-sm font-medium text-ink">
                        Sat-nav postcode: <strong>{CONTACT.address.postcode}</strong>
                      </p>
                      <p className="text-sm text-ink-muted">Level parking close to the entrance, CCTV and floodlit</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Food: Sunday roast + live menu */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="The Sunday Roast and the Full Menu"
              lead={
                sunday.isLive
                  ? 'Our famous Sunday roast is the dish guests travel for, and there is a full British menu the rest of the week.'
                  : `Our famous Sunday roast launches ${SUNDAY_ROAST.launchDateLabel}, and there is a full British menu every other day.`
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
              {[
                {
                  title: 'Sunday Roast',
                  description: sunday.isLive
                    ? 'Walk in between 1pm and 6pm on Sundays for a traditional roast with all the trimmings. Booking is recommended for larger groups.'
                    : `Launching ${SUNDAY_ROAST.launchDateLabel}. Walk-ins welcome from 1pm, with a roast for every appetite including a vegan option.`,
                },
                {
                  title: 'British Classics',
                  description: 'Fish and chips, burgers, stone-baked pizzas and daily specials, all home-cooked. Current prices are live on the menu.',
                },
                {
                  title: 'Drinks',
                  description: 'A good range of draught lagers and beers, plus wines, premium spirits and cocktails at honest pub prices.',
                },
              ].map((item) => (
                <Card key={item.title} accent>
                  <CardBody className="p-6 text-center">
                    <h3 className="font-display text-h4 text-ink-strong mb-2">{item.title}</h3>
                    <p className="text-sm text-ink-muted">{item.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Link href="/food-menu">
                <Button variant="outline" size="lg">
                  View the Full Menu
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Beer garden */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="A Dog-Friendly Beer Garden Under the Flight Path"
              lead="One thing no airport hotel can offer: a proper beer garden right under the Heathrow flight path, where you can watch the planes come in over a pint."
            />
            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-6">
                  <ul className="space-y-3 text-ink">
                    {[
                      'Seating for plenty, indoors and out',
                      'Full food and drink service during kitchen hours',
                      'Free WiFi throughout the pub and garden',
                      'A favourite spot for plane spotting near Heathrow',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="text-accent-text font-bold" aria-hidden="true">
                          {'✓'}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Bring the Dog</h3>
                  <p className="text-ink-muted text-sm">
                    The Anchor is dog-friendly throughout. There are water bowls and a jar of dog
                    biscuits by the door, so four-legged guests are as welcome as everyone else.
                    There are a couple of steps from the bar to the garden, and a ramp is available
                    on request. The bar, dining area and car park are all step-free.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Opening hours */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto text-center">
            <SectionHeading title="Opening Hours" />
            <BusinessHours/>
            <Card accent className="mt-6 text-left">
              <CardBody className="p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-2">Early flight, or a free evening?</h3>
                <p className="text-ink-muted">
                  Walk-ins are always welcome. For groups of six or more, give us a call so we can
                  set aside the best table for you.
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: `Is there a pub near ${hotelName}?`,
            answer: `Yes. The Anchor in Stanwell Moor is just a few minutes from ${hotelName} by taxi, Uber or car. It is a traditional British pub with home-cooked food, a good range of draught lagers and beers, free on-site parking and a dog-friendly beer garden. We are around 7 minutes by car from Heathrow Terminal 5.`,
          },
          {
            question: `How do I get to The Anchor from ${hotelName}?`,
            answer: `The quickest way is a short taxi or Uber ride. Ask the driver for "The Anchor, Stanwell Moor" or use the postcode ${CONTACT.address.postcode}. If you have a hire car it is an easy drive and we have free parking for all guests.`,
          },
          {
            question: `Can I walk from ${hotelName} to The Anchor?`,
            answer: 'The roads around Heathrow are not pedestrian-friendly, so a short taxi, Uber or drive is the easiest way to reach us. If you are driving, parking at the pub is free with no time limit.',
          },
          {
            question: `What food is on the menu near ${hotelName}?`,
            answer: sunday.isLive
              ? 'The Anchor serves a full British pub menu including fish and chips, burgers, stone-baked pizzas, daily specials and a traditional Sunday roast at weekends. Current prices are shown live on our menu at /food-menu.'
              : `The Anchor serves a full British pub menu including fish and chips, burgers, stone-baked pizzas and daily specials. Our Sunday roast launches ${SUNDAY_ROAST.launchDateLabel}. Current prices are shown live on our menu at /food-menu.`,
          },
          {
            question: `Is The Anchor near ${hotelName} dog-friendly?`,
            answer: 'Yes. The Anchor is dog-friendly throughout, with water bowls and dog biscuits provided. Our beer garden, under the Heathrow flight path, is a great spot to relax with your dog after a long journey.',
          },
        ]}
        className="bg-canvas"
      />

      <CtaBand
        title={`A Proper Pub a Few Minutes from ${shortName}`}
        copy="Home-cooked food, a dog-friendly beer garden and free parking. Book a table or just walk in."
      >
        <Link href="/book-table">
          <Button variant="primary" size="lg">
            Book a Table
          </Button>
        </Link>
        <Link href={CONTACT.phoneHref}>
          <Button variant="outline" size="lg">
            Call {CONTACT.phone}
          </Button>
        </Link>
        <Link href="/food-menu">
          <Button variant="outline" size="lg">
            View Menu
          </Button>
        </Link>
      </CtaBand>
    </>
  )
}

export interface HotelProximityMetadataInput {
  hotelName: string
  slug: string
  /** Optional short metaName when hotelName is long (defaults to hotelName). */
  metaName?: string
}

/**
 * Builds consistent, SSOT-safe Metadata for a hotel proximity page. No prices
 * and no invented distances; leads on the confirmed differentiators (free
 * parking, beer garden, 7 minutes from Terminal 5).
 */
export function buildHotelProximityMetadata({ hotelName, slug, metaName }: HotelProximityMetadataInput): Metadata {
  const name = metaName ?? hotelName
  const title = `Pub Near ${name} Heathrow | Free Parking | The Anchor`
  const description = `Traditional British pub a few minutes from ${name}. Home-cooked food, Sunday roast, dog-friendly beer garden and free parking, around 7 minutes from Heathrow Terminal 5.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: DEFAULT_PAGE_HEADER_IMAGE,
          width: 1200,
          height: 630,
          alt: `The Anchor pub near ${name} Heathrow`,
        },
      ],
      type: 'website',
    },
    twitter: getTwitterMetadata({ title, description, images: [DEFAULT_PAGE_HEADER_IMAGE] }),
    alternates: {
      canonical: `/${slug}`,
    },
  }
}
