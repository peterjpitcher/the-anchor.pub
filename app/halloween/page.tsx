import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { InteriorHero } from '@/components/hero'
import { PhoneButton } from '@/components/PhoneButton'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { SeasonalDynamicDetails } from '@/components/seasonal/SeasonalDynamicDetails'
import { Badge, Button, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { CONTACT, HEATHROW_TIMES, PARKING } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import type { SeasonalDynamicFields } from '@/lib/seasonal-utils'

const HALLOWEEN_BOOKING_URL = '/book-table?purpose=food'

const addressLine = `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`
const mapQuery = `The Anchor, ${CONTACT.address.street}, ${CONTACT.address.postcode}`

// A11 dynamic fields. Halloween is a CONFIRMED recurring fancy-dress disco
// (brief §5), but the THEME changes every year. Confirm this year's theme,
// DJ/entertainment, start time, ticket status and any special menu here, the
// evergreen body stands on its own with nothing set. Never invent a theme,
// music act, costume competition or special menu, leave each out until
// confirmed for the year.
// 2026 confirmed from the management database (event d52cbd18), 17 Aug 2026.
// Only fields the DB actually carries are set. No performer/DJ is named
// because none is booked in the record, and no special menu because none
// exists. Do not add either without a DB record to point at.
const HALLOWEEN_DYNAMIC: SeasonalDynamicFields & { verifiedAt?: string } = {
  // Checked against management DB event d52cbd18 on 17 Aug 2026: name, date
  // (Saturday confirmed), 8pm to midnight, free entry. Owner: Peter Pitcher.
  verifiedAt: '2026-08-17',
  occasionDate: 'Saturday 31 October 2026',
  annualTheme: 'Enter If You Dare: The House of Horrors',
  eventStartTime: '8pm',
  eventEndTime: 'midnight',
  ticketStatus: 'Free entry, no ticket needed',
  bookingStatus: 'Book a table if you want to eat before the party',
}

export const metadata: Metadata = {
  title: 'Halloween Party Near Heathrow, Free Entry',
  description:
    'Halloween party near Heathrow, Saturday 31 October. Free entry, fancy dress, free parking. This year’s theme: Enter If You Dare, The House of Horrors.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Halloween Party Near Heathrow, Free Entry | The Anchor',
    description:
      'Halloween party at The Anchor near Heathrow, Saturday 31 October, 8pm till midnight. Free entry, fancy dress and free parking. This year: The House of Horrors.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Halloween Party Near Heathrow, Free Entry | The Anchor',
    description:
      'Halloween party at The Anchor near Heathrow, Saturday 31 October, 8pm till midnight. Free entry, fancy dress and free parking. This year: The House of Horrors.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
  }),
}

const faqs = [
  {
    question: 'Is there a Halloween party at The Anchor?',
    answer:
      'Yes. This year it is Enter If You Dare: The House of Horrors, on Saturday 31 October from 8pm until midnight. Entry is free, fancy dress is encouraged and the bar is open until midnight.',
  },
  {
    question: 'Do I have to wear fancy dress?',
    answer:
      'Fancy dress is the heart of the night and very much encouraged, but it is not compulsory. Come dressed up for the full experience, or come as you are and enjoy the disco either way.',
  },
  {
    question: 'What is this year\u2019s Halloween theme?',
    answer:
      'Enter If You Dare: The House of Horrors. The fancy-dress theme changes every year, so it is never the same night twice. Come as anything that fits the theme, or just come as something spooky.',
  },
  {
    question: 'Do you serve food on Halloween?',
    answer:
      'Yes, our regular food menu is available earlier in the evening before the disco gets going. Confirmed kitchen times for the night go on our What\u2019s On page. Book a table if you\u2019d like to eat.',
  },
  {
    question: 'What Halloween events are on near me?',
    answer:
      'We run two: A Hint of Halloween Quiz Night on Wednesday 7 October, which is our normal quiz with a few spooky touches and \u00a33 entry, and the House of Horrors Halloween party on Saturday 31 October, which is free to get into. Both are in Stanwell Moor, a few minutes from Heathrow and a short drive from Staines.',
  },
  {
    question: 'How much does it cost to get in?',
    answer:
      'The Halloween party on 31 October is free entry, with no ticket needed. The Hint of Halloween quiz on 7 October is \u00a33 per person, paid in cash on arrival.',
  },
  {
    question: 'Is there parking?',
    answer:
      `Free on-site parking is available for guests, with ${PARKING.capacity} spaces. We\u2019re about ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car. You\u2019ll find us at ${addressLine}.`,
  },
]

