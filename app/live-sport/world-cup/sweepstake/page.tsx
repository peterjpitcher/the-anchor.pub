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

// Nobody who took part is named on this page, in its data or in anything it
// sends to Google or to a share card (owner decision, 8 October 2026). The
// prizes are listed by the team each one went with. The result sheet image and
// PDF that listed every entrant by name were deleted with the names. Do not
// add a name, an initial or a sheet back.
const MAIN_PRIZES = [
  { prize: 'World champions', amount: '£100', team: 'Spain' },
  { prize: 'Runners-up', amount: '£50', team: 'Argentina' },
  { prize: 'Third-place play-off', amount: '£25', team: 'England' },
  {
    prize: 'Quickest goal scored',
    amount: '£15',
    team: 'Paraguay',
    detail: 'Galarza, 64 seconds',
  },
  { prize: 'First red card', amount: '£10', team: 'South Africa' },
]

const FIRST_EIGHT_ELIMINATED = [
  'Curaçao',
  'Czech Republic',
  'Haiti',
  'Jordan',
  'Panama',
  'Qatar',
  'Tunisia',
  'Türkiye',
]

const PRIZE_COUNT = MAIN_PRIZES.length + FIRST_EIGHT_ELIMINATED.length

const PAGE_TITLE = 'World Cup 2026 Sweepstake Results | The Anchor'
const SHARE_DESCRIPTION = `The ${PRIZE_COUNT} prizes in The Anchor World Cup 2026 sweepstake, and the team each one went with.`

export const metadata: Metadata = {
  // The root layout adds " | The Anchor" to this one. The share titles below
  // are not templated, so they carry it themselves.
  title: 'World Cup 2026 Sweepstake Results',
  description: `The World Cup 2026 sweepstake at ${BRAND.name}: a £240 prize pot, ${PRIZE_COUNT} prizes, and the team each one went with.`,
  openGraph: {
    title: PAGE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: PAGE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [DEFAULT_PAGE_HEADER_IMAGE],
  }),
  alternates: {
    canonical: '/live-sport/world-cup/sweepstake',
  },
  // Kept out of search and out of app/sitemap.ts. This is a finished results
  // page; people who took part can still reach it from the live sport pages,
  // and its links are still followed.
  robots: { index: false, follow: true },
}

export default function WorldCupSweepstakePage() {
  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'World Cup 2026 Sweepstake Results',
    description: `The final World Cup 2026 sweepstake prize results for ${BRAND.name}.`,
    url: 'https://www.the-anchor.pub/live-sport/world-cup/sweepstake',
    image: `https://www.the-anchor.pub${DEFAULT_PAGE_HEADER_IMAGE}`,
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
        title="World Cup 2026 Sweep Results"
        lead="Full time. Spain are world champions and every sweep prize is decided. See the full £240 prize list below."
        actions={
          <Button asChild variant="primary" size="lg" fullWidth>
            <Link href="#prizes">
              See All Prizes
            </Link>
          </Button>
        }
      />

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto grid gap-6 md:grid-cols-3">
            {[
              { label: 'World champions', value: 'Spain' },
              { label: 'Prizes', value: PRIZE_COUNT.toString() },
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

      <section className="py-section-y bg-surface" id="prizes">
        <Container>
          <SectionHeading
            eyebrow="Final Results"
            title="All Sweep Prizes"
            subtitle="The tournament is over and every prize in the £240 pot has been decided. Each prize went with a team. We don't publish winners' names."
          />

          <div className="mx-auto space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {MAIN_PRIZES.map((item) => (
                <article
                  key={item.prize}
                  className="rounded-xl border border-line bg-surface p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink-muted">
                      {item.prize}
                    </p>
                    <span className="shrink-0 rounded-full bg-anchor-green px-3 py-1 text-sm font-semibold text-anchor-cream-text">
                      {item.amount}
                    </span>
                  </div>
                  <h2 className="mt-5 text-h3 text-accent-text">{item.team}</h2>
                  {item.detail && <p className="mt-3 text-sm text-ink-muted">{item.detail}</p>}
                </article>
              ))}
            </div>

            <div className="rounded-xl border border-line bg-surface-sunk p-5 sm:p-6">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl text-accent-text">First Eight Teams Eliminated</h2>
                  <p className="mt-1 text-sm text-ink-muted">Each of these teams carried a £5 prize.</p>
                </div>
                <span className="text-sm font-semibold uppercase tracking-[0.16em] text-accent-text">
                  8 prizes, £40 total
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {FIRST_EIGHT_ELIMINATED.map((team) => (
                  <div
                    key={team}
                    className="rounded-lg border border-line bg-surface px-4 py-4 shadow-sm"
                  >
                    <p className="font-semibold text-accent-text">{team}</p>
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

      <FAQAccordionWithSchema
        title="World Cup Sweep Questions"
        faqs={[
          {
            question: 'Which team won the top prize in the World Cup 2026 sweepstake?',
            answer: 'The £100 top prize went with world champions Spain.',
          },
          {
            question: 'Which teams won the other main prizes?',
            answer:
              'Argentina carried the £50 runners-up prize and England the £25 third-place prize. Paraguay took £15 for the quickest goal, and South Africa took £10 for the first red card.',
          },
          {
            question: 'Which teams won the first eight eliminated prizes?',
            answer:
              'The eight £5 prizes went with Curaçao, Czech Republic, Haiti, Jordan, Panama, Qatar, Tunisia and Türkiye.',
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
