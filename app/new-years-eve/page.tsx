import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { PhoneButton } from '@/components/PhoneButton'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { Badge, Button, Card, CardBody, Container, Section } from '@/components/ui'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { CONTACT, HEATHROW_TIMES } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

const NYE_BOOKING_URL = '/book-table?purpose=drinks'

const PAGE_TITLE = "New Year's Eve Pub Near Heathrow | The Anchor Stanwell Moor"
const PAGE_DESCRIPTION =
  "Ring in 2027 at The Anchor near Heathrow. New Year's Eve party with live entertainment, midnight countdown, and free parking. Book your spot."

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
      question: "What time does the New Year's Eve party start?",
      answer:
        "We're open from our regular hours and the party atmosphere builds through the evening. Entertainment typically kicks off mid-evening, with the countdown to midnight as the main event. Check our What's On page closer to the date for confirmed timings.",
    },
    {
      question: 'Is there a ticket or entry fee?',
      answer:
        "In previous years, entry has been free with no tickets required. We'll confirm details for this year's event on our What's On page. Booking a table is recommended to guarantee your spot.",
    },
    {
      question: 'What time does the pub close on New Year&apos;s Eve?',
      answer:
        "We typically have a late licence for New Year's Eve, staying open until at least 1am. The exact closing time will be confirmed closer to the date.",
    },
    {
      question: "Is food available on New Year's Eve?",
      answer:
        "We usually serve food earlier in the evening. Check our What's On page or call us closer to the date for confirmed kitchen times and any special menus.",
    },
    {
      question: 'Is there parking?',
      answer:
        'Yes. We have 20 free parking spaces on site — ideal for designated drivers. If you are drinking, taxis are easy to arrange for the short trip back to local hotels or home.',
    },
  ]

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: "New Year's Eve", url: '/new-years-eve' },
        ]}
      />

      <HeroWrapper
        route="/new-years-eve"
        title="New Year's Eve Pub in Stanwell Moor"
        description="See in the New Year at a proper village pub. Midnight countdown, live entertainment, and none of the London prices or transport chaos."
        eyebrow="31 December"
        lead={
          <p className="text-white/90 text-base sm:text-lg">
            Midnight countdown &middot; Live entertainment &middot; Free parking &middot; No surge pricing
          </p>
        }
        tags={[
          { label: 'Midnight countdown', variant: 'success' },
          { label: 'Live entertainment', variant: 'default' },
          { label: 'Free parking', variant: 'success' },
          { label: 'Late licence', variant: 'default' },
          { label: 'Dog-friendly (early evening)', variant: 'default' },
        ]}
        primaryCta={
          <Button asChild variant="primary" size="lg" fullWidth className="w-full sm:w-auto">
            <a href={NYE_BOOKING_URL}>
              Book Your Spot
            </a>
          </Button>
        }
        secondaryCta={
          <>
            <Link href="/whats-on" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" fullWidth className="w-full sm:w-auto">
                See what&apos;s on
              </Button>
            </Link>
            <PhoneButton
              phone={CONTACT.phone}
              source="nye_hero"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Call {CONTACT.phone}
            </PhoneButton>
          </>
        }
        secondaryInfo={
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking &middot; 20 spaces</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Late licence</span>
          </div>
        }
      />

      {/* See in the New Year */}
      <Section spacing="md" background="white">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              See in the New Year
            </h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              Forget the overpriced city centre bars and the nightmare of getting home afterwards. New Year&apos;s Eve
              at The Anchor is a proper celebration in a proper village pub — midnight countdown, party atmosphere,
              and you can actually get served at the bar.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed">
              We put on live entertainment every New Year&apos;s Eve, keep the drinks flowing, and make sure
              everyone has a brilliant night. The atmosphere is always spot on — lively enough to feel like a
              real party, small enough that you&apos;re not queuing for everything.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success" size="sm">Midnight countdown</Badge>
              <Badge variant="default" size="sm">Live entertainment</Badge>
              <Badge variant="default" size="sm">Late licence</Badge>
              <Badge variant="default" size="sm">Party atmosphere</Badge>
            </div>
          </div>
        </Container>
      </Section>

      {/* Why The Anchor for NYE */}
      <Section spacing="md" background="gray">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              Why The Anchor for New Year&apos;s Eve
            </h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              No &pound;80 taxi home. No surge pricing. No spending half the night in a queue. Just a village pub
              that knows how to throw a party — with 20 free parking spaces right outside for whoever&apos;s
              driving.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card variant="default">
                <CardBody className="space-y-2 p-6">
                  <h3 className="text-lg font-semibold text-anchor-gold-vivid">Free parking</h3>
                  <p className="text-sm text-anchor-cream-text/70">
                    20 free spaces on site. Your designated driver parks for free, or grab an easy taxi home —
                    no surge pricing out here.
                  </p>
                </CardBody>
              </Card>
              <Card variant="default">
                <CardBody className="space-y-2 p-6">
                  <h3 className="text-lg font-semibold text-anchor-gold-vivid">Actually get a drink</h3>
                  <p className="text-sm text-anchor-cream-text/70">
                    Unlike packed city bars, you can actually get to our bar. Craft beer, cocktails, champagne for
                    the midnight toast — all without the 20-minute queue.
                  </p>
                </CardBody>
              </Card>
              <Card variant="default">
                <CardBody className="space-y-2 p-6">
                  <h3 className="text-lg font-semibold text-anchor-gold-vivid">Village pub atmosphere</h3>
                  <p className="text-sm text-anchor-cream-text/70">
                    A proper local celebration where you can chat, dance, and count down to midnight with
                    people who actually want to be there.
                  </p>
                </CardBody>
              </Card>
              <Card variant="default">
                <CardBody className="space-y-2 p-6">
                  <h3 className="text-lg font-semibold text-anchor-gold-vivid">Dog-friendly</h3>
                  <p className="text-sm text-anchor-cream-text/70">
                    Well-behaved dogs are welcome in the early evening. If your dog isn&apos;t a fan of
                    fireworks, we&apos;re a calm spot before things get lively later on.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* Food & Drink */}
      <Section spacing="md" background="white">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              Food &amp; drink
            </h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              We typically serve food earlier in the evening on New Year&apos;s Eve — a chance to eat well
              before the party gets going. Whether it&apos;s from our regular menu or a special NYE menu,
              you&apos;ll want to book your table if you&apos;re planning to dine.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed">
              At midnight, expect a champagne toast to see in the New Year. Throughout the evening we&apos;ll
              have our full range of craft beer, wines, spirits and cocktails.
            </p>
            <div className="mt-6 rounded-2xl bg-anchor-bg-raised p-6 border border-anchor-gold/15">
              <h3 className="text-lg font-semibold text-anchor-gold-vivid">Browse our menus</h3>
              <p className="mt-3 text-sm text-anchor-cream-text/70 leading-relaxed">
                Take a look at our{' '}
                <Link
                  href="/food-menu"
                  className="font-semibold text-anchor-gold hover:text-anchor-gold-light underline decoration-dotted"
                >
                  food menu
                </Link>
                ,{' '}
                <Link
                  href="/pizza-menu"
                  className="font-semibold text-anchor-gold hover:text-anchor-gold-light underline decoration-dotted"
                >
                  pizza menu
                </Link>{' '}
                and{' '}
                <Link
                  href="/drinks"
                  className="font-semibold text-anchor-gold hover:text-anchor-gold-light underline decoration-dotted"
                >
                  drinks menu
                </Link>
                . New Year&apos;s Eve food details will be confirmed closer to the date.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Practical Details */}
      <Section spacing="md" background="gray">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              Practical details
            </h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              We typically have a late licence on New Year&apos;s Eve, staying open until at least 1am so you
              can properly see in the New Year. Walk-ins are possible, but booking is strongly recommended —
              it gets busy, and a reserved table means you&apos;re guaranteed your spot.
            </p>
            <div className="rounded-2xl border border-anchor-gold/15 bg-anchor-bg-raised p-6">
              <div className="mt-0 rounded-2xl bg-anchor-bg-card p-5 border border-anchor-gold/15">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-anchor-gold-vivid">
                  At a glance
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-anchor-cream-text/70">
                  <li className="flex gap-2">
                    <span className="text-anchor-gold">&bull;</span>
                    <span>Late licence — typically open until at least 1am</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-anchor-gold">&bull;</span>
                    <span>Midnight countdown and champagne toast</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-anchor-gold">&bull;</span>
                    <span>Live entertainment (confirmed closer to the date)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-anchor-gold">&bull;</span>
                    <span>20 free parking spaces on site</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-anchor-gold">&bull;</span>
                    <span>Booking recommended — walk-ins welcome if space allows</span>
                  </li>
                </ul>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="primary" size="lg" fullWidth className="w-full sm:w-auto sm:min-w-[220px]">
                  <a href={NYE_BOOKING_URL}>
                    Book Your Spot
                  </a>
                </Button>
                <Link href="/find-us" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" fullWidth className="w-full sm:w-auto">
                    Find Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Near Heathrow */}
      <Section spacing="md" background="white">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              Better than the hotel bar
            </h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              Staying at a Heathrow hotel over New Year&apos;s? Don&apos;t settle for the hotel bar. We&apos;re
              just {HEATHROW_TIMES.terminal5} minutes from Terminal 5 — an easy taxi ride for a proper New Year&apos;s
              Eve celebration with real atmosphere.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed">
              Airport hotel guests regularly come over for the evening. The taxi back is quick and
              affordable — a fraction of what you&apos;d pay in central London.
            </p>
            <Link
              href="/near-heathrow/terminal-5"
              className="inline-flex items-center text-sm font-semibold text-anchor-gold hover:text-anchor-gold-light underline decoration-dotted"
            >
              More about The Anchor near Heathrow Terminal 5
              <span className="ml-1">&rarr;</span>
            </Link>
          </div>
        </Container>
      </Section>

      {/* Booking CTA */}
      <Section background="gray" spacing="lg">
        <Container size="lg">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              Book your New Year&apos;s Eve
            </h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              New Year&apos;s Eve always fills up. Book your table now to guarantee your spot for the
              countdown. Large groups (8+), give us a call so we can sort the right space.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="primary" size="lg" fullWidth className="w-full sm:w-auto">
                <a href={NYE_BOOKING_URL}>
                  Book Your Spot Online
                </a>
              </Button>
              <PhoneButton
                phone={CONTACT.phone}
                source="nye_cta"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Call {CONTACT.phone}
              </PhoneButton>
            </div>
            <p className="text-sm text-anchor-cream-text/70">Tables for 8+ guests — please call.</p>
          </div>
        </Container>
      </Section>

      {/* Where we are */}
      <Section spacing="lg" background="white">
        <Container size="lg">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">Where we are</h2>
                <p className="text-anchor-cream-text/70 leading-relaxed">
                  The Anchor is in Stanwell Moor, Surrey (TW19 6AQ) — a quick drive from Heathrow and easy
                  to reach from Staines-upon-Thames, Ashford and Windsor. Free parking on site.
                </p>
                <p className="text-anchor-cream-text/70">
                  Address: <span className="font-semibold text-anchor-gold-vivid">{addressLine}</span>
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/find-us" className="w-full sm:w-auto">
                    <Button variant="secondary" size="lg" fullWidth className="w-full sm:w-auto">
                      Directions & parking
                    </Button>
                  </Link>
                  <PhoneButton
                    phone={CONTACT.phone}
                    source="nye_location"
                    variant="secondary"
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
      </Section>

      <FAQAccordionWithSchema title="New Year's Eve FAQs" faqs={faqs} className="bg-anchor-bg" />

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
