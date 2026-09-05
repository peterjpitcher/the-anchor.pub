import { fixtureFoodMenu } from '@/lib/nations-championship/food-menu'
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
import { englandNationsFixtures, nationsEditorial, nationsFaqs } from '@/content/nations-championship'
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
    <InteriorHero image={DEFAULT_PAGE_HEADER_IMAGE} kicker="November rugby at The Anchor" title="Watch Nations Championship rugby near Heathrow" lead="Pick your game and book your table. We show terrestrial TV games during our existing opening hours, with food when the kitchen is serving." crumb="Nations Championship" actions={<Button asChild variant="primary" size="lg"><Link href="#fixtures">Choose a game and book</Link></Button>} />
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
      <div>
        <h2 className="font-display text-3xl text-ink-strong">Where to watch Nations Championship 2026 near Heathrow</h2>
        <p className="mt-4 text-ink-muted">{nationsEditorial.introduction}</p>
        <h3 className="mt-8 font-display text-2xl text-ink-strong">Your pub for the autumn internationals</h3>
        <p className="mt-3 text-ink-muted">{nationsEditorial.autumn}</p>
        <p className="mt-3 text-ink-muted">{nationsEditorial.teams}</p>
        <h3 className="mt-8 font-display text-2xl text-ink-strong">Watch England rugby at The Anchor</h3>
        <p className="mt-3 text-ink-muted">{nationsEditorial.england}</p>
        <ul className="mt-4 space-y-3">
          {englandNationsFixtures.map(match => {
            const fixture = feed?.fixtures.find(item => item.importKey === match.importKey)
            const menu = fixture ? fixtureFoodMenu(fixture) : null
            return <li key={match.importKey}>
              <Link href={fixture ? `#fixture-${fixture.id}` : '#fixtures'} className="inline-flex min-h-11 items-center text-accent-text underline">{match.label}</Link>
              {fixture?.screening.canBookForScreening && fixture.screening.foodPromotion.message && <p className="text-sm text-ink-muted">{fixture.screening.foodPromotion.message} {menu && <Link href={menu.href} className="text-accent-text underline">{menu.label}</Link>}</p>}
            </li>
          })}
        </ul>
        <h3 className="mt-8 font-display text-2xl text-ink-strong">Nations Championship Finals Weekend</h3>
        <p className="mt-3 text-ink-muted">{nationsEditorial.finals}</p>
        <p className="mt-4"><Link href="https://allianzstadiumtwickenham.com/nations-championship" className="text-accent-text underline">Read the official tournament format and England fixtures</Link></p>
        <h3 className="mt-8 font-display text-2xl text-ink-strong">What channel is Nations Championship on?</h3>
        <p className="mt-3 text-ink-muted">{nationsEditorial.television}</p>
        <p className="mt-4"><Link href="https://www.itv.com/presscentre/media-releases/nations-championship-statement-partnership-itv-cements-uks-most-comprehensive-free" className="text-accent-text underline">ITV's Nations Championship coverage announcement</Link></p>
        <div className="mt-6"><Button asChild><Link href="#fixtures">Choose a match and book your table</Link></Button></div>
        <p className="mt-5 text-ink-muted">For other rugby dates, see <Link href="/live-sport" className="text-accent-text underline">live sport at The Anchor</Link> or our <Link href="/live-sport/six-nations" className="text-accent-text underline">Six Nations page</Link>.</p>
      </div>
    </Container></section>
    <section id="food-and-parking" className="scroll-mt-28 bg-canvas py-section-y"><Container>
      <div>
        <h2 className="font-display text-3xl text-ink-strong">Food, rugby and a table for your group</h2>
        <p className="mt-4 text-ink-muted">{nationsEditorial.food}</p>
        <p className="mt-3 text-ink-muted">{nationsEditorial.foodTiming}</p>
        <div className="mt-5 flex flex-wrap gap-4"><Button asChild><Link href="#fixtures">Choose your game</Link></Button><Button asChild variant="outline"><Link href="/food-menu">View the food menu</Link></Button><Link href="/sunday-roast" className="inline-flex min-h-11 items-center text-accent-text underline">Our Sunday roasts</Link></div>
        <h3 className="mt-8 font-display text-2xl text-ink-strong">Plan your arrival around the game</h3>
        <p className="mt-3 text-ink-muted">{nationsEditorial.hours}</p>
        <h3 className="mt-8 font-display text-2xl text-ink-strong">Coming with friends or family?</h3>
        <p className="mt-3 text-ink-muted">{nationsEditorial.groups}</p>
        <h3 className="mt-8 font-display text-2xl text-ink-strong">Getting here from Heathrow and Staines</h3>
        <p className="mt-3 text-ink-muted">{nationsEditorial.travel}</p>
        <Link href="/find-us" className="mt-4 inline-flex min-h-11 items-center text-accent-text underline">Directions and parking at The Anchor</Link>
      </div>
    </Container></section>
    <section id="faqs" className="scroll-mt-28 bg-surface-sunk py-section-y"><Container>
      <h2 className="mb-6 font-display text-3xl text-ink-strong">Plan your rugby visit</h2>
      <div className="space-y-4">{nationsFaqs.map(faq => <details key={faq.question} className="rounded-card border border-line bg-surface p-5"><summary className="cursor-pointer font-semibold text-ink-strong">{faq.question}</summary><p className="mt-3 text-ink-muted">{faq.answer}</p></details>)}</div>
      <div className="mt-8"><Button asChild size="lg"><Link href="#fixtures">Find your game and book a table</Link></Button></div>
    </Container></section>
  </>
}
