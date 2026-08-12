import Link from 'next/link'
import type { Metadata } from 'next'
import { Button, Container, SectionHeading } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { BRAND, CONTACT } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

const RESULT_SHEET_IMAGE = '/images/events/world-cup/world-cup-sweep-draw-results.png'
const RESULT_SHEET_PDF = '/downloads/the-anchor-world-cup-sweep-draw-results.pdf'

const MAIN_WINNERS = [
  { prize: 'World champions', amount: '£100', customer: 'Tom', team: 'Spain' },
  { prize: 'Runners-up', amount: '£50', customer: 'Yuliana', team: 'Argentina' },
  { prize: 'Third-place play-off', amount: '£25', customer: 'Lance M', team: 'England' },
  {
    prize: 'Quickest goal scored',
    amount: '£15',
    customer: 'Jacob H',
    team: 'Paraguay',
    detail: 'Galarza, 64 seconds',
  },
  { prize: 'First red card', amount: '£10', customer: 'Suzie Biss', team: 'South Africa' },
]

const EARLY_ELIMINATION_WINNERS = [
  { customer: 'Jess', team: 'Curaçao' },
  { customer: 'Jacob W', team: 'Czech Republic' },
  { customer: 'Rupi', team: 'Haiti' },
  { customer: 'Mandy', team: 'Jordan' },
  { customer: 'Gerald', team: 'Panama' },
  { customer: 'Vinnie', team: 'Qatar' },
  { customer: 'Lorraine Biss', team: 'Tunisia' },
  { customer: 'Tom Hudson', team: 'Türkiye' },
]

const WINNER_COUNT = MAIN_WINNERS.length + EARLY_ELIMINATION_WINNERS.length

