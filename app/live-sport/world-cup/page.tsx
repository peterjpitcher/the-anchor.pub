import Link from 'next/link'
import type { Metadata } from 'next'
import { DateTime } from 'luxon'
import { Alert, Button, Container, SectionHeading } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BRAND, CONTACT, HEATHROW_TIMES, PARKING } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { WorldCup2026Fixtures } from '@/components/features/world-cup/WorldCup2026Fixtures'
import { getWorldCup2026Matches } from '@/lib/world-cup-2026'
import type { WorldCup2026Match } from '@/lib/world-cup-2026'
import { PhoneButton } from '@/components/PhoneButton'
import { DirectionsButton } from '@/components/DirectionsButton'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

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
  title: 'World Cup 2026 Fixtures & UK Kick-Off Times',
  description: `World Cup 2026 fixtures with UK kick-off times, showing status and table bookings. Watch at ${BRAND.name} near Heathrow T5, with 4 screens, sound on, free parking.`,
  openGraph: {
    title: 'World Cup 2026 Fixtures & UK Kick-Off Times | The Anchor Near Heathrow',
    description: `World Cup 2026 fixtures with UK kick-off times and showing status. Watch at ${BRAND.name} near Heathrow T5, with 4 screens, sound on, free parking. Book a table.`,
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'World Cup 2026 Fixtures & UK Kick-Off Times | The Anchor Near Heathrow',
    description: `World Cup 2026 fixtures with UK kick-off times and showing status. Watch at ${BRAND.name} near Heathrow T5, with 4 screens, sound on, free parking. Book a table.`,
    images: [DEFAULT_PAGE_HEADER_IMAGE],
  }),
  alternates: {
    canonical: '/live-sport/world-cup',
  },
}

export const revalidate = 300 // 5 minutes, matches CheersAI feed CDN cache

function getTeamsLabel(match: WorldCup2026Match) {
  return match.placeholderA && match.placeholderB
    ? `${match.placeholderA} vs ${match.placeholderB}`
    : `Match ${match.matchNumber}`
}

function isEnglandFixture(match: WorldCup2026Match) {
  return [match.placeholderA, match.placeholderB].some((team) => team?.toLowerCase().includes('england'))
}

function formatUkFixtureTime(utcDateTime: string) {
  return DateTime.fromISO(utcDateTime, { zone: 'utc' }).setZone('Europe/London').toFormat('EEEE d MMMM yyyy, HH:mm')
}

