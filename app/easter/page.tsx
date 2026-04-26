import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { Badge, Button, Card, CardBody, Container, Section } from '@/components/ui'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { CONTACT, HEATHROW_TIMES } from '@/lib/constants'
import {
  DEFAULT_PAGE_HEADER_IMAGE,
  DEFAULT_SUNDAY_LUNCH_IMAGE,
  DEFAULT_FOOD_IMAGE,
  DEFAULT_DRINKS_IMAGE
} from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

const EASTER_SUNDAY_DATE = '2026-04-05'
const EASTER_SUNDAY_LABEL = 'Sunday 5 April 2026'
const EASTER_SUNDAY_SERVICE_WINDOW = '1pm\u20136pm'
const EASTER_SUNDAY_LAST_BOOKING = '5:30pm'
const EASTER_ROAST_PRICE_FROM = 19
const EASTER_DEPOSIT_PER_PERSON = 10

const EASTER_BOOKING_URL = '/book-table?purpose=sunday_lunch'

const WEBSITE_ORIGIN = 'https://www.the-anchor.pub'

export const metadata: Metadata = {
  title: 'Easter Sunday Lunch & Beer Garden',
  description:
    'Celebrate Easter 2026 at The Anchor near Heathrow. Easter Sunday roast from \u00a319, dog-friendly beer garden, free parking. Book by Saturday 1pm.',
  alternates: { canonical: '/easter' },
  openGraph: {
    title: 'Easter at The Anchor | Sunday Lunch & Beer Garden',
    description:
      'Celebrate Easter 2026 at The Anchor near Heathrow. Easter Sunday roast from \u00a319, dog-friendly beer garden, free parking. Book by Saturday 1pm.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website'
  },
  twitter: getTwitterMetadata({
    title: 'Easter at The Anchor | Sunday Lunch & Beer Garden',
    description:
      'Celebrate Easter 2026 at The Anchor near Heathrow. Easter Sunday roast from \u00a319, dog-friendly beer garden, free parking. Book by Saturday 1pm.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  })
}

export default function EasterPage() {
  const addressLine = `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`
  const mapQuery = `The Anchor, ${CONTACT.address.street}, ${CONTACT.address.postcode}`

  const faqs = [
    {
      question: 'What are your Easter opening hours?',
      answer:
        'We\u2019re open throughout the Easter weekend. Good Friday through Easter Sunday: normal hours with full kitchen service. ' +
        'Easter Monday: open for drinks only \u2014 the kitchen is closed on Mondays, including bank holidays.'
    },
    {
      question: 'Do I need to book for Easter Sunday lunch?',
      answer:
        'Yes. Easter Sunday lunch requires advance booking with a \u00a310 per person deposit, placed by Saturday 1pm. ' +
        'You\u2019ll choose each guest\u2019s main in the booking flow and pay the deposit online to secure your table.'
    },
    {
      question: 'Is The Anchor dog-friendly?',
      answer:
        'Absolutely. Well-behaved dogs are welcome inside the pub and in the beer garden. Water bowls are always available. ' +
        'It\u2019s a great spot for a post-walk Easter Sunday lunch.'
    },
    {
      question: 'What\u2019s on the Easter menu?',
      answer:
        'Our Easter Sunday menu is the same as our regular Sunday roast \u2014 choose from chicken, pork belly, or a vegetarian option. ' +
        'Mains start from \u00a319. All served with roast potatoes, seasonal vegetables, Yorkshire pudding and gravy.'
    },
    {
      question: 'Is there parking?',
      answer:
        `Yes \u2014 we have ${20} free parking spaces on site. No meters, no charges. ` +
        `We\u2019re about ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car.`
    }
  ]

  const easterEventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${WEBSITE_ORIGIN}/easter#event`,
    name: 'Easter Sunday Lunch at The Anchor',
    description:
      `Easter Sunday lunch at The Anchor in Stanwell Moor (TW19), near Heathrow. ` +
      `Traditional roast from \u00a3${String(EASTER_ROAST_PRICE_FROM)}. Serving ${EASTER_SUNDAY_SERVICE_WINDOW}. ` +
      `Dog-friendly beer garden, free parking. Booking required with \u00a3${EASTER_DEPOSIT_PER_PERSON} per person deposit by Saturday 1pm.`,
    startDate: `${EASTER_SUNDAY_DATE}T13:00:00+01:00`,
    endDate: `${EASTER_SUNDAY_DATE}T18:00:00+01:00`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'The Anchor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: CONTACT.address.street,
        addressLocality: CONTACT.address.town,
        addressRegion: CONTACT.address.county,
        postalCode: CONTACT.address.postcode,
        addressCountry: CONTACT.address.country
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: CONTACT.coordinates.lat,
        longitude: CONTACT.coordinates.lng
      }
    },
    organizer: {
      '@type': 'Organization',
      name: 'The Anchor',
      url: WEBSITE_ORIGIN,
      telephone: CONTACT.phoneIntl,
      email: CONTACT.email
    },
    offers: {
      '@type': 'Offer',
      url: `${WEBSITE_ORIGIN}${EASTER_BOOKING_URL}`,
      priceCurrency: 'GBP',
      price: String(EASTER_ROAST_PRICE_FROM),
      availability: 'https://schema.org/InStock'
    },
    image: [
      `${WEBSITE_ORIGIN}${DEFAULT_SUNDAY_LUNCH_IMAGE}`,
      `${WEBSITE_ORIGIN}${DEFAULT_FOOD_IMAGE}`,
      `${WEBSITE_ORIGIN}${DEFAULT_DRINKS_IMAGE}`
    ],
    url: `${WEBSITE_ORIGIN}/easter`
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Easter', url: '/easter' }
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(easterEventSchema)
        }}
      />

            <HeroWrapper
        route="/easter"
        title="Easter at The Anchor"
        description={
          `Gather the family for a proper Easter Sunday roast at The Anchor in Stanwell Moor \u2014 ` +
          `cooked from scratch, served ${EASTER_SUNDAY_SERVICE_WINDOW}, with free parking and a dog-friendly beer garden.`
        }
        eyebrow={EASTER_SUNDAY_LABEL}
        lead={
          <p className="text-white/90 text-base sm:text-lg">
            Sunday roast from \u00a3{String(EASTER_ROAST_PRICE_FROM)} &bull; \u00a3{EASTER_DEPOSIT_PER_PERSON}pp deposit &bull; Book by Saturday 1pm
          </p>
        }
        image={{
          src: DEFAULT_PAGE_HEADER_IMAGE,
          alt: 'Easter Sunday lunch at The Anchor near Heathrow'
        }}
        enableSmartCtas={true}
        showContextStrip={true}
      />

      {/* Easter Sunday Lunch */}
      <Section background="white" spacing="md">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              Easter Sunday Lunch
            </h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              Easter Sunday is one of those meals that deserves a proper table. Join us at The Anchor for a traditional roast
              cooked from scratch &mdash; the kind of lunch that marks the start of spring and brings the whole family together.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed">
              Choose from chicken, pork belly, or a vegetarian option, all served with golden roast potatoes,
              seasonal vegetables, a generous Yorkshire pudding and our signature gravy. Mains start from{' '}
              <span className="font-semibold">&pound;{String(EASTER_ROAST_PRICE_FROM)}</span>.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed">
              We serve from <span className="font-semibold">1pm</span> to <span className="font-semibold">6pm</span>,
              with the last table booking at <span className="font-semibold">{EASTER_SUNDAY_LAST_BOOKING}</span>.
              No set sittings &mdash; book a time that suits you and enjoy your meal at a comfortable pace.
            </p>

            <div className="rounded-2xl bg-anchor-bg-raised p-6 border border-anchor-gold/15">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-anchor-gold-vivid">Booking policy</h3>
              <ul className="mt-3 space-y-2 text-sm text-anchor-cream-text/70">
                <li className="flex gap-2">
                  <span className="text-anchor-gold">&bull;</span>
                  <span>Advance booking required with a &pound;{EASTER_DEPOSIT_PER_PERSON} per person deposit.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-anchor-gold">&bull;</span>
                  <span>Pre-orders must be placed by <span className="font-semibold">Saturday 1pm</span>.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-anchor-gold">&bull;</span>
                  <span>Choose each guest&apos;s main in the booking flow and pay the deposit online.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <BookTableButton
                source="easter_lunch_section"
                context="sunday_lunch"
                variant="primary"
                size="lg"
                fullWidth
                className="w-full sm:w-auto sm:min-w-[240px]"
                trackingLabel="Book Easter Sunday Lunch"
                eventName="Easter Sunday Lunch"
                customHref={EASTER_BOOKING_URL}
              >
                Book Easter Sunday Lunch
              </BookTableButton>
              <Link href="/sunday-lunch" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" fullWidth className="w-full sm:w-auto">
                  View Sunday lunch menu
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* Easter Weekend Opening */}
      <Section background="gray" spacing="md">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              Easter Weekend Opening
            </h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              We&apos;re open throughout the Easter bank holiday weekend. Here&apos;s what to expect.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card variant="default">
                <CardBody className="space-y-2 p-6">
                  <h3 className="text-lg font-semibold text-anchor-gold-vivid">Good Friday &ndash; Easter Sunday</h3>
                  <p className="text-sm text-anchor-cream-text/70">
                    Open as normal with full kitchen service. Our regular evening menu is available Friday and Saturday,
                    and our Sunday roast menu on Easter Sunday.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="success" size="sm">Kitchen open</Badge>
                    <Badge variant="default" size="sm">Full menu</Badge>
                  </div>
                </CardBody>
              </Card>

              <Card variant="default">
                <CardBody className="space-y-2 p-6">
                  <h3 className="text-lg font-semibold text-anchor-gold-vivid">Easter Monday</h3>
                  <p className="text-sm text-anchor-cream-text/70">
                    Open for drinks only. Our kitchen is closed every Monday, including bank holidays.
                    Pop in for a pint, enjoy the beer garden, and wind down the long weekend.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="default" size="sm">Drinks only</Badge>
                    <Badge variant="default" size="sm">Kitchen closed</Badge>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* Beer Garden in Spring */}
      <Section background="white" spacing="md">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              The Beer Garden in Spring
            </h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              April is when our beer garden really comes alive. The sun&apos;s out, the first spring flowers are up,
              and a plane passes overhead every 90 seconds or so &mdash; which, as it turns out, is surprisingly entertaining
              with a drink in hand.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed">
              Dogs are welcome in the garden and inside the pub. Kids have space to run around while you finish your roast
              (or your second pint). It&apos;s the kind of easy Easter afternoon that doesn&apos;t need a plan.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="success" size="sm">Dog-friendly</Badge>
              <Badge variant="default" size="sm">Kids welcome</Badge>
              <Badge variant="default" size="sm">Free parking &bull; 20 spaces</Badge>
              <Badge variant="default" size="sm">Plane spotting</Badge>
            </div>
          </div>
        </Container>
      </Section>

      {/* Family Easter */}
      <Section background="gray" spacing="md">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              A Family Easter
            </h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              Easter at The Anchor is about good food and family time. A proper roast that someone else cooks
              and clears up, a garden the kids can explore, and the novelty of watching planes come in low
              over your table &mdash; something that never quite gets old, even for the grown-ups.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed">
              With free parking on site and just {HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5,
              it&apos;s easy to get to and easy to leave when the little ones have had enough.
              No rush, no fuss &mdash; just a relaxed Easter Sunday with the people who matter.
            </p>
          </div>
        </Container>
      </Section>

      {/* Booking CTA */}
      <Section background="white" spacing="lg">
        <Container size="lg">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">Book your Easter table</h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              Easter Sunday lunch is on <span className="font-semibold">{EASTER_SUNDAY_LABEL}</span>. Serving{' '}
              <span className="font-semibold">{EASTER_SUNDAY_SERVICE_WINDOW}</span> (last booking{' '}
              <span className="font-semibold">{EASTER_SUNDAY_LAST_BOOKING}</span>).
              Pre-orders and a &pound;{EASTER_DEPOSIT_PER_PERSON} per person deposit are required by Saturday 1pm.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <BookTableButton
                source="easter_cta"
                context="sunday_lunch"
                variant="primary"
                size="lg"
                fullWidth
                className="w-full sm:w-auto sm:min-w-[240px]"
                trackingLabel="Book Easter Sunday Lunch"
                eventName="Easter Sunday Lunch"
                customHref={EASTER_BOOKING_URL}
              >
                Book Easter Sunday Lunch
              </BookTableButton>
              <PhoneButton
                phone={CONTACT.phone}
                source="easter_cta"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Call {CONTACT.phone}
              </PhoneButton>
            </div>
            <p className="text-sm text-anchor-cream-text/70">
              Or visit our{' '}
              <Link href="/sunday-lunch" className="font-semibold text-anchor-gold hover:text-anchor-gold-light underline decoration-dotted">
                Sunday lunch page
              </Link>{' '}
              for the full menu.
            </p>
          </div>
        </Container>
      </Section>

      {/* Where we are */}
      <Section background="gray" spacing="lg">
        <Container size="lg">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-start">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">Where we are</h2>
              <p className="text-anchor-cream-text/70 leading-relaxed">
                The Anchor is in Stanwell Moor, Surrey (TW19 6AQ) &mdash; close to Heathrow and easy to reach from{' '}
                <Link href="/staines-pub" className="font-semibold text-anchor-gold hover:text-anchor-gold-light underline decoration-dotted">
                  Staines-upon-Thames
                </Link>
                , with free parking on site.
              </p>
              <p className="text-anchor-cream-text/70">
                Address: <span className="font-semibold text-anchor-gold-vivid">{addressLine}</span>
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/find-us" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" fullWidth className="w-full sm:w-auto">
                    Directions &amp; parking
                  </Button>
                </Link>
                <PhoneButton
                  phone={CONTACT.phone}
                  source="easter_location"
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
        </Container>
      </Section>

      <FAQAccordionWithSchema title="Easter FAQs" faqs={faqs} className="bg-anchor-bg" />

      <InternalLinkingSection
        title="More to explore at The Anchor"
        links={[
          { href: EASTER_BOOKING_URL, title: 'Book Easter Sunday lunch', description: 'Reserve online in minutes' },
          { href: '/sunday-lunch', title: 'Sunday lunch menu', description: 'Full menu and prices' },
          ...commonLinkGroups.dining,
          ...commonLinkGroups.location
        ]}
      />
    </>
  )
}