export const metadata: Metadata = {
  title: 'World Cup 2026 Sweepstake Winners | The Anchor',
  description: `See every World Cup 2026 sweepstake winner at ${BRAND.name}, including the £100 champion and all bonus prize winners.`,
  openGraph: {
    title: 'World Cup 2026 Sweepstake Winners | The Anchor',
    description: 'See all 13 prize winners from The Anchor World Cup 2026 sweepstake.',
    images: [{ url: RESULT_SHEET_IMAGE, width: 1240, height: 1754, alt: 'The Anchor World Cup 2026 sweepstake final results' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'World Cup 2026 Sweepstake Winners | The Anchor',
    description: 'See all 13 prize winners from The Anchor World Cup 2026 sweepstake.',
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
    name: 'World Cup 2026 Sweepstake Winners',
    description: `The final World Cup 2026 sweepstake winners and prize results for ${BRAND.name}.`,
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

      <InteriorHero
        image={DEFAULT_PAGE_HEADER_IMAGE}
        crumb="World Cup Sweepstake"
        title="World Cup 2026 Sweep Winners"
        lead="Full time. Spain are world champions and every sweep prize winner is confirmed. See the full £240 prize list below."
        actions={
          <>
            <Button asChild variant="primary" size="lg" fullWidth>
              <Link href="#winners">
                See All Winners
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" fullWidth>
              <Link href={RESULT_SHEET_PDF}>
                View Final Results
              </Link>
            </Button>
          </>
        }
      />

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto grid gap-6 md:grid-cols-3">
            {[
              { label: 'World champions', value: 'Spain' },
              { label: 'Prize winners', value: WINNER_COUNT.toString() },
              { label: 'Total prize pot', value: '£240' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-line bg-surface p-6 text-center shadow-sm">
                <p className="text-h3 text-accent-text">{item.value}</p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-ink-muted">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface" id="winners">
        <Container>
          <SectionHeading
            eyebrow="Final Results"
            title="All Sweep Winners"
            subtitle="The tournament is over and every prize in the £240 pot has been decided."
          />

          <div className="mx-auto space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {MAIN_WINNERS.map((winner) => (
                <article
                  key={winner.prize}
                  className="rounded-xl border border-line bg-surface p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink-muted">
                      {winner.prize}
                    </p>
                    <span className="shrink-0 rounded-full bg-anchor-green px-3 py-1 text-sm font-semibold text-anchor-cream-text">
                      {winner.amount}
                    </span>
                  </div>
                  <h2 className="mt-5 text-h3 text-accent-text">{winner.customer}</h2>
                  <p className="mt-1 font-semibold text-ink-strong">{winner.team}</p>
                  {winner.detail && <p className="mt-3 text-sm text-ink-muted">{winner.detail}</p>}
                </article>
              ))}
            </div>

            <div className="rounded-xl border border-line bg-surface-sunk p-5 sm:p-6">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl text-accent-text">First Eight Teams Eliminated</h2>
                  <p className="mt-1 text-sm text-ink-muted">Each winner receives £5.</p>
                </div>
                <span className="text-sm font-semibold uppercase tracking-[0.16em] text-accent-text">
                  8 winners, £40 total
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {EARLY_ELIMINATION_WINNERS.map((winner) => (
                  <div
                    key={winner.team}
                    className="rounded-lg border border-line bg-surface px-4 py-4 shadow-sm"
                  >
                    <p className="font-semibold text-accent-text">{winner.customer}</p>
                    <p className="mt-1 text-sm text-ink-muted">{winner.team}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="theme-dark rounded-xl bg-anchor-green p-6 text-white ring-1 ring-anchor-gold-bright/25 sm:flex sm:items-center sm:justify-between sm:gap-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-anchor-gold-bright">Champions crowned</p>
                <p className="mt-3 text-lg font-semibold">Congratulations to every winner.</p>
              </div>
              <div className="mt-3 sm:mt-0 sm:max-w-sm">
                <p className="text-sm text-white/80">The full prize pot is £240. Winnings are paid at the bar.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto rounded-xl border border-line bg-surface p-6 text-center shadow-sm sm:p-8">
            <SectionHeading
              eyebrow="Final Result Sheet"
              title="Keep a Copy"
              subtitle="Download the official final update from Monday 20 July 2026."
              className="mb-6"
            />
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
                <Link href={RESULT_SHEET_PDF} download>
                  Download Final Results
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/live-sport/world-cup">
                  World Cup Page
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        title="World Cup Sweep Questions"
        faqs={[
          {
            question: 'Who won the World Cup 2026 sweepstake?',
            answer: 'Tom won the £100 top prize with world champions Spain.',
          },
          {
            question: 'Who won the other main prizes?',
            answer:
              'Yuliana won £50 with Argentina, Lance M won £25 with England, Jacob H won £15 for the quickest goal with Paraguay, and Suzie Biss won £10 for the first red card with South Africa.',
          },
          {
            question: 'Who won the first eight eliminated prizes?',
            answer:
              'The eight £5 winners are Jess, Jacob W, Rupi, Mandy, Gerald, Vinnie, Lorraine Biss, and Tom Hudson.',
          },
          {
            question: 'How do I claim a prize?',
            answer: 'Winnings are paid at the bar. Please speak to a member of the team when you visit.',
          },
          {
            question: 'What was the total prize pot?',
            answer: 'The full World Cup 2026 sweepstake prize pot was £240.',
          },
        ]}
      />

      <CtaBand
        title="Congratulations to Every Winner"
        copy="The full £240 prize pot is confirmed. Winnings are paid at the bar."
      >
        <BookTableButton source="world_cup_sweep_cta" variant="primary" size="lg" className="w-full sm:w-auto">
          Book a Table
        </BookTableButton>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href="/live-sport">See Live Sport</Link>
        </Button>
        <PhoneButton phone={CONTACT.phone} source="world_cup_sweep_cta" variant="outline" size="lg" className="w-full sm:w-auto">
          Call: {CONTACT.phone}
        </PhoneButton>
      </CtaBand>
    </>
  )
}