export default async function WorldCupPage() {
  let matches: WorldCup2026Match[] = []
  try {
    matches = await getWorldCup2026Matches()
  } catch (error) {
    console.warn('World Cup fixtures fetch failed', error)
  }

  const englandMatches = matches.filter(isEnglandFixture)

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': 'https://www.the-anchor.pub/live-sport/world-cup#event',
    name: 'FIFA World Cup 2026 Screenings Near Heathrow',
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
    description: `Watch FIFA World Cup 2026 screenings near Heathrow on big screens at ${BRAND.name} in Stanwell Moor.`,
    image: DEFAULT_PAGE_HEADER_IMAGE,
    organizer: {
      '@type': 'Organization',
      name: BRAND.name,
      url: 'https://www.the-anchor.pub',
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
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([eventSchema]) }}
      />

      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Live Sport', url: '/live-sport' },
        { name: 'World Cup 2026', url: '/live-sport/world-cup' },
      ]} />

      <InteriorHero
        image={DEFAULT_PAGE_HEADER_IMAGE}
        crumb="World Cup"
        title="Watch FIFA World Cup 2026 Near Heathrow"
        lead="World Cup 2026 fixtures • UK kick-off times • 4 screens • Sound on • Free parking near Terminal 5."
        actions={
          <>
            <BookTableButton source="world_cup_hero" variant="primary" size="lg" fullWidth>
              Book a Table
            </BookTableButton>
            <Link href="/food-menu">
              <Button variant="outline" size="lg" fullWidth>
                View Menu
              </Button>
            </Link>
          </>
        }
      />

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto flex max-w-5xl flex-col gap-5 rounded-xl border border-line bg-surface p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent-text">World Cup Sweep</p>
              <h2 className="mt-2 text-h4 text-ink-strong">Sweep Winners Are Confirmed</h2>
              <p className="mt-2 max-w-2xl text-sm text-ink-muted">
                Spain took the title, Tom won the £100 top prize, and all 13 prize winners are now listed.
              </p>
            </div>
            <Link href="/live-sport/world-cup/sweepstake" className="w-full shrink-0 md:w-auto">
              <Button variant="primary" size="lg" className="w-full md:w-auto">
                View Sweep Winners
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas" id="fixtures">
        <Container>
          <SectionHeading
            title="World Cup 2026 Fixtures and UK Kick-Off Times"
            subtitle="World Cup 2026 screenings, showing status, and table booking links."
          />

          <p className="mx-auto mb-8 max-w-4xl text-center text-sm text-ink-muted">
            Complete World Cup 2026 match schedule with UK kick-off times, showing status at The Anchor, and table booking links.
          </p>

          <Alert variant="info" className="mx-auto mb-10 max-w-5xl" title="How this fixtures list works">
            <div className="space-y-3 text-sm">
              <p>
                By default you'll see <strong>Showing Only</strong> matches.
                Switch to <strong>All Fixtures</strong> to see the full tournament schedule.
              </p>
              <p>
                <strong>Showing</strong> = we're screening this match. <strong>Not showing</strong> = kick-off is outside
                our opening hours.
              </p>
              <p>
                Book Table buttons are live for matches marked <strong>Showing</strong>. We
                don't show booking buttons for matches marked <strong>Not showing</strong>.
              </p>
              <p>
                If a match runs past our normal closing time we'll stay open while it's on{' '}
                <strong>if the pub is busy</strong>. If the pub is empty at closing time, we'll close as normal.
              </p>
            </div>
          </Alert>

          <div className="mx-auto max-w-5xl">
            {matches.length > 0 ? (
              <WorldCup2026Fixtures matches={matches} />
            ) : (
              <Alert variant="warning" title="Fixtures temporarily unavailable" className="mx-auto max-w-2xl">
                <p>We're having trouble loading the full match schedule right now. Please check back soon, in the meantime you can still book a table for any date.</p>
              </Alert>
            )}
          </div>

          <div className="mt-12">
            <Alert variant="warning" title="Book Early for Knockouts" className="mx-auto max-w-2xl">
              <p>The knockouts and final weekend fill up fast. Book ahead to guarantee a table with a good screen view.</p>
            </Alert>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-line bg-surface-sunk p-8">
            <SectionHeading
              title="England World Cup Fixtures at The Anchor"
              subtitle="England fixtures, screenings and table bookings near Heathrow."
            />
            {englandMatches.length > 0 ? (
              <div className="mx-auto mt-8 max-w-3xl space-y-3">
                <p className="text-center text-sm text-ink-muted">
                  England are in Group L alongside Croatia, Ghana and Panama.
                </p>
                <div className="divide-y divide-line rounded-xl border border-line bg-surface">
                  {englandMatches.map((match) => (
                    <Link
                      key={match.matchNumber}
                      href={`#match-${match.matchNumber}`}
                      className="flex flex-col gap-1 px-5 py-4 hover:bg-surface-sunk sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="font-semibold text-ink-strong">{getTeamsLabel(match)}</span>
                      <span className="text-sm text-ink-muted">
                        {formatUkFixtureTime(match.utcDateTime)} UK
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-ink-muted">
                England's World Cup 2026 fixtures will be highlighted here once confirmed. For now, use the full World
                Cup 2026 schedule below for UK kick-off times, showing status, and table booking links.
              </p>
            )}
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-accent-text">What We're Showing</h2>
                <ul className="mt-4 space-y-2 text-sm text-ink-muted">
                  <li>Matches we show are on BBC and ITV (no subscription needed)</li>
                  <li>Matches marked Showing will be on our screens</li>
                  <li>Matches outside our opening hours aren't shown</li>
                  <li>If it's busy at close, we'll stay open while it's on</li>
                  <li>If we're empty at close, we'll close as normal</li>
                </ul>
                <p className="mt-4 text-xs text-ink-muted">
                  Core hours: Mon-Thu 4pm-10pm • Fri 4pm-10pm • Sat 12pm-10pm • Sun 12pm-10pm. Extended to midnight for selected knockout matches.
                </p>
                <div className="mt-4">
                  <Link href="#fixtures" className="font-semibold text-accent-text hover:underline">
                    See fixtures we're showing →
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm" id="booking-rules">
                <h2 className="text-lg font-semibold text-accent-text">Booking Rules</h2>
                <ul className="mt-4 space-y-2 text-sm text-ink-muted">
                  <li>Book any showing match now</li>
                  <li>No deposits for groups under 15</li>
                  <li>Groups of 10+: £10 per person deposit, deducted from your bill</li>
                  <li>Large groups: book early for the best tables</li>
                  <li>Tables are held until kick-off, then released</li>
                </ul>
                <p className="mt-4 text-xs text-ink-muted">Booking takes you to our in-site table booking form.</p>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-accent-text">Matchday Setup</h2>
                <ul className="mt-4 space-y-2 text-sm text-ink-muted">
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
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
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
                  message="Hi! I'd like to book a table for a World Cup match."
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

      <section className="py-section-y bg-surface">
        <Container>
          <div className="grid gap-10 md:grid-cols-2 md:items-start">
            <div>
              <SectionHeading title="Food & Drink" subtitle="Settle in and make a day of it." className="mb-6 text-left" />
              <div className="prose text-ink-muted">
                <p>
                  Proper pub classics, cold pints, and a friendly crowd, ideal for afternoon kick-offs or big evening games.
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

            <div className="rounded-2xl border border-line bg-surface p-8 shadow-sm">
              <h3 className="mb-4 text-xl text-accent-text">Getting Here</h3>
              <ul className="mb-6 space-y-3 text-sm text-ink-muted">
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
                  <span>Bus 442 (Staines Heathrow) stops outside, ask for The Anchor, Horton Road</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link href="/find-us" className="font-semibold text-accent-text hover:underline">
                  Directions & travel info →
                </Link>
                <Link href="/near-heathrow/terminal-5" className="font-semibold text-accent-text hover:underline">
                  Terminal 5 guide →
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas">
        <Container>
          <SectionHeading
            title="Watch Live Sport Near Heathrow"
            subtitle="Easy to reach from Stanwell Moor, Staines, Ashford, Feltham, Egham, and around Heathrow."
          />
          <div className="mx-auto max-w-5xl rounded-2xl border border-line bg-surface-sunk p-8">
            <p className="text-center text-sm text-ink-muted">
              The Anchor is in Stanwell Moor, just off the M25 and {HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5. Free parking for {PARKING.capacity} cars makes us easy to reach from Staines, Ashford, Feltham, Egham, Colnbrook, and Windsor.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {AREA_LINKS.map((area) => (
                <Link
                  key={area.href}
                  href={area.href}
                  className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-accent-text hover:bg-surface-sunk"
                >
                  {area.label}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas">
        <Container>
          <SectionHeading title="Frequently Asked Questions" />
          <FAQAccordionWithSchema
            faqs={[
              {
                question: 'Where can I watch World Cup 2026 near Heathrow?',
                answer: `You can watch FIFA World Cup 2026 matches we are showing at ${BRAND.name} in Stanwell Moor, ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5. We have 4 screens, sound on for games we show, free parking, and table bookings available.`,
              },
              {
                question: 'Which World Cup 2026 matches are you showing?',
                answer:
                  'We show matches that kick off during our opening hours. Matches are on BBC and ITV, no subscription needed. In the fixtures list, look for matches marked "Showing".',
              },
              {
                question: 'Is the World Cup 2026 free to watch?',
                answer: 'Yes. World Cup 2026 matches are on BBC and ITV in the UK. We show them on our 4 screens with sound on, no subscription needed.',
              },
              {
                question: 'Are you extending opening hours for the World Cup?',
                answer: 'Selected knockout matches have extended hours until midnight. Check the fixtures list for specific matches. For all other games, standard opening hours apply.',
              },
              {
                question: 'Why are some matches marked "Not showing"?',
                answer:
                  'Those kick-offs are outside our opening hours, so they won\'t be on our screens.',
              },
              {
                question: 'Do you show England World Cup fixtures?',
                answer:
                  'Yes, we show England World Cup fixtures when they are marked as Showing in our fixtures list. England fixtures will be highlighted on this page once confirmed.',
              },
              {
                question: 'Can I book a table for the World Cup final?',
                answer:
                  'Yes, if the World Cup final is marked as Showing in our fixtures list, you can book a table from the fixture row. Final weekend fills up fast, so booking ahead is recommended.',
              },
              {
                question: 'Is The Anchor a sports bar near Heathrow?',
                answer:
                  'The Anchor is a proper pub near Heathrow that shows live sport on 4 screens. If you are looking for a sports bar near Heathrow, a football pub near me, or a live sport pub near me, we offer a pub atmosphere with sound on for games we show, food, drinks, and free parking.',
              },
              {
                question: 'When do bookings open?',
                answer: 'Bookings are open now for all matches we\'re showing. Use the Book Table button next to the fixture.',
              },
              {
                question: 'Do you take deposits for group bookings?',
                answer: 'No deposits for groups under 15. Groups of 15 or more: a £10 per person deposit, fully deducted from your bill.',
              },
              {
                question: 'How long do you hold tables?',
                answer:
                  'Tables are held until kick-off only. After kick-off, tables may be released for anyone to use.',
              },
              {
                question: 'Will you stay open until full time?',
                answer:
                  'If a match is still being played at our normal closing time, we\'ll stay open while it\'s on if the pub is busy. If the pub is empty at closing time, we\'ll close as normal.',
              },
              {
                question: 'Is the sound on?',
                answer:
                  'Yes, sound is on for all games we show. If a match clashes with another event, we may review the sound on the day.',
              },
              {
                question: 'How many screens do you have?',
                answer: 'We have 4 screens across the bar and dining areas (no projector).',
              },
              {
                question: 'Are the kick-off times shown in UK time?',
                answer: 'Yes, the fixtures list shows kick-off times in UK time (BST).',
              },
              {
                question: 'Do you have parking and how do I get there?',
                answer: `Yes, free on-site parking for guests (${PARKING.capacity} spaces). We're ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5, and the 442 bus from Staines Heathrow stops outside.`,
              },
            ]}
            className="mx-auto max-w-3xl"
          />
        </Container>
      </section>

      <CtaBand
        title="Book Your World Cup Table"
        copy="Choose a match we're showing, then book your table now."
      >
        <BookTableButton source="world_cup_cta" variant="primary" size="lg" className="w-full sm:w-auto">
          Book a Table
        </BookTableButton>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href="/find-us">Get Directions</Link>
        </Button>
      </CtaBand>
    </>
  )
}
