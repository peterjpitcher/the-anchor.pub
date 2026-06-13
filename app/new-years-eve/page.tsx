import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { InteriorHero } from '@/components/hero'
import { PhoneButton } from '@/components/PhoneButton'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { Badge, Button, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { CONTACT, HEATHROW_TIMES } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

const NYE_BOOKING_URL = '/book-table?purpose=drinks'

const PAGE_TITLE = "New Year's Eve Near Heathrow | The Anchor"
const PAGE_DESCRIPTION =
  "See in the New Year at The Anchor near Heathrow. A proper village pub with a full bar, food earlier in the evening and free parking. Book a table or walk in."

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/new-years-eve' },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [DEFAULT_PAGE_HEADER_IMAGE],
  }),
}

export default function NewYearsEvePage(): React.JSX.Element {
  const addressLine = `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`
  const mapQuery = `The Anchor, ${CONTACT.address.street}, ${CONTACT.address.postcode}`

  const faqs = [
    {
      question: "What's happening at The Anchor on New Year's Eve?",
      answer:
        "We're open for New Year's Eve with the full bar and a warm welcome. For confirmed timings and anything we have planned, check our What's On page closer to the date.",
    },
    {
      question: 'Is there a ticket or entry fee?',
      answer:
        "We'll confirm any details for this year's evening on our What's On page closer to the date. Booking a table is recommended to guarantee your spot.",
    },
    {
      question: 'What time does the pub close on New Year&apos;s Eve?',
      answer:
        "Closing time on New Year's Eve will be confirmed closer to the date. Check our What's On page or call us for the latest.",
    },
    {
      question: "Is food available on New Year's Eve?",
      answer:
        "We usually serve food earlier in the evening. Check our What's On page or call us closer to the date for confirmed kitchen times.",
    },
    {
      question: 'Is there parking?',
      answer:
        'Yes. We have 20 free parking spaces on site, ideal for designated drivers. If you are drinking, taxis are easy to arrange for the short trip back to local hotels or home.',
    },
  ]

  return (
    <>

            <InteriorHero
        image="/images/page-headers/whats-on/whats-on.jpg"
        crumb="New Year's Eve"
        kicker="31 December"
        title="New Year's Eve at The Anchor, Stanwell Moor"
        lead="See in the New Year at a proper village pub, without the London prices or the transport chaos. Full bar, food earlier in the evening, and free parking right outside. Book a table or walk in."
      />

      {/* See in the New Year */}
      <section className="py-section-y bg-surface">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-h3 text-ink-strong">
              See in the New Year
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              Forget the overpriced city centre bars and the nightmare of getting home afterwards. New Year&apos;s Eve
              at The Anchor is a proper village pub welcome, where you can actually get served at the bar and
              settle in with people who want to be there.
            </p>
            <p className="text-ink-muted leading-relaxed">
              It&apos;s lively enough to feel like a real night out, small enough that you&apos;re not queuing for
              everything. For anything we have planned this year, keep an eye on our What&apos;s On page closer
              to the date.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="green">Full bar</Badge>
              <Badge variant="green">Free parking</Badge>
              <Badge variant="green">Village pub atmosphere</Badge>
              <Badge variant="green">Dog friendly (early evening)</Badge>
            </div>
          </div>
        </Container>
      </section>

      {/* Why The Anchor for NYE */}
      <section className="py-section-y bg-surface-sunk">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-h3 text-ink-strong">
              Why The Anchor for New Year&apos;s Eve
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              No &pound;80 taxi home. No surge pricing. No spending half the night in a queue. Just a village pub
              that knows how to throw a party, with 20 free parking spaces right outside for whoever&apos;s
              driving.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardBody className="space-y-2">
                  <h3 className="text-lg font-semibold text-ink-strong">Free parking</h3>
                  <p className="text-sm text-ink-muted">
                    20 free spaces on site. Your designated driver parks for free, or grab an easy taxi home,
                    no surge pricing out here.
                  </p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="space-y-2">
                  <h3 className="text-lg font-semibold text-ink-strong">Actually get a drink</h3>
                  <p className="text-sm text-ink-muted">
                    Unlike packed city bars, you can actually get to our bar. Draught lagers, bottled beers,
                    wines, spirits and cocktails, all without the 20-minute queue.
                  </p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="space-y-2">
                  <h3 className="text-lg font-semibold text-ink-strong">Village pub atmosphere</h3>
                  <p className="text-sm text-ink-muted">
                    A proper local celebration where you can chat, dance, and count down to midnight with
                    people who actually want to be there.
                  </p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="space-y-2">
                  <h3 className="text-lg font-semibold text-ink-strong">Dog-friendly</h3>
                  <p className="text-sm text-ink-muted">
                    Well-behaved dogs are welcome in the early evening. If your dog isn&apos;t a fan of
                    fireworks, we&apos;re a calm spot before things get lively later on.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Food & Drink */}
      <section className="py-section-y bg-surface">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-h3 text-ink-strong">
              Food &amp; drink
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              We usually serve food earlier in the evening on New Year&apos;s Eve, a chance to eat well
              before the night gets going. Book your table if you&apos;re planning to dine. Kitchen times
              are confirmed closer to the date.
            </p>
            <p className="text-ink-muted leading-relaxed">
              Throughout the evening we&apos;ll have our full range of draught lagers, bottled beers, wines,
              spirits and cocktails.
            </p>
            <Card accent className="mt-6">
              <CardBody>
                <h3 className="text-lg font-semibold text-ink-strong">Browse our menus</h3>
                <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                  Take a look at our{' '}
                  <Link
                    href="/food-menu"
                    className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted"
                  >
                    food menu
                  </Link>
                  ,{' '}
                  <Link
                    href="/pizza-menu"
                    className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted"
                  >
                    pizza menu
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/drinks"
                    className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted"
                  >
                    drinks menu
                  </Link>
                  . New Year&apos;s Eve food details will be confirmed closer to the date.
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Practical Details */}
      <section className="py-section-y bg-surface-sunk">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-h3 text-ink-strong">
              Practical details
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              Opening and closing times for New Year&apos;s Eve are confirmed closer to the date, so check
              our What&apos;s On page or call us for the latest. Walk-ins are welcome, but booking is strongly
              recommended, it gets busy, and a reserved table means you&apos;re guaranteed your spot.
            </p>
            <Card accent>
              <CardBody>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-accent-text">
                  At a glance
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-ink-muted">
                  <li className="flex gap-2">
                    <span className="text-accent-text">&bull;</span>
                    <span>Opening hours confirmed closer to the date</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-text">&bull;</span>
                    <span>Full bar all evening</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-text">&bull;</span>
                    <span>Food served earlier in the evening</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-text">&bull;</span>
                    <span>20 free parking spaces on site</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-text">&bull;</span>
                    <span>Booking recommended, walk-ins welcome if space allows</span>
                  </li>
                </ul>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button asChild variant="primary" size="lg" fullWidth className="w-full sm:w-auto sm:min-w-[220px]">
                    <a href={NYE_BOOKING_URL}>
                      Book Your Spot
                    </a>
                  </Button>
                  <Link href="/find-us" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" fullWidth className="w-full sm:w-auto">
                      Find Us
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Near Heathrow */}
      <section className="py-section-y bg-surface">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-h3 text-ink-strong">
              Better than the hotel bar
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              Staying at a Heathrow hotel over New Year&apos;s? Don&apos;t settle for the hotel bar. We&apos;re
              just {HEATHROW_TIMES.terminal5} minutes from Terminal 5, an easy taxi ride for a proper New Year&apos;s
              Eve celebration with real atmosphere.
            </p>
            <p className="text-ink-muted leading-relaxed">
              Airport hotel guests regularly come over for the evening. The taxi back is quick and
              affordable, a fraction of what you&apos;d pay in central London.
            </p>
            <Link
              href="/near-heathrow/terminal-5"
              className="inline-flex items-center text-sm font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted"
            >
              More about The Anchor near Heathrow Terminal 5
              <span className="ml-1">&rarr;</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* Booking CTA */}
      <CtaBand
        title="Book your New Year's Eve"
        copy="New Year's Eve always fills up. Book your table now to guarantee your spot. Large groups (8+), give us a call so we can sort the right space."
        primary={
          <Button asChild variant="primary" size="lg">
            <a href={NYE_BOOKING_URL}>Book Your Spot Online</a>
          </Button>
        }
        secondary={
          <PhoneButton
            phone={CONTACT.phone}
            source="nye_cta"
            variant="outline"
            size="lg"
          >
            Call {CONTACT.phone}
          </PhoneButton>
        }
      />

      {/* Where we are */}
      <section className="py-section-y bg-surface">
        <Container size="lg">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              <div className="space-y-4">
                <h2 className="text-h3 text-ink-strong">Where we are</h2>
                <p className="text-ink-muted leading-relaxed">
                  The Anchor is in Stanwell Moor, Surrey (TW19 6AQ), a quick drive from Heathrow and easy
                  to reach from Staines-upon-Thames, Ashford and Windsor. Free parking on site.
                </p>
                <p className="text-ink-muted">
                  Address: <span className="font-semibold text-ink-strong">{addressLine}</span>
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/find-us" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" fullWidth className="w-full sm:w-auto">
                      Directions & parking
                    </Button>
                  </Link>
                  <PhoneButton
                    phone={CONTACT.phone}
                    source="nye_location"
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Call {CONTACT.phone}
                  </PhoneButton>
                </div>
              </div>
              <GoogleMapEmbed query={mapQuery} height={360} />
            </div>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema title="New Year's Eve FAQs" faqs={faqs} />

      <InternalLinkingSection
        title="More to explore at The Anchor"
        links={[
          { href: NYE_BOOKING_URL, title: 'Book Your Spot', description: 'Reserve online in minutes' },
          { href: '/whats-on', title: "What's On", description: 'Upcoming events and entertainment' },
          ...commonLinkGroups.dining,
          ...commonLinkGroups.location,
        ]}
      />
    </>
  )
}
