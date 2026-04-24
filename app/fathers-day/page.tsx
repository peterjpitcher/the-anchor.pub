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
import { DEFAULT_PAGE_HEADER_IMAGE, DEFAULT_SUNDAY_LUNCH_IMAGE, DEFAULT_FOOD_IMAGE, DEFAULT_DRINKS_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

const FATHERS_DAY_DATE = '2026-06-21'
const FATHERS_DAY_LABEL = 'Sunday 21 June 2026'
const FATHERS_DAY_SERVICE_WINDOW = '1pm\u20136pm'
const FATHERS_DAY_LAST_BOOKING = '5:30pm'
const FATHERS_DAY_ROAST_PRICE_FROM = 19
const FATHERS_DAY_DEPOSIT_PER_PERSON = 10

const FATHERS_DAY_BOOKING_URL = '/book-table?purpose=sunday_lunch'

const WEBSITE_ORIGIN = 'https://www.the-anchor.pub'

export const metadata: Metadata = {
  title: "Father's Day Pub Lunch Near Heathrow",
  description:
    "Treat Dad to Father's Day 2026 at The Anchor near Heathrow. Sunday roast from \u00a319, craft beer, beer garden plane spotting. Free parking. Book now.",
  alternates: { canonical: '/fathers-day' },
  openGraph: {
    title: "Father's Day at The Anchor | Pub Lunch Near Heathrow",
    description:
      "Treat Dad to Father's Day 2026 at The Anchor near Heathrow. Sunday roast from \u00a319, craft beer, beer garden plane spotting. Free parking. Book now.",
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website'
  },
  twitter: getTwitterMetadata({
    title: "Father's Day at The Anchor | Pub Lunch Near Heathrow",
    description:
      "Treat Dad to Father's Day 2026 at The Anchor near Heathrow. Sunday roast from \u00a319, craft beer, beer garden plane spotting. Free parking. Book now.",
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  })
}

export default function FathersDayPage() {
  const addressLine = `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`
  const mapQuery = `The Anchor, ${CONTACT.address.street}, ${CONTACT.address.postcode}`

  const faqs = [
    {
      question: "What\u2019s on the Father\u2019s Day menu?",
      answer:
        "Father\u2019s Day falls on a Sunday, so the full Sunday roast menu is available \u2014 chicken, pork belly, or a vegetarian option. " +
        "Mains start from \u00a319. All served with roast potatoes, seasonal vegetables, Yorkshire pudding and gravy."
    },
    {
      question: "Do I need to book for Father\u2019s Day?",
      answer:
        "Yes. Sunday lunch requires advance booking with a \u00a310 per person deposit, placed by Saturday 1pm. " +
        "Father\u2019s Day is always popular, so booking early is strongly recommended."
    },
    {
      question: 'Is there a set menu or special pricing?',
      answer:
        "There\u2019s no separate set menu \u2014 it\u2019s our regular Sunday roast menu, which is what makes it special. " +
        "Proper food, cooked from scratch. Mains from \u00a319."
    },
    {
      question: "What time is Father\u2019s Day lunch served?",
      answer:
        "We serve Sunday lunch from 1pm to 6pm, with the last table booking at 5:30pm. " +
        "No set sittings \u2014 book a time that suits you."
    },
    {
      question: 'Is there parking?',
      answer:
        `Yes \u2014 we have 20 free parking spaces on site. No meters, no charges. ` +
        `We\u2019re about ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car.`
    }
  ]

  const fathersDayEventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${WEBSITE_ORIGIN}/fathers-day#event`,
    name: "Father\u2019s Day Lunch at The Anchor",
    description:
      `Treat Dad to Father\u2019s Day lunch at The Anchor in Stanwell Moor (TW19), near Heathrow. ` +
      `Sunday roast from \u00a3${String(FATHERS_DAY_ROAST_PRICE_FROM)}. Serving ${FATHERS_DAY_SERVICE_WINDOW}. ` +
      `Beer garden with plane spotting, free parking. Booking required with \u00a3${FATHERS_DAY_DEPOSIT_PER_PERSON} per person deposit.`,
    startDate: `${FATHERS_DAY_DATE}T13:00:00+01:00`,
    endDate: `${FATHERS_DAY_DATE}T18:00:00+01:00`,
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
      url: `${WEBSITE_ORIGIN}${FATHERS_DAY_BOOKING_URL}`,
      priceCurrency: 'GBP',
      price: String(FATHERS_DAY_ROAST_PRICE_FROM),
      availability: 'https://schema.org/InStock'
    },
    image: [
      `${WEBSITE_ORIGIN}${DEFAULT_SUNDAY_LUNCH_IMAGE}`,
      `${WEBSITE_ORIGIN}${DEFAULT_FOOD_IMAGE}`,
      `${WEBSITE_ORIGIN}${DEFAULT_DRINKS_IMAGE}`
    ],
    url: `${WEBSITE_ORIGIN}/fathers-day`
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: "Father\u2019s Day", url: '/fathers-day' }
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(fathersDayEventSchema)
        }}
      />

      <HeroWrapper
        route="/fathers-day"
        title="Father&rsquo;s Day at The Anchor"
        description={
          "A proper Sunday roast, a cold pint, planes coming in low overhead, and the family all in one place. " +
          "That\u2019s Father\u2019s Day sorted."
        }
        eyebrow={FATHERS_DAY_LABEL}
        lead={
          <p className="text-white/90 text-base sm:text-lg">
            Sunday roast from &pound;{String(FATHERS_DAY_ROAST_PRICE_FROM)} &bull; &pound;{FATHERS_DAY_DEPOSIT_PER_PERSON}pp deposit &bull; Book by Saturday 1pm
          </p>
        }
        image={{
          src: DEFAULT_PAGE_HEADER_IMAGE,
          alt: "Father\u2019s Day lunch at The Anchor near Heathrow"
        }}
        tags={[
          { label: `Serving ${FATHERS_DAY_SERVICE_WINDOW}`, variant: 'warning' },
          { label: `Last booking ${FATHERS_DAY_LAST_BOOKING}`, variant: 'default' },
          { label: `From \u00a3${String(FATHERS_DAY_ROAST_PRICE_FROM)}`, variant: 'default' },
          { label: 'Beer garden & plane spotting', variant: 'success' },
          { label: 'Booking required', variant: 'success' }
        ]}
        primaryCta={
          <BookTableButton
            source="fathers_day_hero"
            context="sunday_lunch"
            variant="primary"
            size="lg"
            fullWidth
            className="w-full sm:w-auto"
            trackingLabel="Book Father's Day Lunch"
            eventName="Father's Day Lunch"
            customHref={FATHERS_DAY_BOOKING_URL}
          >
            Book Father&apos;s Day Lunch
          </BookTableButton>
        }
        secondaryCta={
          <>
            <Link href="/find-us" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" fullWidth className="w-full sm:w-auto">
                Directions &amp; parking
              </Button>
            </Link>
            <PhoneButton
              phone={CONTACT.phone}
              source="fathers_day_hero"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Call to Book
            </PhoneButton>
          </>
        }
        secondaryInfo="Choose each guest&rsquo;s Sunday lunch main in the booking flow, then complete the &pound;10 per person deposit to secure your table."
      />

      {/* Treat Dad */}
      <Section background="white" spacing="md">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              Treat Dad to a Proper Pub Lunch
            </h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              Father&apos;s Day lands on a Sunday, which means the full roast menu is on. Chicken,
              pork belly or a vegetarian option &mdash; all cooked from scratch, served with golden roast potatoes,
              seasonal vegetables, a generous Yorkshire pudding and our signature gravy.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed">
              Mains start from <span className="font-semibold">&pound;{String(FATHERS_DAY_ROAST_PRICE_FROM)}</span>.
              We serve from <span className="font-semibold">1pm</span> to <span className="font-semibold">6pm</span>,
              last table at <span className="font-semibold">{FATHERS_DAY_LAST_BOOKING}</span>.
              Pre-orders and a &pound;{FATHERS_DAY_DEPOSIT_PER_PERSON} per person deposit are required by Saturday 1pm.
            </p>

            <div className="rounded-2xl bg-anchor-bg-raised p-6 border border-anchor-gold/15">
              <h3 className="text-lg font-semibold text-anchor-gold-vivid">Browse menus</h3>
              <p className="mt-3 text-sm text-anchor-cream-text/70 leading-relaxed">
                Planning the day? Take a look at our{' '}
                <Link
                  href="/sunday-lunch"
                  className="font-semibold text-anchor-gold hover:text-anchor-gold-light underline decoration-dotted"
                >
                  Sunday lunch menu
                </Link>
                ,{' '}
                <Link
                  href="/drinks"
                  className="font-semibold text-anchor-gold hover:text-anchor-gold-light underline decoration-dotted"
                >
                  drinks menu
                </Link>{' '}
                and{' '}
                <Link
                  href="/pizza-menu"
                  className="font-semibold text-anchor-gold hover:text-anchor-gold-light underline decoration-dotted"
                >
                  pizza menu
                </Link>
                .
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* What Dad Actually Wants */}
      <Section background="gray" spacing="md">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              What Dad Actually Wants
            </h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              Not a spa day. Not socks. A proper pub lunch with his family, a cold beer, and something
              to look at. At The Anchor, a plane passes overhead every 90 seconds &mdash; which gives
              Dad a perfectly valid reason to sit in the beer garden for as long as he likes.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed">
              With 20 free parking spaces on site, nobody&apos;s rushing to feed a meter.
              And because we&apos;re only {HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5,
              it&apos;s easy to get to from just about anywhere nearby.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default" size="sm">Proper roast</Badge>
              <Badge variant="default" size="sm">Cold beer</Badge>
              <Badge variant="default" size="sm">Planes every 90 seconds</Badge>
              <Badge variant="success" size="sm">Free parking</Badge>
              <Badge variant="default" size="sm">No rush</Badge>
            </div>
          </div>
        </Container>
      </Section>

      {/* The Beer Garden */}
      <Section background="white" spacing="md">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              The Beer Garden
            </h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              June weather. Low-flying planes. Dogs pottering about. Kids running around.
              A pint that&apos;s actually cold. Our beer garden on a summer Sunday afternoon
              is Dad&apos;s idea of a perfect Father&apos;s Day &mdash; even if he won&apos;t admit it.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed">
              Dogs are welcome inside and out. The garden has plenty of space for families,
              and there&apos;s always something to watch in the sky. It&apos;s the kind of afternoon
              where nobody checks the time.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="success" size="sm">Dog-friendly</Badge>
              <Badge variant="default" size="sm">Kids welcome</Badge>
              <Badge variant="default" size="sm">Plane spotting</Badge>
              <Badge variant="default" size="sm">Summer beer garden</Badge>
            </div>
          </div>
        </Container>
      </Section>

      {/* Gift Idea */}
      <Section background="gray" spacing="md">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              Not Sure What to Get?
            </h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              Book the table and tell Dad you&apos;re taking him to the pub. He&apos;ll love it.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed">
              A Sunday roast he doesn&apos;t have to cook, a beer he doesn&apos;t have to pour,
              and an afternoon with the family in a garden where planes skim the rooftops.
              It&apos;s not complicated. It&apos;s just good.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <BookTableButton
                source="fathers_day_gift"
                context="sunday_lunch"
                variant="primary"
                size="lg"
                fullWidth
                className="w-full sm:w-auto sm:min-w-[240px]"
                trackingLabel="Book Father's Day Lunch"
                eventName="Father's Day Lunch"
                customHref={FATHERS_DAY_BOOKING_URL}
              >
                Book Father&apos;s Day Lunch
              </BookTableButton>
              <PhoneButton
                phone={CONTACT.phone}
                source="fathers_day_gift"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Call {CONTACT.phone}
              </PhoneButton>
            </div>
          </div>
        </Container>
      </Section>

      {/* Booking CTA */}
      <Section background="white" spacing="lg">
        <Container size="lg">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">Book Dad&apos;s table</h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              Father&apos;s Day lunch is on <span className="font-semibold">{FATHERS_DAY_LABEL}</span>. Serving{' '}
              <span className="font-semibold">{FATHERS_DAY_SERVICE_WINDOW}</span> (last booking{' '}
              <span className="font-semibold">{FATHERS_DAY_LAST_BOOKING}</span>).
              Pre-orders and a &pound;{FATHERS_DAY_DEPOSIT_PER_PERSON} per person deposit are required by Saturday 1pm.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <BookTableButton
                source="fathers_day_cta"
                context="sunday_lunch"
                variant="primary"
                size="lg"
                fullWidth
                className="w-full sm:w-auto sm:min-w-[240px]"
                trackingLabel="Book Father's Day Lunch"
                eventName="Father's Day Lunch"
                customHref={FATHERS_DAY_BOOKING_URL}
              >
                Book Father&apos;s Day Lunch
              </BookTableButton>
              <PhoneButton
                phone={CONTACT.phone}
                source="fathers_day_cta"
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
                  source="fathers_day_location"
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

      <FAQAccordionWithSchema title="Father&rsquo;s Day FAQs" faqs={faqs} className="bg-anchor-bg" />

      <InternalLinkingSection
        title="More to explore at The Anchor"
        links={[
          { href: FATHERS_DAY_BOOKING_URL, title: "Book Father\u2019s Day lunch", description: 'Reserve online in minutes' },
          { href: '/sunday-lunch', title: 'Sunday lunch menu', description: 'Full menu and prices' },
          ...commonLinkGroups.dining,
          ...commonLinkGroups.location
        ]}
      />
    </>
  )
}