export default function HalloweenPage() {
  return (
    <>

            <InteriorHero
        image="/images/page-headers/whats-on/whats-on.jpg"
        crumb="Halloween"
        kicker="Saturday 31 October, 8pm till midnight"
        title="Halloween at The Anchor"
        lead="Enter If You Dare: The House of Horrors is this year's Halloween party at The Anchor in Stanwell Moor. Free entry, fancy dress encouraged, music all night and the bar open until midnight. Eat before the party, park for free, and walk in."
      />

      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto space-y-12">
            {/* The fancy-dress disco */}
            <div className="space-y-4">
              <h2 className="text-h3 text-ink-strong">
                A proper local Halloween night
              </h2>
              <p className="text-ink-muted text-lg leading-relaxed">
                Halloween at The Anchor is a fancy-dress disco, our take on a proper local Halloween night.
                Think music, a dressed-up crowd and a buzzing bar, the kind of cheeky, lively evening you
                get at a real village pub rather than a stiff club night. Pull a costume together, round up
                your friends, and come and join in.
              </p>
              <p className="text-ink-muted leading-relaxed">
                The fancy-dress theme changes every year, so it never feels like the same night twice. This
                year it is <strong className="text-ink-strong">Enter If You Dare: The House of Horrors</strong>,
                on Saturday 31 October from 8pm until midnight. Entry is free and there is no ticket to buy,
                so bring whoever you like. Everything on the night is listed on our{' '}
                <Link href="/whats-on" className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted">
                  What&apos;s On page
                </Link>
                {' '}alongside the rest of our Halloween events.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="green">Fancy-dress disco</Badge>
                <Badge variant="green">House of Horrors</Badge>
                <Badge variant="success">Free entry</Badge>
                <Badge variant="success">Free parking</Badge>
                <Badge variant="green">Dog friendly</Badge>
              </div>
            </div>

            {/* This year's theme (A11 dynamic block) */}
            <SeasonalDynamicDetails
              fields={HALLOWEEN_DYNAMIC}
              heading="This year's Halloween"
              intro="Here's what's confirmed for this year's Halloween party at The Anchor."
            />

            {/* Food & Drink */}
            <div className="space-y-4">
              <h2 className="text-h3 text-ink-strong">
                Food &amp; drink
              </h2>
              <p className="text-ink-muted leading-relaxed">
                Our regular food menu is available earlier in the evening, so you can come for dinner before the
                disco gets going. Confirmed kitchen times for the night go on our What&apos;s On page. Take a look at
                our{' '}
                <Link href="/food-menu" className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted">
                  food menu
                </Link>{' '}
                and{' '}
                <Link href="/drinks" className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted">
                  drinks menu
                </Link>{' '}
                to plan ahead.
              </p>
            </div>

            {/* Families welcome */}
            <div className="space-y-4">
              <h2 className="text-h3 text-ink-strong">
                Families welcome
              </h2>
              <p className="text-ink-muted leading-relaxed">
                The Anchor is a family-friendly pub, and children are very welcome, with the beer garden giving
                little ones plenty of space. If you&apos;re bringing the family along, give us a call and we&apos;ll talk
                you through what works best for this year&apos;s night.
              </p>
            </div>

            {/* Booking */}
            <Card accent>
              <CardBody className="space-y-4">
                <h2 className="text-h4 text-ink-strong">Booking</h2>
                <p className="text-ink-muted leading-relaxed">
                  Walk-ins are welcome for drinks all evening. If you&apos;d like to eat before the disco, we recommend
                  booking a table. The party itself is free entry with no ticket, so you can just turn up for that.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild variant="primary" size="lg" fullWidth className="w-full sm:w-auto sm:min-w-[220px]">
                    <a href={HALLOWEEN_BOOKING_URL}>Book a Table for Food</a>
                  </Button>
                  <PhoneButton
                    phone={CONTACT.phone}
                    source="halloween_booking"
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Call {CONTACT.phone}
                  </PhoneButton>
                </div>
                <p className="text-sm text-ink-muted">
                  Tables for 8+ guests, please call.
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <CtaBand
        title="Halloween at The Anchor, Saturday 31 October"
        copy="Enter If You Dare: The House of Horrors runs from 8pm until midnight. Free entry, fancy dress encouraged and free parking. Book a table if you want to eat first, or just walk in."
        primary={
          <Button asChild variant="primary" size="lg">
            <a href={HALLOWEEN_BOOKING_URL}>Book a Table</a>
          </Button>
        }
        secondary={
          <PhoneButton
            phone={CONTACT.phone}
            source="halloween_cta"
            variant="outline"
            size="lg"
          >
            Call or WhatsApp us on {CONTACT.phone}
          </PhoneButton>
        }
      />

      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto space-y-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              <div className="space-y-4">
                <h2 className="text-h3 text-ink-strong">
                  Where we are
                </h2>
                <p className="text-ink-muted leading-relaxed">
                  The Anchor is in Stanwell Moor, Surrey (TW19 6AQ), about {HEATHROW_TIMES.terminal5} minutes
                  from Heathrow Terminal 5, with {PARKING.capacity} free on-site parking spaces.
                </p>
                <p className="text-ink-muted">
                  Address: <span className="font-semibold text-ink-strong">{addressLine}</span>
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/find-us" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" fullWidth className="w-full sm:w-auto">
                      Directions &amp; parking
                    </Button>
                  </Link>
                  <PhoneButton
                    phone={CONTACT.phone}
                    source="halloween_location"
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

      <FAQAccordionWithSchema title="Halloween FAQs" faqs={faqs} />

      <InternalLinkingSection
        title="More to explore at The Anchor"
        links={[
          { href: HALLOWEEN_BOOKING_URL, title: 'Book a Table', description: 'Reserve online in minutes' },
          { href: '/whats-on', title: "What's On", description: 'Upcoming events and entertainment' },
          ...commonLinkGroups.dining,
          ...commonLinkGroups.location,
        ]}
      />
    </>
  )
}
