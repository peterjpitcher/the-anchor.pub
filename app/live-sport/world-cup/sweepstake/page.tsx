import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Button, Container, CTASection, SectionHeader } from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { BRAND, CONTACT } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

const RESULT_SHEET_IMAGE = '/images/events/world-cup/world-cup-sweep-draw-results.png'
const RESULT_SHEET_PDF = '/downloads/the-anchor-world-cup-sweep-draw-results.pdf'

const DRAW_RESULTS = [
  { team: 'Algeria', customer: 'Yuliana' },
  { team: 'Argentina', customer: 'Yuliana' },
  { team: 'Australia', customer: 'Andy Fowles' },
  { team: 'Austria', customer: 'Jim Mc' },
  { team: 'Belgium', customer: 'Harry Jeffereys' },
  { team: 'Bosnia & Herzegovina', customer: 'Luke Postie' },
  { team: 'Brazil', customer: 'Rupi' },
  { team: 'Canada', customer: 'Anita' },
  { team: 'Cape Verde', customer: 'Kylie' },
  { team: 'Colombia', customer: 'Jim Mc' },
  { team: 'Croatia', customer: 'Scotty' },
  { team: 'Curaçao', customer: 'Jess' },
  { team: 'Czech Republic', customer: 'Jacob W' },
  { team: 'DR Congo', customer: 'Jazz K' },
  { team: 'Ecuador', customer: 'Billy' },
  { team: 'Egypt', customer: 'Brian Kelly' },
  { team: 'England', customer: 'Lance M' },
  { team: 'France', customer: 'Pav' },
  { team: 'Germany', customer: 'Dave Hatch' },
  { team: 'Ghana', customer: 'Beverley' },
  { team: 'Haiti', customer: 'Rupi' },
  { team: 'Iran', customer: 'Gerald' },
  { team: 'Iraq', customer: 'Adele' },
  { team: 'Ivory Coast', customer: 'Peter' },
  { team: 'Japan', customer: 'Paul White' },
  { team: 'Jordan', customer: 'Mandy' },
  { team: 'Mexico', customer: 'Rosie' },
  { team: 'Morocco', customer: 'Rupi' },
  { team: 'Netherlands', customer: 'Brian Kelly' },
  { team: 'New Zealand', customer: 'Anita' },
  { team: 'Norway', customer: 'Laura' },
  { team: 'Panama', customer: 'Gerald' },
  { team: 'Paraguay', customer: 'Jacob H' },
  { team: 'Portugal', customer: 'Bernie Hudson' },
  { team: 'Qatar', customer: 'Vinnie' },
  { team: 'Saudi Arabia', customer: 'Paul White' },
  { team: 'Scotland', customer: 'Amrit' },
  { team: 'Senegal', customer: 'Beverley' },
  { team: 'South Africa', customer: 'Suzie Biss' },
  { team: 'South Korea', customer: 'Ryan Band' },
  { team: 'Spain', customer: 'Tom' },
  { team: 'Sweden', customer: 'Marty' },
  { team: 'Switzerland', customer: 'Pav' },
  { team: 'Tunisia', customer: 'Lorraine Biss' },
  { team: 'Türkiye', customer: 'Tom Hudson' },
  { team: 'United States', customer: 'Jit' },
  { team: 'Uruguay', customer: 'Mandy' },
  { team: 'Uzbekistan', customer: 'Henry E' },
]

const PRIZES = [
  { label: 'Winner', amount: '£100' },
  { label: 'Runners-up', amount: '£50' },
  { label: 'Third-place play-off', amount: '£25' },
  { label: 'Quickest goal scored', amount: '£15' },
  { label: 'First red card', amount: '£10' },
  { label: 'First 8 teams eliminated', amount: '£5 each' },
]

const RULES = [
  'All winnings are paid out at the very end, on the day of the final.',
  'Your team is the one drawn against your name. Draws are final, no swaps.',
  'Winner £100, runners-up £50, third place £25.',
  'Bonus pots are quickest goal £15 and first red card £10.',
  'First 8 teams knocked out win £5 each.',
  'Prizes are paid in cash at the bar and must be claimed in person.',
]

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Find your name',
    description: 'Use the draw list to see which team or teams you have.',
  },
  {
    step: '2',
    title: 'Back your team',
    description: 'Your drawn team is final, so follow them through the tournament.',
  },
  {
    step: '3',
    title: 'Watch the results',
    description: 'Winner, runner-up, third place, bonus pots and early eliminations decide the prizes.',
  },
  {
    step: '4',
    title: 'Claim at the bar',
    description: 'All winnings are paid in cash on final day and must be claimed in person.',
  },
]

