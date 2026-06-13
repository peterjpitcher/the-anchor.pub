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

const HALLOWEEN_BOOKING_URL = '/book-table?purpose=food'

const addressLine = `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`
const mapQuery = `The Anchor, ${CONTACT.address.street}, ${CONTACT.address.postcode}`

export const metadata: Metadata = {
  title: 'Halloween Near Heathrow | The Anchor, Stanwell Moor',
  description:
    'Spend Halloween at The Anchor near Heathrow on Saturday 31 October 2026. Food menu, full bar, beer garden, free parking and dog-friendly. Book a table or walk in.',
  alternates: { canonical: '/halloween' },
  openGraph: {
    title: 'Halloween Near Heathrow | The Anchor, Stanwell Moor',
    description:
      'Spend Halloween at The Anchor near Heathrow on Saturday 31 October 2026. Food menu, full bar, beer garden, free parking and dog-friendly. Book a table or walk in.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Halloween Near Heathrow | The Anchor, Stanwell Moor',
    description:
      'Spend Halloween at The Anchor near Heathrow on Saturday 31 October 2026. Food menu, full bar, beer garden, free parking and dog-friendly. Book a table or walk in.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
  }),
}

const faqs = [
  {
    question: 'Is there a dress code for Halloween?',
    answer:
      'No, there is no dress code. Come as you are and enjoy the evening.',
  },
  {
    question: 'Is The Anchor family-friendly on Halloween?',
    answer:
      'Earlier in the evening (before 8pm) is great for families. Children are very welcome, and the beer garden gives little ones plenty of space. Later in the evening the crowd is more grown-up.',
  },
  {
    question: 'Do you serve food on Halloween?',
    answer:
      'Yes, our regular food menu is available earlier in the evening. Halloween falls on a Saturday in 2026, so the kitchen is open 1pm\u20137pm. Book a table if you\u2019d like to eat.',
  },
  {
    question: 'Is there parking?',
    answer:
      `Free on-site parking is available for guests. We\u2019re about ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car. You\u2019ll find us at ${addressLine}.`,
  },
]

export default function HalloweenPage() {
  return (
    <>

            <InteriorHero
        image="/images/page-headers/whats-on/whats-on.jpg"
        crumb="Halloween"
        kicker="Saturday 31 October 2026"
        title="Halloween at The Anchor"
        lead="Spend Halloween at The Anchor in Stanwell Moor on Saturday 31 October. Our full food menu and bar are on, the beer garden sits right under the Heathrow flight path, and parking is free. Book a table or walk in."
      />

      <section className="py-section-y bg-surface">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-12">
            {/* Halloween at The Anchor */}
            <div className="space-y-4">
              <h2 className="text-h3 text-ink-strong">
                Halloween at The Anchor
              </h2>
              <p className="text-ink-muted text-lg leading-relaxed">
                Halloween falls on a Saturday in 2026, so come and spend it with us in Stanwell Moor.
                The full food menu and bar are on, and you are welcome to drop in for a drink or settle
                in for dinner.
              </p>
              <p className="text-ink-muted leading-relaxed">
                There&apos;s something about the beer garden here that&apos;s hard to beat. Stanwell
                Moor sits right under the Heathrow flight path, so you get planes lit up overhead, the
                autumn air, and a drink in hand. It adds to the atmosphere in a way you wouldn&apos;t expect.
              </p>
            </div>

            {/* Food & Drink */}
            <div className="space-y-4">
              <h2 className="text-h3 text-ink-strong">
                Food &amp; Drink
              </h2>
              <p className="text-ink-muted leading-relaxed">
                Our regular food menu is available earlier in the evening (the kitchen is open
                1pm&ndash;7pm on Saturdays), so you can come for dinner before settling in for the night.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="green">Full bar</Badge>
                <Badge variant="green">Food menu (until 7pm)</Badge>
                <Badge variant="green">Free parking</Badge>
                <Badge variant="green">Dog friendly</Badge>
              </div>
            </div>

            {/* Families Welcome */}
            <div className="space-y-4">
              <h2 className="text-h3 text-ink-strong">
                Families Welcome
              </h2>
              <p className="text-ink-muted leading-relaxed">
                Earlier in the evening, before about 8pm, The Anchor is a great
                spot for families. Children are very welcome, and the beer garden gives little ones
                plenty of space. Later in the evening the crowd is more grown-up, so if you&apos;re bringing
                little ones, the earlier the better.
              </p>
            </div>

            {/* Booking */}
            <Card accent>
              <CardBody className="space-y-4">
                <h2 className="text-h4 text-ink-strong">Booking</h2>
                <p className="text-ink-muted leading-relaxed">
                  Walk-ins are welcome for drinks all evening. If you&apos;d like to eat, we recommend booking
                  a table, the kitchen is open 1pm&ndash;7pm on Saturdays.
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
        title="Join us on Halloween"
        copy="Saturday 31 October 2026. Food, a full bar and a warm welcome at The Anchor in Stanwell Moor. Book a table or walk in."
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
            Call {CONTACT.phone}
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
                  from Heathrow Terminal 5, with free on-site parking.
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
