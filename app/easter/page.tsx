import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { LaunchAnnouncement } from '@/components/announcements/LaunchAnnouncement'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { Badge, Button, Card, CardBody, Container, Section } from '@/components/ui'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { CONTACT, HEATHROW_TIMES } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

// Easter 2026 (5 April) is past at time of authoring. The page persists for
// rolling SEO and Easter 2027 (Sunday 4 April 2027). Copy describes the
// post-launch walk-in model unconditionally.
const EASTER_SUNDAY_LABEL = 'Sunday 4 April 2027'
const EASTER_SUNDAY_SERVICE_WINDOW = '1pm–6pm'
const EASTER_SUNDAY_LAST_BOOKING = '5:30pm'
const EASTER_ROAST_PRICE_FROM = 16

const EASTER_BOOKING_URL = '/book-table'

export const metadata: Metadata = {
  title: 'Easter Sunday Roast & Beer Garden',
  description:
    'Celebrate Easter at The Anchor near Heathrow. Easter Sunday roast served 1pm–6pm, from £16. Walk in or book ahead. Dog-friendly beer garden, free parking.',
  alternates: { canonical: '/easter' },
  openGraph: {
    title: 'Easter at The Anchor | Sunday Roast & Beer Garden',
    description:
      'Celebrate Easter at The Anchor near Heathrow. Easter Sunday roast served 1pm–6pm, from £16. Walk in or book ahead. Dog-friendly beer garden, free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website'
  },
  twitter: getTwitterMetadata({
    title: 'Easter at The Anchor | Sunday Roast & Beer Garden',
    description:
      'Celebrate Easter at The Anchor near Heathrow. Easter Sunday roast served 1pm–6pm, from £16. Walk in or book ahead. Dog-friendly beer garden, free parking.',
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
        'We’re open throughout the Easter weekend. Good Friday through Easter Sunday: normal hours with full kitchen service. ' +
        'Easter Monday: open for drinks only, the kitchen is closed on Mondays, including bank holidays.'
    },
    {
      question: 'Do I need to book for Easter Sunday roast?',
      answer:
        'Walk-ins are welcome on Easter Sunday between 1pm and 6pm, no pre-order needed. Booking is still recommended for groups, especially for parties of six or more. ' +
        'Groups of 10 or more take a £10 per person deposit on booking, fully deducted from the bill on the day.'
    },
    {
      question: 'Is The Anchor dog-friendly?',
      answer:
        'Absolutely. Well-behaved dogs are welcome inside the pub and in the beer garden. Water bowls are always available. ' +
        'It’s a great spot for a post-walk Easter Sunday roast.'
    },
    {
      question: 'What’s on the Easter menu?',
      answer:
        'Our Easter Sunday menu is the same as our regular Sunday roast, with roast turkey, roast pork, roast beef, pies, or a vegan wellington. ' +
        'Mains start from £16. All served with roast potatoes, seasonal vegetables and gravy, with Yorkshire pudding on sliced roasts.'
    },
    {
      question: 'Is there parking?',
      answer:
        `Yes, we have ${20} free parking spaces on site. No meters, no charges. ` +
        `We’re about ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car.`
    }
  ]

  return (
    <>
            <HeroWrapper
        route="/easter"
        title="Easter at The Anchor"
        description={
          `Gather the family for a proper Easter Sunday roast at The Anchor in Stanwell Moor, ` +
          `cooked from scratch, served ${EASTER_SUNDAY_SERVICE_WINDOW}, with free parking and a dog-friendly beer garden.`
        }
        eyebrow={EASTER_SUNDAY_LABEL}
        lead={
          <p className="text-white/90 text-base sm:text-lg">
            Sunday roast from &pound;{String(EASTER_ROAST_PRICE_FROM)} &bull; Walk in or book ahead &bull; Served {EASTER_SUNDAY_SERVICE_WINDOW}
          </p>
        }
        image={{
          src: DEFAULT_PAGE_HEADER_IMAGE,
          alt: 'Easter Sunday roast at The Anchor near Heathrow'
        }}
        enableSmartCtas={true}
        showContextStrip={true}
      />

      {/* Easter Sunday Roast */}
      <Section background="white" spacing="md">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <LaunchAnnouncement variant="banner" />
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
              Easter Sunday Roast
            </h2>
            <p className="text-anchor-cream-text/70 text-lg leading-relaxed">
              Easter Sunday is one of those meals that deserves a proper table. Join us at The Anchor for a traditional roast
              cooked from scratch, the kind of lunch that marks the start of spring and brings the whole family together.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed">
              Choose from roast turkey, roast pork, roast beef, pies or a vegan wellington, all served with golden roast potatoes,
              seasonal vegetables and gravy. Yorkshire puddings come with the sliced roasts. Mains start from{' '}
              <span className="font-semibold">&pound;{String(EASTER_ROAST_PRICE_FROM)}</span>.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed">
              We serve from <span className="font-semibold">1pm</span> to <span className="font-semibold">6pm</span>,
              with the last table booking at <span className="font-semibold">{EASTER_SUNDAY_LAST_BOOKING}</span>.
              No set sittings, book a time that suits you and enjoy your meal at a comfortable pace.
            </p>

            <div className="rounded-2xl bg-anchor-green-raised p-6 border border-anchor-gold-dark/15">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-anchor-gold-bright">How Sunday works</h3>
              <ul className="mt-3 space-y-2 text-sm text-anchor-cream-text/70">
                <li className="flex gap-2">
                  <span className="text-anchor-gold-dark">&bull;</span>
                  <span>Walk-ins are welcome between <span className="font-semibold">1pm and 6pm</span>, no pre-order needed.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-anchor-gold-dark">&bull;</span>
                  <span>Booking is still recommended for groups, especially parties of six or more.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-anchor-gold-dark">&bull;</span>
                  <span>Groups of 10 or more take a &pound;10 per person deposit on booking, fully deducted from the bill on the day.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <BookTableButton
                source="easter_lunch_section"
                context="easter_sunday"
                variant="primary"
                size="lg"
                fullWidth
                className="w-full sm:w-auto sm:min-w-[240px]"
                trackingLabel="Book Easter Sunday Roast"
                eventName="Easter Sunday Roast"
                customHref={EASTER_BOOKING_URL}
              >
                Book Easter Sunday Roast
              </BookTableButton>
              <Link href="/sunday-roast" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" fullWidth className="w-full sm:w-auto">
                  View Sunday roast menu
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
                  <h3 className="text-lg font-semibold text-anchor-gold-bright">Good Friday &ndash; Easter Sunday</h3>
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
                  <h3 className="text-lg font-semibold text-anchor-gold-bright">Easter Monday</h3>
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
              and a plane passes overhead every 90 seconds or so, which, as it turns out, is surprisingly entertaining
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
              over your table, something that never quite gets old, even for the grown-ups.
            </p>
            <p className="text-anchor-cream-text/70 leading-relaxed">
              With free parking on site and just {HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5,
              it&apos;s easy to get to and easy to leave when the little ones have had enough.
              No rush, no fuss, just a relaxed Easter Sunday with the people who matter.
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
              Easter Sunday roast is on <span className="font-semibold">{EASTER_SUNDAY_LABEL}</span>. Serving{' '}
              <span className="font-semibold">{EASTER_SUNDAY_SERVICE_WINDOW}</span> (last booking{' '}
              <span className="font-semibold">{EASTER_SUNDAY_LAST_BOOKING}</span>).
              Walk in or book ahead, deposits only apply to groups of 10 or more.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <BookTableButton
                source="easter_cta"
                context="easter_sunday"
                variant="primary"
                size="lg"
                fullWidth
                className="w-full sm:w-auto sm:min-w-[240px]"
                trackingLabel="Book Easter Sunday Roast"
                eventName="Easter Sunday Roast"
                customHref={EASTER_BOOKING_URL}
              >
                Book Easter Sunday Roast
              </BookTableButton>
              <PhoneButton
                phone={CONTACT.phone}
                source="easter_cta"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                Call {CONTACT.phone}
              </PhoneButton>
            </div>
            <p className="text-sm text-anchor-cream-text/70">
              Or browse{' '}
              <Link href="/sunday-roast" className="font-semibold text-anchor-gold-dark hover:text-anchor-gold underline decoration-dotted">
                our Sunday roast menu
              </Link>{' '}
              for the full lineup.
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
                The Anchor is in Stanwell Moor, Surrey (TW19 6AQ), close to Heathrow and easy to reach from{' '}
                <Link href="/staines-pub" className="font-semibold text-anchor-gold-dark hover:text-anchor-gold underline decoration-dotted">
                  Staines-upon-Thames
                </Link>
                , with free parking on site.
              </p>
              <p className="text-anchor-cream-text/70">
                Address: <span className="font-semibold text-anchor-gold-bright">{addressLine}</span>
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/find-us" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" fullWidth className="w-full sm:w-auto">
                    Directions &amp; parking
                  </Button>
                </Link>
                <PhoneButton
                  phone={CONTACT.phone}
                  source="easter_location"
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
        </Container>
      </Section>

      <FAQAccordionWithSchema title="Easter FAQs" faqs={faqs} className="bg-anchor-green-deep" />

      <InternalLinkingSection
        title="More to explore at The Anchor"
        links={[
          { href: EASTER_BOOKING_URL, title: 'Book Easter Sunday roast', description: 'Reserve online in minutes' },
          { href: '/sunday-roast', title: 'Sunday roast near Heathrow', description: 'Full menu, prices and walk-in info' },
          ...commonLinkGroups.dining,
          ...commonLinkGroups.location
        ]}
      />
    </>
  )
}