const CUSTOMER_COUNT = new Set(DRAW_RESULTS.map((result) => result.customer)).size

export const metadata: Metadata = {
  title: 'World Cup 2026 Sweepstake Draw Results | The Anchor',
  description: `Find your World Cup 2026 sweep team at ${BRAND.name}. All 48 teams are drawn and assigned, with prize rules and payouts listed for the pub sweep.`,
  openGraph: {
    title: 'World Cup 2026 Sweepstake Draw Results | The Anchor',
    description: 'Find your team, check the prize pot, and follow the World Cup 2026 sweep at The Anchor.',
    images: [{ url: RESULT_SHEET_IMAGE, width: 1240, height: 1754, alt: 'The Anchor World Cup 2026 sweep draw results sheet' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'World Cup 2026 Sweepstake Draw Results | The Anchor',
    description: 'Find your team, check the prize pot, and follow the World Cup 2026 sweep at The Anchor.',
    images: [RESULT_SHEET_IMAGE],
  }),
  alternates: {
    canonical: '/live-sport/world-cup/sweepstake',
  },
}

export default function WorldCupSweepstakePage() {
  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'World Cup 2026 Sweepstake Draw Results',
    description: `The World Cup 2026 sweep draw results and prize rules for ${BRAND.name}.`,
    url: 'https://www.the-anchor.pub/live-sport/world-cup/sweepstake',
    image: `https://www.the-anchor.pub${RESULT_SHEET_IMAGE}`,
    isPartOf: {
      '@type': 'WebSite',
      name: BRAND.name,
      url: 'https://www.the-anchor.pub',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(webpageSchema) }}
      />

      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Live Sport', url: '/live-sport' },
          { name: 'World Cup 2026', url: '/live-sport/world-cup' },
          { name: 'Sweepstake', url: '/live-sport/world-cup/sweepstake' },
        ]}
      />

      <HeroWrapper
        route="/live-sport/world-cup/sweepstake"
        title="World Cup 2026 Sweepstake"
        description="The draw is done. Find your team, check the prize pot, and follow the sweep through the tournament."
        variant="default"
        primaryCta={
          <Link href="#draw-results">
            <Button variant="primary" size="lg" className="w-full sm:min-w-[200px]">
              Find Your Team
            </Button>
          </Link>
        }
        secondaryCta={
          <Link href={RESULT_SHEET_PDF}>
            <Button variant="outline" size="lg" className="w-full sm:min-w-[200px]">
              View Result Sheet
            </Button>
          </Link>
        }
        image={{
          src: DEFAULT_PAGE_HEADER_IMAGE,
          alt: 'The Anchor pub in Stanwell Moor near Heathrow',
        }}
      />

      <section className="section-spacing bg-anchor-green-deep">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-4">
            {[
              { label: 'Teams drawn', value: DRAW_RESULTS.length.toString() },
              { label: 'Sweep numbers', value: '1-48' },
              { label: 'Number price', value: '£5' },
              { label: 'Names in the draw', value: CUSTOMER_COUNT.toString() },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-anchor-green-card p-6 text-center ring-1 ring-anchor-gold-dark/15">
                <p className="text-3xl font-bold text-anchor-gold-bright">{item.value}</p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-anchor-cream-text/60">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-green-raised" id="draw-results">
        <Container>
          <SectionHeader
            eyebrow="Draw Results"
            title="Find Your Team"
            subtitle="All 48 World Cup 2026 teams have been drawn and assigned."
          />

          <div className="mx-auto max-w-6xl space-y-6">
            <div className="rounded-xl bg-anchor-green-card p-4 ring-1 ring-anchor-gold-dark/15 sm:p-6">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-anchor-gold-bright">Team Draw</h2>
                  <p className="text-sm text-anchor-cream-text/60">Sorted by team, matching the draw sheet.</p>
                </div>
                <Link href={RESULT_SHEET_PDF} className="text-sm font-semibold text-anchor-gold-dark hover:underline">
                  Open PDF
                </Link>
              </div>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {DRAW_RESULTS.map((result) => (
                  <div
                    key={result.team}
                    className="flex min-h-[52px] items-center justify-between gap-4 rounded-lg bg-anchor-green-raised px-4 py-3 ring-1 ring-anchor-gold-dark/10"
                  >
                    <span className="min-w-0 text-sm font-bold uppercase tracking-[0.08em] text-anchor-cream-text">
                      {result.team}
                    </span>
                    <span className="shrink-0 text-right text-sm font-semibold text-anchor-gold-bright">
                      {result.customer}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-anchor-green p-6 text-white ring-1 ring-anchor-gold-dark/25 sm:flex sm:items-center sm:justify-between sm:gap-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-anchor-gold-bright">Payout note</p>
                <p className="mt-3 text-lg font-semibold">
                  All winnings are paid out on final day. No early payouts.
                </p>
              </div>
              <div className="mt-3 sm:mt-0 sm:max-w-sm">
                <p className="mt-2 text-sm text-white/80">
                  Prizes are paid in cash at the bar and must be claimed in person.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-green-deep">
        <Container>
          <SectionHeader eyebrow="Prize Pot" title="What You Can Win" subtitle="Prize values from the official sweep poster." />
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRIZES.map((prize) => (
              <div key={prize.label} className="rounded-xl bg-anchor-green-card p-6 ring-1 ring-anchor-gold-dark/15">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-anchor-cream-text/55">
                  {prize.label}
                </p>
                <p className="mt-3 text-3xl font-bold text-anchor-gold-bright">{prize.amount}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-green-raised">
        <Container>
          <SectionHeader eyebrow="How It Works" title="Follow the Sweep" subtitle="The entry draw is complete, so the sweep now follows the tournament results." />
          <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-4">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="rounded-xl bg-anchor-green-card p-6 text-center ring-1 ring-anchor-gold-dark/15">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-anchor-green text-lg font-bold text-anchor-gold-bright">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-bold text-anchor-cream-text">{item.title}</h3>
                <p className="mt-2 text-sm text-anchor-cream-text/65">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-green-deep">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <SectionHeader eyebrow="Rules" title="Sweep Rules" align="left" className="mb-6" />
              <ul className="space-y-3">
                {RULES.map((rule) => (
                  <li key={rule} className="rounded-lg bg-anchor-green-card px-5 py-4 text-sm text-anchor-cream-text/75 ring-1 ring-anchor-gold-dark/15">
                    {rule}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/live-sport/world-cup" className="w-full sm:w-auto">
                  <Button variant="primary" className="w-full sm:w-auto">
                    See Fixtures
                  </Button>
                </Link>
                <Link href={RESULT_SHEET_PDF} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Download Results
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-xl bg-anchor-green-card p-3 ring-1 ring-anchor-gold-dark/15 sm:p-4">
              <Image
                src={RESULT_SHEET_IMAGE}
                alt="The Anchor World Cup 2026 sweep draw results showing teams paired with customers"
                width={1240}
                height={1754}
                loading="eager"
                unoptimized
                className="h-auto w-full rounded-lg"
              />
            </div>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        title="World Cup Sweep Questions"
        faqs={[
          {
            question: 'Can I still buy a number for the World Cup sweep?',
            answer: 'No. The draw is complete and all 48 teams have been assigned.',
          },
          {
            question: 'Can I swap my team?',
            answer: 'No. Your team is the one drawn against your name and draws are final.',
          },
          {
            question: 'When are winnings paid?',
            answer: 'All winnings are paid at the very end, on the day of the final. There are no early payouts.',
          },
          {
            question: 'How do I claim a prize?',
            answer: 'Prizes are paid in cash at the bar and must be claimed in person.',
          },
          {
            question: 'Where can I watch my team play?',
            answer: 'Use the World Cup fixtures page to see UK kick-off times, showing status, and table booking links at The Anchor.',
          },
        ]}
        className="bg-anchor-green-raised"
      />

      <CTASection
        title="Follow Your Team at The Anchor"
        description="Check World Cup fixtures, book for matches we are showing, and keep an eye on the sweep prizes."
        buttons={[
          {
            text: 'World Cup Fixtures',
            href: '/live-sport/world-cup',
            variant: 'outline',
          },
          {
            text: 'Book a Table',
            href: '/book-table',
            variant: 'primary',
          },
          {
            text: `Call: ${CONTACT.phone}`,
            href: CONTACT.phoneHref,
            isPhone: true,
            phoneSource: 'world_cup_sweep_cta',
            variant: 'white',
          },
        ]}
        variant="green"
      />
    </>
  )
}
