import Link from 'next/link'
import type { Metadata } from 'next'
import { Container, Button } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { CONTACT } from '@/lib/constants'
import { getNationsChampionshipFeed } from '@/lib/nations-championship/feed'
import { NATIONS_CHAMPIONSHIP_PATH } from '@/lib/nations-championship/config'
import type { ScreeningFeed } from '@/lib/nations-championship/types'
import { NationsChampionshipFixtures } from '@/components/features/nations-championship/NationsChampionshipFixtures'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { nationsFaqs } from '@/content/nations-championship'
import { PhoneLink } from '@/components/PhoneLink'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: { absolute: 'Nations Championship 2026 near Heathrow | The Anchor' },
  description: 'Choose your Nations Championship rugby game at The Anchor near Heathrow. Check pub opening and food service times, then book a table for a confirmed screening.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Nations Championship rugby at The Anchor',
    description: 'Find your game, check screening and food service times, and book a table near Heathrow.',
    url: NATIONS_CHAMPIONSHIP_PATH,
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor in Stanwell Moor' }],
  },
}
export default async function NationsChampionshipPage() {
  let feed: ScreeningFeed | null = null
  try { feed = await getNationsChampionshipFeed() } catch { /* Honest unavailable state below. */ }
  const pageUrl = `https://www.the-anchor.pub${NATIONS_CHAMPIONSHIP_PATH}`
  const schema = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${pageUrl}#page`, url: pageUrl,
    name: 'Nations Championship 2026 screenings at The Anchor',
    about: { '@id': 'https://www.the-anchor.pub/#business' },
    ...(feed?.meta.contentUpdatedAt ? { dateModified: feed.meta.contentUpdatedAt } : {}),
    mainEntity: { '@type': 'ItemList', itemListElement: (feed?.fixtures ?? []).map((f, i) => ({
      '@type': 'ListItem', position: i + 1, name: `${f.teamA} v ${f.teamB}`, url: `${pageUrl}#fixture-${f.id}`,
    })) },
  }
  return <>
    <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Live Sport', url: '/live-sport' }, { name: 'Nations Championship', url: NATIONS_CHAMPIONSHIP_PATH }]} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(schema) }} />
    <InteriorHero image={DEFAULT_PAGE_HEADER_IMAGE} kicker="November rugby at The Anchor" title="Watch Nations Championship rugby near Heathrow" lead="Pick your game and book your table. We show confirmed screenings during our existing opening hours, with food when the kitchen is serving." crumb="Nations Championship" actions={<Button asChild variant="primary" size="lg"><Link href="#fixtures">Choose a game and book</Link></Button>} />
    <section className="bg-canvas py-section-y"><Container>
      <nav aria-label="Page sections" className="mb-8 flex flex-wrap gap-4 text-sm font-semibold text-accent-text">
        <Link href="#fixtures">Fixtures and bookings</Link><Link href="#autumn-rugby">Autumn internationals</Link><Link href="#food-and-parking">Food and parking</Link><Link href="#faqs">Your visit</Link>
      </nav>
      {feed ? <NationsChampionshipFixtures initialFeed={feed} /> : <div id="fixtures" className="rounded-card border border-line p-6">
        <h2 className="font-display text-3xl text-ink-strong">Screening details are unavailable</h2>
        <p className="mt-3 text-ink-muted">Please check back for confirmed games, opening times and match bookings. You can still make a normal table booking or call us to ask about a game.</p>
        <div className="mt-4 flex flex-wrap gap-4"><Button asChild><Link href="/book-table">Book a table</Link></Button><PhoneLink className="inline-flex min-h-12 items-center text-accent-text underline" phone={CONTACT.phone} source="nations_unavailable">Call {CONTACT.phone}</PhoneLink><Link href="/food-menu" className="inline-flex min-h-12 items-center text-accent-text underline">View the food menu</Link></div>
      </div>}
    </Container></section>
    <section id="autumn-rugby" className="scroll-mt-28 bg-surface-sunk py-section-y"><Container>
      <h2 className="font-display text-3xl text-ink-strong">Your pub for the autumn internationals</h2>
      <p className="mt-4 text-ink-muted">Looking for somewhere to watch the autumn internationals? In 2026, the November games form part of the Nations Championship, taking the place of the autumn nations series. Use the team filter to find England, Ireland, Scotland, Wales or your other favourite team, then check the screening details before booking.</p>
      <h3 className="mt-6 font-display text-2xl text-ink-strong">Finals Weekend</h3>
      <p className="mt-3 text-ink-muted">The tournament ends with teams playing the side in the matching position in the other group. Select Finals Weekend in the fixtures to see the schedule. Opponents are added when confirmed.</p>
      <p className="mt-4"><Link href="https://allianzstadiumtwickenham.com/nations-championship" className="text-accent-text underline">Read the official tournament format</Link></p>
      <p className="mt-4"><Link href="/live-sport/six-nations" className="text-accent-text underline">Looking for the Six Nations?</Link></p>
    </Container></section>
    <section id="food-and-parking" className="scroll-mt-28 bg-canvas py-section-y"><Container>
      <h2 className="font-display text-3xl text-ink-strong">Food, rugby and a table for your group</h2>
      <p className="mt-4 text-ink-muted">Make food part of your visit when your game overlaps kitchen service. Each confirmed screening shows the actual service times, including when the kitchen closes during a game. Choose your fixture to book an available arrival time.</p>
      <div className="mt-5 flex flex-wrap gap-4"><Button asChild><Link href="#fixtures">Choose your game</Link></Button><Button asChild variant="outline"><Link href="/food-menu">View the food menu</Link></Button></div>
      <p className="mt-6 text-ink-muted">The Anchor is on Horton Road in Stanwell Moor, near Heathrow and Staines. There are 20 free customer parking spaces while you visit, available on a first-come basis.</p>
      <Link href="/find-us" className="mt-4 inline-flex min-h-11 items-center text-accent-text underline">Find The Anchor</Link>
    </Container></section>
    <section id="faqs" className="scroll-mt-28 bg-surface-sunk py-section-y"><Container>
      <h2 className="mb-6 font-display text-3xl text-ink-strong">Plan your rugby visit</h2>
      <div className="space-y-4">{nationsFaqs.map(faq => <details key={faq.question} className="rounded-card border border-line bg-surface p-5"><summary className="cursor-pointer font-semibold text-ink-strong">{faq.question}</summary><p className="mt-3 text-ink-muted">{faq.answer}</p></details>)}</div>
      <div className="mt-8"><Button asChild size="lg"><Link href="#fixtures">Find your game and book a table</Link></Button></div>
    </Container></section>
  </>
}
