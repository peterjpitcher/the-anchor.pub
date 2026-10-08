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
import { getHalloweenCopy } from '@/lib/seasonal/halloween'

const HALLOWEEN_BOOKING_URL = '/book-table?purpose=food'
const GENERAL_BOOKING_URL = '/book-table'

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

// Title, description and both social cards switch with the page body, from the
// one clock read in lib/seasonal/halloween.ts. Before this only the title and
// description changed, so a link shared on 1 November still carried
// "Saturday 31 October, 8pm till midnight" in its preview.
export function generateMetadata(): Metadata {
  const copy = getHalloweenCopy()

  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: { canonical: './' },
    openGraph: {
      title: copy.socialTitle,
      description: copy.socialDescription,
      images: [DEFAULT_PAGE_HEADER_IMAGE],
      type: 'website',
    },
    twitter: getTwitterMetadata({
      title: copy.socialTitle,
      description: copy.socialDescription,
      images: [DEFAULT_PAGE_HEADER_IMAGE],
    }),
  }
}

/**
 * Everything on this page that names this year's date, times, theme or food
 * service comes from getHalloweenCopy(), or sits behind `partyOver` below.
 *
 * Without that, the page states "Saturday 31 October, 8pm till midnight, free
 * entry" as flat fact, so on 1 November it would still be inviting people to a
 * party that had already happened, and would carry on doing so until someone
 * remembered to edit it. Seasonal pages are most visited exactly when the date
 * is closest, which is also when being wrong costs most.
 */
export default function HalloweenPage() {
  const copy = getHalloweenCopy(new Date(), addressLine)
  const partyOver = copy.partyOver
  const bookingUrl = partyOver ? GENERAL_BOOKING_URL : HALLOWEEN_BOOKING_URL

  return (
    <>
      <InteriorHero
        image="/images/page-headers/whats-on/whats-on.jpg"
        crumb="Halloween"
        kicker={copy.heroKicker}
        title="Halloween at The Anchor"
        lead={copy.heroLead}
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
                Think music, a dressed-up crowd and a buzzing bar, the kind of lively evening you
                get at a real village pub rather than a stiff club night.
                {partyOver ? null : ' Pull a costume together, round up your friends, and come and join in.'}
              </p>
              {partyOver ? (
                <p className="text-ink-muted leading-relaxed">
                  The fancy-dress theme changes every year, so it never feels like the same night twice. This
                  year&apos;s party has been and gone. Next year&apos;s theme goes up here and on our{' '}
                  <Link href="/whats-on" className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted">
                    What&apos;s On page
                  </Link>
                  {' '}once it is confirmed.
                </p>
              ) : (
                <p className="text-ink-muted leading-relaxed">
                  The fancy-dress theme changes every year, so it never feels like the same night twice. This
                  year it is <strong className="text-ink-strong">Enter If You Dare: The House of Horrors</strong>,
                  on Saturday 31 October from 8pm until midnight. Entry is free and there is no ticket to buy,
                  so bring whoever you like. It is listed on our{' '}
                  <Link href="/whats-on" className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted">
                    What&apos;s On page
                  </Link>
                  {' '}too.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="green">Fancy-dress disco</Badge>
                {partyOver ? null : <Badge variant="green">House of Horrors</Badge>}
                {partyOver ? null : <Badge variant="success">Free entry</Badge>}
                <Badge variant="success">Free parking</Badge>
                <Badge variant="green">Dog friendly</Badge>
              </div>
            </div>

            {/* This year's details. SeasonalDynamicDetails renders nothing when it
                has no fields, so the "been and gone" line could never show from
                inside it. After the party it is its own block. */}
            {partyOver ? (
              <Card accent>
                <CardBody className="space-y-2">
                  <h3 className="text-h4 text-ink-strong">This year&apos;s Halloween</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    This year&apos;s Halloween party has been and gone. Next year&apos;s theme goes up here once it is confirmed.
                  </p>
                </CardBody>
              </Card>
            ) : (
              <SeasonalDynamicDetails
                fields={HALLOWEEN_DYNAMIC}
                heading="This year's Halloween"
                intro="Here's what's confirmed for this year's Halloween party at The Anchor."
              />
            )}

            {/* Food & Drink. These are the kitchen times for 31 October 2026 only
                (SSOT section 10, Party nights), so they go when the night has. */}
            {partyOver ? null : (
              <div className="space-y-4">
                <h2 className="text-h3 text-ink-strong">
                  Food &amp; drink
                </h2>
                <p className="text-ink-muted leading-relaxed">
                  The full menu runs until 6pm, so come early if you want dinner. The kitchen is closed from 6pm to
                  9pm, then pizza is served from 9pm to midnight, to eat in or take away. Take a look at
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
            )}

            {/* Families welcome */}
            <div className="space-y-4">
              <h2 className="text-h3 text-ink-strong">
                Families welcome
              </h2>
              <p className="text-ink-muted leading-relaxed">
                The Anchor is a family-friendly pub, and children are very welcome, with the beer garden giving
                little ones plenty of space. If you&apos;re bringing the family along, give us a call and we&apos;ll talk
                you through what works best for the night.
              </p>
            </div>

            {/* Booking. About eating before this year's party, so it goes too. */}
            {partyOver ? null : (
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
            )}
          </div>
        </Container>
      </section>

      <CtaBand
        title={copy.ctaTitle}
        copy={copy.ctaCopy}
        primary={
          partyOver ? (
            <Button asChild variant="primary" size="lg">
              <Link href="/whats-on">See what&apos;s on</Link>
            </Button>
          ) : (
            <Button asChild variant="primary" size="lg">
              <a href={HALLOWEEN_BOOKING_URL}>Book a Table</a>
            </Button>
          )
        }
        secondary={
          <PhoneButton
            phone={CONTACT.phone}
            source="halloween_cta"
            variant="outline"
            size="lg"
            wrap
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
                  <Button asChild variant="outline" size="lg" fullWidth className="w-full sm:w-auto">
                    <Link href="/find-us" className="w-full sm:w-auto">
                      Directions &amp; parking
                    </Link>
                  </Button>
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

      <FAQAccordionWithSchema title="Halloween FAQs" faqs={copy.faqs} />

      <InternalLinkingSection
        title="More to explore at The Anchor"
        links={[
          { href: bookingUrl, title: 'Book a Table', description: 'Reserve online in minutes' },
          { href: '/whats-on', title: "What's On", description: 'Upcoming events and entertainment' },
          ...commonLinkGroups.dining,
          ...commonLinkGroups.location,
        ]}
      />
    </>
  )
}
