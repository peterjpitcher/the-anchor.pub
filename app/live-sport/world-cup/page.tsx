import Link from 'next/link'
import type { Metadata } from 'next'
import { AlertBox, Button, Container, CTASection, FeatureGrid, SectionHeader } from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BRAND, CONTACT, HEATHROW_TIMES, PARKING } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { WorldCup2026Fixtures } from '@/components/features/world-cup/WorldCup2026Fixtures'
import { getWorldCup2026Matches } from '@/lib/world-cup-2026'
import type { WorldCup2026Match } from '@/lib/world-cup-2026'
import { PhoneButton } from '@/components/PhoneButton'
import { DirectionsButton } from '@/components/DirectionsButton'
import { WhatsAppLink } from '@/components/WhatsAppLink'

const AREA_LINKS = [
  { label: 'Ashford', href: '/ashford-pub' },
  { label: 'Bedfont', href: '/bedfont-pub' },
  { label: 'Colnbrook', href: '/colnbrook-pub' },
  { label: 'Egham', href: '/egham-pub' },
  { label: 'Feltham', href: '/feltham-pub' },
  { label: 'Horton', href: '/horton-pub' },
  { label: 'Heathrow Hotels', href: '/heathrow-hotels-pub' },
  { label: 'Longford', href: '/longford-pub' },
  { label: 'M25 Junction 14', href: '/m25-junction-14-pub' },
  { label: 'Staines', href: '/staines-pub' },
  { label: 'Stanwell', href: '/stanwell-pub' },
  { label: 'Sunbury', href: '/sunbury-pub' },
  { label: 'Windsor', href: '/windsor-pub' },
  { label: 'Wraysbury', href: '/wraysbury-pub' },
]

export const metadata: Metadata = {
  title: 'World Cup Pub Near Me | Watch 2026 Live',
  description: `FIFA World Cup 2026 kick-off times (UK) and table bookings at ${BRAND.name}, Stanwell Moor. 4 screens, sound on, free parking near Heathrow T5.`,
  openGraph: {
    title: 'Watch FIFA World Cup 2026 at The Anchor',
    description: 'All match dates in one place. 4 screens, sound on for games we show, and proper pub atmosphere near Heathrow.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Watch FIFA World Cup 2026 at The Anchor',
    description: 'All match dates in one place. 4 screens, sound on for games we show.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
  }),
  alternates: {
    canonical: '/live-sport/world-cup',
  },
}

export const revalidate = 60 * 60 * 24 // 24 hours

