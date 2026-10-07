import Link from 'next/link'
import type { Metadata } from 'next'
import { Button, SectionHeading, Card, CardBody, Container, Grid, GridItem } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { CONTACT } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { WorldCup2026Fixtures } from '@/components/features/world-cup/WorldCup2026Fixtures'
import { getUpcomingFixtures } from '@/components/features/world-cup/upcoming-fixtures'
import { getWorldCup2026Matches } from '@/lib/world-cup-2026'
import type { WorldCup2026Match } from '@/lib/world-cup-2026'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

// This page is year-neutral on purpose (7 October 2026, owner-approved: the same
// treatment /live-sport/six-nations got). In October 2026 it still advertised a
// tournament that ended on 19 July: a dated title and hero, all 104 fixtures
// with "Showing" labels and booking buttons, and Event structured data that
// ended in July.
//
// The CheersAI feed is where the owner manages tournaments, so it stays wired
// in. The page now answers to the feed's own state: games that have not
// finished are listed, and when there are none the fixtures block is simply not
// there. Nothing on the page says the tournament is over, and nothing needs
// changing here when CheersAI next supplies fixtures.
//
// Every standing line rests on docs/SSOT.md. Sport, parking, dogs, families,
// access and deposit lines are the approved wording from SSOT §16, pasted as it
// stands. The World Cup line follows the approved Six Nations line: terrestrial
// only (§6), 4 TVs (§8), and the commentary on, which the owner confirmed on
// 7 October 2026 for big games and tournaments. It names no fixture, date, year
// or channel for a given game. tests/unit/world-cup-page-year-neutral.test.tsx
// holds all of this.

const PAGE_TITLE = 'World Cup Football | The Anchor Stanwell Moor'
const SOCIAL_DESCRIPTION = `We show World Cup games that are on BBC, ITV or Channel 4, on 4 TVs with the commentary on. Call ${CONTACT.phone} to check a game.`

export const metadata: Metadata = {
  // Absolute, so the root layout's "| The Anchor" template is not added on top.
  title: { absolute: PAGE_TITLE },
  description: `Watch the World Cup near Heathrow. We show games that are on BBC, ITV or Channel 4, on 4 TVs with the commentary on. Call ${CONTACT.phone} to check a game.`,
  openGraph: {
    title: PAGE_TITLE,
    description: SOCIAL_DESCRIPTION,
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: PAGE_TITLE,
    description: SOCIAL_DESCRIPTION,
    images: [DEFAULT_PAGE_HEADER_IMAGE],
  }),
  alternates: {
    canonical: './',
  },
}

export const revalidate = 300 // 5 minutes, matches CheersAI feed CDN cache

// Follows the approved Six Nations line in SSOT §16, with the tournament's name changed.
const WORLD_CUP_WORDING = `We show World Cup games that are on BBC, ITV or Channel 4, on 4 TVs with the commentary on. Call us on ${CONTACT.phone} to check a particular game.`
// SSOT §16, approved wording, pasted as it stands.
const SPORT_WORDING = "We show live sport on BBC, ITV and Channel 4. We don't have Sky Sports or TNT Sports."
const PARKING_WORDING = "We've 20 free spaces right outside. There's no time limit while you're with us, and nothing to register."
const DOGS_WORDING = "Dogs are welcome throughout the pub, on a lead. We'll have water bowls and biscuits waiting."
const FAMILIES_WORDING = "High chairs, buggy space and bottle warming on request are all here, and breastfeeding is welcome. We don't have baby changing facilities."
const ACCESS_WORDING = `Getting in from the car park is step free, and so are the bar and the dining area. The beer garden is step free straight from the car park. From inside, there's one step between the bar and the garden, and we'll put our ramp out for it if you ask. We don't have an accessible toilet. If you'd like to check what will work best for you, give us a call on ${CONTACT.phone} and we'll help.`
const GROUP_DEPOSIT_WORDING = 'Groups of 15 or more: a £10 per person deposit, fully deducted from your bill.'

const features = [
  { title: 'Free parking', description: PARKING_WORDING },
  { title: 'Bring the dog', description: DOGS_WORDING },
  { title: 'Bring the family', description: `Children are welcome at all hours. ${FAMILIES_WORDING}` },
]

