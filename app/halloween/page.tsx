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
const HALLOWEEN_DYNAMIC: SeasonalDynamicFields = {}

export const metadata: Metadata = {
  title: 'Halloween Fancy-Dress Disco Near Heathrow',
  description:
    'Halloween at The Anchor near Heathrow: a fancy-dress disco with a different theme every year. A proper local Halloween night with music, drinks and a full bar. Free parking. Check this year’s details, book a table or walk in.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Halloween Fancy-Dress Disco Near Heathrow | The Anchor',
    description:
      'A fancy-dress Halloween disco at The Anchor near Heathrow, with a different theme every year. Music, drinks and a proper local Halloween night. Free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Halloween Fancy-Dress Disco Near Heathrow | The Anchor',
    description:
      'A fancy-dress Halloween disco at The Anchor near Heathrow, with a different theme every year. Music, drinks and a proper local Halloween night. Free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
  }),
}

const faqs = [
  {
    question: 'Is there a Halloween party at The Anchor?',
    answer:
      'Yes. Halloween at The Anchor is a fancy-dress disco, a proper local Halloween night with music and drinks. The theme changes every year, so check this year\u2019s details on our What\u2019s On page or give us a call.',
  },
  {
    question: 'Do I have to wear fancy dress?',
    answer:
      'Fancy dress is the heart of the night and very much encouraged, but it is not compulsory. Come dressed up for the full experience, or come as you are and enjoy the disco either way.',
  },
  {
    question: 'What is this year\u2019s Halloween theme?',
    answer:
      'The fancy-dress theme changes every year. We confirm each year\u2019s theme on our What\u2019s On page closer to the date, so check there or call us for the latest.',
  },
  {
    question: 'Do you serve food on Halloween?',
    answer:
      'Yes, our regular food menu is available earlier in the evening before the disco gets going. Confirmed kitchen times for the night go on our What\u2019s On page. Book a table if you\u2019d like to eat.',
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
        kicker="31 October"
        title="Halloween at The Anchor"
        lead="Fancy dress, music, drinks and a proper local Halloween night. Our annual Halloween fancy-dress disco at The Anchor in Stanwell Moor has a different theme every year, with food earlier in the evening, a full bar and free parking. Check this year's details, book a table or walk in."
      />

      <section className="py-section-y bg-surface">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-12">
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
                The fancy-dress theme changes every year, so it never feels like the same night twice. We
                confirm each year&apos;s theme and timings on our{' '}
                <Link href="/whats-on" className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted">
                  What&apos;s On page
                </Link>
                , so check there for this year&apos;s details before you plan your costume.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="green">Fancy-dress disco</Badge>
                <Badge variant="green">Different theme every year</Badge>
                <Badge variant="green">Full bar</Badge>
                <Badge variant="success">Free parking</Badge>
                <Badge variant="green">Dog friendly</Badge>
              </div>
            </div>

            {/* This year's theme (A11 dynamic block) */}
            <SeasonalDynamicDetails
              fields={HALLOWEEN_DYNAMIC}
              heading="This year's Halloween"
              intro="The fancy-dress theme changes every year. Here's what's confirmed for this year's Halloween disco at The Anchor."
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
                  booking a table. Check this year&apos;s confirmed timings on our What&apos;s On page.
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
        title="Check this year's Halloween details"
        copy="Our fancy-dress Halloween disco at The Anchor in Stanwell Moor, with a different theme every year. Check this year's theme and timings on What's On, then book a table or walk in."
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
        <Container size="lg">
          <div className="mx-auto max-w-6xl space-y-8">
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