export default async function WorldCupPage() {
  let matches: WorldCup2026Match[] = []
  try {
    matches = await getWorldCup2026Matches()
  } catch (error) {
    console.warn('World Cup fixtures fetch failed', error)
  }

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'FIFA World Cup 2026 Live Screenings',
    startDate: '2026-06-11',
    endDate: '2026-07-19',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: BRAND.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: CONTACT.address.street,
        addressLocality: CONTACT.address.town,
        postalCode: CONTACT.address.postcode,
        addressCountry: 'GB',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: CONTACT.coordinates.lat,
        longitude: CONTACT.coordinates.lng,
      },
      telephone: CONTACT.phone,
      url: 'https://www.the-anchor.pub',
    },
    description: `Watch FIFA World Cup 2026 matches live on big screens at ${BRAND.name} in Stanwell Moor near Heathrow.`,
    image: DEFAULT_PAGE_HEADER_IMAGE,
    organizer: {
      '@type': 'Organization',
      name: BRAND.name,
      url: 'https://www.the-anchor.pub',
    },
    performer: {
      '@type': 'Organization',
      name: 'FIFA',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      url: 'https://www.the-anchor.pub/book-table',
      validFrom: '2025-01-01',
      description: 'Free entry, table booking recommended',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([eventSchema]) }}
      />

            <HeroWrapper
        route="/live-sport/world-cup"
        title="Watch FIFA World Cup 2026 Live"
        description="All match dates • 4 screens • Sound on for games we show • Kitchen open."
        variant="default"
        enableSmartCtas={true}
        showContextStrip={true}
      />

      <section className="bg-anchor-bg py-8">
        <Container>
          <div className="mx-auto max-w-5xl text-center">
            <PageTitle className="mb-4 text-anchor-gold-vivid">World Cup Pub Near Me — Your Match Base Near Heathrow</PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              The FIFA World Cup 2026 runs from <strong>11 June to 19 July 2026</strong>. If you’re looking for a proper pub
              atmosphere near Heathrow ({HEATHROW_TIMES.terminal5} minutes from Terminal 5), you’re in the right place.
            </p>
            <p className="mt-4 text-lg text-anchor-cream-text/70">
              Use the fixtures list below to pick a match we’re showing, then book a table so you’ve got a screen view.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-anchor-bg-raised py-10">
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl bg-anchor-bg-card p-6 shadow-sm ring-1 ring-anchor-gold/15">
                <h2 className="text-lg font-bold text-anchor-gold-vivid">What We’re Showing</h2>
                <ul className="mt-4 space-y-2 text-sm text-anchor-cream-text/70">
                  <li>Matches that kick off during opening hours</li>
                  <li>Or up to 1 hour before we open</li>
                  <li>Matches outside those hours aren’t shown</li>
                  <li>If it’s busy at close, we’ll stay open while it’s on</li>
                  <li>If we’re empty at close, we’ll close as normal</li>
                </ul>
                <p className="mt-4 text-xs text-anchor-cream-text/55">
                  Core hours: Mon–Thu 4pm–10pm • Fri 4pm–midnight • Sat 12pm–midnight • Sun 12pm–10pm.
                </p>
                <div className="mt-4">
                  <Link href="#fixtures" className="font-semibold text-anchor-gold hover:underline">
                    See fixtures we’re showing →
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl bg-anchor-bg-card p-6 shadow-sm ring-1 ring-anchor-gold/15" id="booking-rules">
                <h2 className="text-lg font-bold text-anchor-gold-vivid">Booking Rules</h2>
                <ul className="mt-4 space-y-2 text-sm text-anchor-cream-text/70">
                  <li>Book any showing match now</li>
                  <li>No deposits and no minimum spend</li>
                  <li>Large groups: book early for the best tables</li>
                  <li>Tables are held until kick-off, then released</li>
                </ul>
                <p className="mt-4 text-xs text-anchor-cream-text/55">Booking takes you to our in-site table booking form.</p>
              </div>

              <div className="rounded-2xl bg-anchor-bg-card p-6 shadow-sm ring-1 ring-anchor-gold/15">
                <h2 className="text-lg font-bold text-anchor-gold-vivid">Matchday Setup</h2>
                <ul className="mt-4 space-y-2 text-sm text-anchor-cream-text/70">
                  <li>4 screens (no projector)</li>
                  <li>Sound on for all games we show (reviewed if another event clashes)</li>
                  <li>Kitchen open during our opening hours</li>
                  <li>Free parking ({PARKING.capacity} spaces)</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <BookTableButton
                source="world_cup_quick_cta"
                context="sport"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Book a Table
              </BookTableButton>
              <Link href="#fixtures" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  See Fixtures
                </Button>
              </Link>
              <PhoneButton
                phone={CONTACT.phone}
                source="world_cup_quick_cta"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                Call
              </PhoneButton>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <WhatsAppLink
                  phone={CONTACT.phone}
                  source="world_cup_quick_cta"
                  message="Hi! I’d like to book a table for a World Cup match."
                  showIcon={false}
                >
                  WhatsApp
                </WhatsAppLink>
              </Button>
              <DirectionsButton
                href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ"
                source="world_cup_quick_cta"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                Directions
              </DirectionsButton>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-bg" id="fixtures">
        <Container>
          <SectionHeader title="FIFA World Cup 2026 Match Dates" subtitle="All times UK (BST). Fixtures subject to change." />

          <AlertBox
            variant="info"
            className="mx-auto mb-10 max-w-5xl"
            title="How this fixtures list works"
            content={
              <div className="space-y-3 text-sm">
                <p>
                  By default you’ll see <strong>Showing Only</strong> matches (plus any we’ll <strong>open early</strong> for).
                  Switch to <strong>All Fixtures</strong> to see the full tournament schedule.
                </p>
                <p>
                  <strong>Showing</strong> = kick-off during opening hours. <strong>Opening early</strong> = kick-off up to{' '}
                  <strong>1 hour before we open</strong>. <strong>Not showing</strong> = kick-off outside those hours.
                </p>
                <p>
                  Book now buttons are live for matches marked <strong>Showing</strong> or <strong>Opening early</strong>. We
                  don’t show booking buttons for matches marked <strong>Not showing</strong>.
                </p>
                <p>
                  If a match runs past our normal closing time we’ll stay open while it’s on <strong>if the pub is busy</strong>
                  . If the pub is empty at closing time, we’ll close as normal.
                </p>
              </div>
            }
          />

          <div className="mx-auto max-w-5xl">
            {matches.length > 0 ? (
              <WorldCup2026Fixtures matches={matches} />
            ) : (
              <AlertBox
                variant="warning"
                title="Fixtures temporarily unavailable"
                className="mx-auto max-w-2xl"
                content="We’re having trouble loading the full match schedule right now. Please check back soon — in the meantime you can still book a table for any date."
              />
            )}
          </div>

          <div className="mt-12 text-center">
            <AlertBox
              variant="warning"
              title="Book Early for Knockouts"
              className="mx-auto max-w-2xl"
              content="The knockouts and final weekend fill up fast. Book ahead to guarantee a table with a good screen view."
            />
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-bg-raised">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <SectionHeader title="Matchday Essentials" subtitle="Everything you need for a proper World Cup watch." />

            <FeatureGrid
              columns={4}
              features={[
                {
                  icon: '',
                  title: 'Sound On',
                  description: 'Sound on for all games we show (reviewed if another event clashes).',
                  variant: 'default',
                  className: 'border border-anchor-gold/15 text-center',
                },
                {
                  icon: '',
                  title: '4 Screens',
                  description: '4 screens across the bar and dining areas (no projector).',
                  variant: 'default',
                  className: 'border border-anchor-gold/15 text-center',
                },
                {
                  icon: '',
                  title: 'Kitchen Open',
                  description: 'Food served during our opening hours.',
                  variant: 'default',
                  className: 'border border-anchor-gold/15 text-center',
                },
                {
                  icon: '',
                  title: 'Free Parking',
                  description: `Free on-site parking (${PARKING.capacity} spaces).`,
                  variant: 'default',
                  className: 'border border-anchor-gold/15 text-center',
                },
              ]}
              className="mt-10"
            />

            <AlertBox
              variant="info"
              title="Late Kick-offs"
              className="mx-auto mt-10 max-w-2xl"
              content="Many games in the USA/Canada/Mexico will be late-night (or overnight) in the UK. Matches marked “Not showing” won’t be on our screens."
            />
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-bg-raised">
        <Container>
          <div className="grid gap-10 md:grid-cols-2 md:items-start">
            <div>
              <SectionHeader title="Food & Drink" subtitle="Settle in and make a day of it." className="mb-6 text-left" />
              <div className="prose text-anchor-cream-text/70">
                <p>
                  Proper pub classics, cold pints, and a friendly crowd — ideal for afternoon kick-offs or big evening games.
                </p>
                <p>Kitchen is open during our opening hours (check the menu for current serving times).</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link href="/food-menu">
                  <Button variant="primary">View Food Menu</Button>
                </Link>
                <Link href="/drinks">
                  <Button variant="outline">Drinks List</Button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-anchor-bg-card p-8 shadow-sm ring-1 ring-anchor-gold/15">
              <h3 className="mb-4 text-xl font-bold text-anchor-gold-vivid">Getting Here</h3>
              <ul className="mb-6 space-y-3 text-sm text-anchor-cream-text/70">
                <li className="flex gap-2">
                  <span>
                    {CONTACT.address.street}, {CONTACT.address.town}, {CONTACT.address.postcode}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>
                    {HEATHROW_TIMES.terminal5} mins from Heathrow Terminal 5 (T2/3 ~{HEATHROW_TIMES.terminal2} mins, T4 ~
                    {HEATHROW_TIMES.terminal4} mins)
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>Free parking ({PARKING.capacity} spaces)</span>
                </li>
                <li className="flex gap-2">
                  <span>Bus 442 (Staines Heathrow) stops outside — ask for The Anchor, Horton Road</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link href="/find-us" className="font-bold text-anchor-gold hover:underline">
                  Directions & travel info →
                </Link>
                <Link href="/near-heathrow/terminal-5" className="font-bold text-anchor-gold hover:underline">
                  Terminal 5 guide →
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-bg">
        <Container>
          <SectionHeader
            title="A World Cup Pub Near You"
            subtitle="Stanwell Moor, Staines, Ashford, Feltham, Egham and around Heathrow."
          />
          <div className="mx-auto max-w-5xl rounded-2xl bg-anchor-bg-raised p-8 ring-1 ring-anchor-gold/15">
            <p className="text-center text-sm text-anchor-cream-text/70">
              Searching for “World Cup pub near me”? The Anchor is an easy drive from Heathrow hotels and nearby towns — with
              free parking on-site.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {AREA_LINKS.map((area) => (
                <Link
                  key={area.href}
                  href={area.href}
                  className="rounded-full bg-anchor-bg-card px-4 py-2 text-sm font-semibold text-anchor-gold ring-1 ring-anchor-gold/15 hover:bg-anchor-bg-raised"
                >
                  {area.label}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-bg">
        <Container>
          <SectionHeader title="Frequently Asked Questions" />
          <FAQAccordionWithSchema
            faqs={[
              {
                question: 'Which World Cup 2026 matches are you showing?',
                answer:
                  'We show matches that kick off during our opening hours (or up to 1 hour before we open). In the fixtures list, look for “Showing” or “Opening early”.',
              },
              {
                question: 'Why are some matches marked “Not showing”?',
                answer:
                  'Those kick-offs are outside our opening hours, so they won’t be on our screens.',
              },
              {
                question: 'When do bookings open?',
                answer: 'Bookings are open now for all matches we’re showing. Use the Book Table button next to the fixture.',
              },
              {
                question: 'Do you take deposits or minimum spend?',
                answer: 'No — there are no deposits required and no minimum spend.',
              },
              {
                question: 'How long do you hold tables?',
                answer:
                  'Tables are held until kick-off only. After kick-off, tables may be released for anyone to use.',
              },
              {
                question: 'Will you stay open until full time?',
                answer:
                  'If a match is still being played at our normal closing time, we’ll stay open while it’s on if the pub is busy. If the pub is empty at closing time, we’ll close as normal.',
              },
              {
                question: 'Is the sound on?',
                answer:
                  'Yes — sound is on for all games we show. If a match clashes with another event, we may review the sound on the day.',
              },
              {
                question: 'How many screens do you have?',
                answer: 'We have 4 screens across the bar and dining areas (no projector).',
              },
              {
                question: 'Are the kick-off times shown in UK time?',
                answer: 'Yes — the fixtures list shows kick-off times in UK time (BST).',
              },
              {
                question: 'Do you have parking and how do I get there?',
                answer: `Yes — free on-site parking for guests (${PARKING.capacity} spaces). We’re ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5, and the 442 bus from Staines Heathrow stops outside.`,
              },
            ]}
            className="mx-auto max-w-3xl bg-anchor-bg-raised"
          />
        </Container>
      </section>

      <CTASection
        title="Book Your World Cup Table"
        description="Choose a match we’re showing, then book your table now."
        buttons={[
          {
            text: 'Book a Table',
            href: '/book-table',
            variant: 'primary',
          },
          {
            text: 'Get Directions',
            href: '/find-us',
            variant: 'secondary',
          },
        ]}
        variant="green"
      />
    </>
  )
}