const faqs = [
  {
    question: 'Do you show the World Cup?',
    answer: `Yes. ${WORLD_CUP_WORDING} We don't have Sky Sports or TNT Sports.`,
  },
  {
    question: 'Can I book a table?',
    answer: `Yes. Book online, or call us on ${CONTACT.phone}. ${GROUP_DEPOSIT_WORDING} For more than 20 people, call us.`,
  },
  {
    question: 'Can I get food while I watch?',
    answer: `That depends on the day and the time. Check the kitchen times on this page, or call us on ${CONTACT.phone}.`,
  },
  {
    question: 'Is there parking?',
    answer: PARKING_WORDING,
  },
  {
    question: 'Can I bring my dog?',
    answer: DOGS_WORDING,
  },
  {
    question: 'Are children welcome?',
    answer: `Yes, at all hours. ${FAMILIES_WORDING}`,
  },
  {
    question: 'Is it step free?',
    answer: ACCESS_WORDING,
  },
  {
    question: 'How far are you from Heathrow?',
    answer: "We're in Stanwell Moor. By car it's 7 minutes from Terminal 5, 11 minutes from Terminals 2 and 3, and 12 minutes from Terminal 4.",
  },
]

export default async function WorldCupPage() {
  let matches: WorldCup2026Match[] = []
  try {
    matches = await getWorldCup2026Matches()
  } catch (error) {
    // No fixtures is a state the page already handles: it tells people to call.
    console.warn('World Cup fixtures fetch failed', error)
  }

  const upcoming = getUpcomingFixtures(matches)

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Live Sport', url: '/live-sport' },
        { name: 'World Cup', url: '/live-sport/world-cup' },
      ]} />

      <InteriorHero
        image={DEFAULT_PAGE_HEADER_IMAGE}
        crumb="World Cup"
        title="World Cup football at The Anchor"
        lead="We show World Cup games that are on BBC, ITV or Channel 4. Four TVs, commentary on."
        actions={
          <>
            <BookTableButton source="world_cup_hero" variant="primary" size="lg" fullWidth>
              Book a table
            </BookTableButton>
            <Button asChild variant="outline" size="lg" fullWidth>
              <Link href="/food-menu">
                See the food menu
              </Link>
            </Button>
          </>
        }
      />

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto text-center mb-12">
            <PageTitle className="text-accent-text mb-4">
              Got a game in mind?
            </PageTitle>
            <p className="text-lg text-ink-muted">
              {WORLD_CUP_WORDING}
            </p>
            <p className="mt-4 text-lg text-ink-muted">
              {SPORT_WORDING}
            </p>
          </div>

          <Grid cols={3} gap="md" className="mb-8">
            {features.map((feature) => (
              <GridItem key={feature.title}>
                <Card accent className="h-full">
                  <CardBody className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-ink-strong">{feature.title}</h3>
                    <p className="text-sm text-ink-muted leading-relaxed">{feature.description}</p>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            <Link href="/live-sport" className="font-semibold text-accent-text hover:underline">
              See all live sport
            </Link>
            <Link href="/live-sport/world-cup/sweepstake" className="font-semibold text-accent-text hover:underline">
              World Cup sweepstake winners
            </Link>
          </div>
        </Container>
      </section>

      {/* Only when CheersAI has games that have not finished. Their times, showing
          labels and booking links are the feed's own. */}
      {upcoming.length > 0 && (
        <section className="py-section-y bg-surface" id="fixtures">
          <Container>
            <SectionHeading title="Games coming up" />
            <WorldCup2026Fixtures matches={upcoming} />
          </Container>
        </section>
      )}

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <SectionHeading
                title="Food and drink"
                align="left"
                className="mb-6"
              />
              <div className="prose text-ink-muted mb-6 max-w-none prose-strong:text-ink-strong">
                <p>
                  Hungry? Our kitchen times change by day, so check them here before you set off.
                </p>
                <div className="mt-4">
                  <strong className="text-ink-strong">Opening and kitchen times</strong>
                  <BusinessHours/>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="primary"><Link href="/food-menu">See the food menu</Link></Button>
                <Button asChild variant="outline"><Link href="/drinks">See the drinks</Link></Button>
              </div>
            </div>
            <Card accent>
              <CardBody className="p-8">
                <h3 className="text-xl text-accent-text mb-4">Find us</h3>
                <ul className="space-y-3 text-sm text-ink-muted mb-6">
                  <li className="flex gap-2"><span>{CONTACT.address.street}, {CONTACT.address.town}, {CONTACT.address.postcode}</span></li>
                  <li className="flex gap-2"><span>2 minutes from Junction 14 of the M25</span></li>
                  <li className="flex gap-2"><span>Buses 441, 442 and 555 from Heathrow Central Bus Station</span></li>
                </ul>
                <Link href="/find-us" className="text-accent-text font-semibold hover:underline">
                  Get directions
                </Link>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        title="Your questions"
        faqs={faqs}
        className="bg-surface"
      />

      <CtaBand
        title="Come and watch with us"
        copy={`Call us on ${CONTACT.phone} to check a particular game, or book a table.`}
      >
        <BookTableButton source="world_cup_cta" variant="primary" size="lg" className="w-full sm:w-auto">
          Book a table
        </BookTableButton>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href="/find-us">Get directions</Link>
        </Button>
      </CtaBand>
    </>
  )
}
