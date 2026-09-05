'use client'
import { fixtureFoodMenu } from '@/lib/nations-championship/food-menu'
import { useEffect, useState } from 'react'
import { DateTime } from 'luxon'
import { isBookableScreening, screeningFeedSchema, type ScreeningFeed } from '@/lib/nations-championship/types'
import { trackNationsEvent } from '@/lib/nations-championship/tracking'
import { FixtureCard } from './FixtureCard'

const teams = ['England', 'Ireland', 'Scotland', 'Wales', 'France', 'Italy', 'Australia', 'Argentina', 'New Zealand', 'South Africa', 'Fiji', 'Japan']
export function NationsChampionshipFixtures({ initialFeed }: { initialFeed: ScreeningFeed }) {
  const [feed, setFeed] = useState(initialFeed)
  const [stale, setStale] = useState(false)
  const [team, setTeam] = useState('all')
  const [round, setRound] = useState('all')
  const [confirmed, setConfirmed] = useState(false)
  useEffect(() => {
    let disposed = false
    let controller: AbortController | undefined
    let busy = false
    async function refresh() {
      if (document.hidden || busy) return
      busy = true
      controller = new AbortController()
      const request = controller
      const timeout = window.setTimeout(() => request.abort(), 10000)
      try {
        const response = await fetch('/api/nations-championship', { cache: 'no-store', signal: request.signal })
        if (!response.ok) throw new Error('Unavailable')
        const next = screeningFeedSchema.parse(await response.json())
        if (disposed) return
        setFeed(next)
        setStale(false)
      } catch {
        if (!disposed) setStale(true)
      } finally { window.clearTimeout(timeout); busy = false }
    }
    const revealAnchor = () => {
      if (!window.location.hash.startsWith('#fixture-')) return
      setTeam('all'); setRound('all'); setConfirmed(false)
      requestAnimationFrame(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView())
    }
    revealAnchor()
    void refresh()
    const timer = window.setInterval(refresh, 60000)
    const visibility = () => { if (!document.hidden) void refresh() }
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('hashchange', revealAnchor)
    return () => { disposed = true; controller?.abort(); window.clearInterval(timer); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('hashchange', revealAnchor) }
  }, [])
  const upcoming = [...feed.fixtures].sort((a, b) => {
    const aFinished = ['finished', 'cancelled'].includes(a.matchState)
    const bFinished = ['finished', 'cancelled'].includes(b.matchState)
    return Number(aFinished) - Number(bFinished) || Date.parse(a.kickOffAt) - Date.parse(b.kickOffAt)
  })
  const next = !stale ? upcoming.filter(f => isBookableScreening(f) && f.screening.screeningStartAt && Date.parse(f.screening.screeningStartAt) > Date.now())
    .sort((a, b) => Date.parse(a.screening.screeningStartAt!) - Date.parse(b.screening.screeningStartAt!))[0] : undefined
  const live = !stale ? upcoming.filter(f => f.matchState === 'in_progress' && isBookableScreening(f)) : []
  const englandFixtures = upcoming.filter(f => [f.teamA, f.teamB].includes('England'))
  const filtered = upcoming.filter(f => (team === 'all' || [f.teamA, f.teamB].includes(team)) &&
    (round === 'all' || (round === 'finals' ? f.finalPosition !== null : String(f.roundNumber) === round)) &&
    (!confirmed || (!stale && isBookableScreening(f))))
  const fixturesByDate = new Map<string, { label: string; fixtures: typeof filtered }>()
  for (const fixture of [...filtered].sort((a, b) => Date.parse(a.kickOffAt) - Date.parse(b.kickOffAt))) {
    const kickoff = DateTime.fromISO(fixture.kickOffAt).setZone('Europe/London')
    const date = kickoff.toISODate()!
    const group = fixturesByDate.get(date) ?? { label: kickoff.toFormat('cccc d LLLL yyyy'), fixtures: [] }
    group.fixtures.push(fixture)
    fixturesByDate.set(date, group)
  }
  const trackFilter = (filter_type: string, filter_value: string) => trackNationsEvent('filter_fixtures', { filter_type, filter_value, cta_location: 'fixture_filters' })
  return <>
    {stale && <div role="alert" className="mb-6 rounded-card border border-line p-4">
      <p>We could not refresh screening details. Match booking links are paused until we can check them. Refresh the page to load the latest version, or call the pub.</p>
      <button type="button" onClick={() => window.location.reload()} className="mt-2 min-h-12 font-semibold text-accent-text underline">Refresh page</button>
    </div>}
    {next && <section aria-labelledby="next-screening-heading" className="mb-10">
      <h2 id="next-screening-heading" className="mb-4 font-display text-3xl text-ink-strong">Next confirmed screening</h2>
      <FixtureCard fixture={next} location="next_fixture" anchor={false} />
    </section>}
    {live.length > 0 && <section aria-labelledby="live-screening-heading" className="mb-10">
      <h2 id="live-screening-heading" className="mb-4 font-display text-3xl text-ink-strong">Showing now</h2>
      <div className="grid gap-5 md:grid-cols-2">{live.map(f => <FixtureCard key={f.id} fixture={f} location="live_fixture" anchor={false} />)}</div>
    </section>}
    {!stale && !next && live.length === 0 && <p className="mb-8 text-ink-muted">There is no upcoming confirmed screening to book at the moment. The full fixture guide below shows the latest decisions.</p>}
    <section id="fixtures" className="scroll-mt-28" aria-labelledby="fixture-heading">
      <h2 id="fixture-heading" className="font-display text-3xl text-ink-strong">Choose your game and book a table</h2>
      <p className="mt-3 text-ink-muted">All times are UK time. Check when we open, what we are showing and when food is served, then book for your chosen game.</p>
      <div className="my-6 flex flex-wrap items-end gap-4">
        <label className="text-sm font-semibold text-ink-strong">Team<select aria-label="Filter by team" value={team} onChange={e => { setTeam(e.target.value); trackFilter('team', e.target.value) }} className="mt-1 block min-h-12 rounded-pill border border-line bg-surface px-3"><option value="all">All teams</option>{teams.map(t => <option key={t}>{t}</option>)}</select></label>
        <label className="text-sm font-semibold text-ink-strong">Round<select aria-label="Filter by round" value={round} onChange={e => { setRound(e.target.value); trackFilter('round', e.target.value) }} className="mt-1 block min-h-12 rounded-pill border border-line bg-surface px-3"><option value="all">All rounds</option>{[4, 5, 6].map(r => <option key={r} value={r}>Round {r}</option>)}<option value="finals">Finals Weekend</option></select></label>
        <button type="button" aria-pressed={confirmed} onClick={() => { setConfirmed(!confirmed); trackFilter('confirmed', String(!confirmed)) }} className="min-h-12 rounded-pill border border-line px-4 font-semibold text-ink-strong">{confirmed ? 'Showing confirmed screenings' : 'Show confirmed screenings'}</button>
        <button type="button" onClick={() => { setTeam('all'); setRound('all'); setConfirmed(false); trackFilter('all', 'all') }} className="min-h-12 px-3 text-accent-text underline">Show all fixtures</button>
      </div>
      <p aria-live="polite" className="mb-4 text-sm text-ink-muted">{filtered.length} {filtered.length === 1 ? 'fixture' : 'fixtures'} shown</p>
      <div className="space-y-10">{Array.from(fixturesByDate, ([date, group]) => <section key={date} aria-labelledby={`fixture-date-${date}`}>
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
          <h3 id={`fixture-date-${date}`} className="font-display text-2xl font-bold text-ink-strong"><time dateTime={date}>{group.label}</time></h3>
          <p className="text-sm text-ink-muted">{group.fixtures.length} {group.fixtures.length === 1 ? 'game' : 'games'}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">{group.fixtures.map(f => <FixtureCard key={f.id} fixture={f} stale={stale} headingLevel={4} />)}</div>
      </section>)}</div>
      {filtered.length === 0 && <p className="py-8 text-ink-muted">No fixtures match these filters. Choose all fixtures to see the full guide.</p>}
    </section>
    {englandFixtures.length > 0 && <section id="england-fixtures" aria-labelledby="england-fixtures-heading" className="mt-10 scroll-mt-28">
      <h2 id="england-fixtures-heading" className="font-display text-3xl text-ink-strong">England rugby fixtures in November 2026</h2>
      <p className="mt-3 text-ink-muted">Choose an England game below to check the screening and book your table.</p>
      <ul className="mt-4 space-y-4">{englandFixtures.map(f => {
        const menu = fixtureFoodMenu(f)
        return <li key={f.id} className="rounded-card border border-line bg-surface p-4">
        <a href={`#fixture-${f.id}`} onClick={() => trackNationsEvent('select_fixture', { fixture_id: f.id, fixture_name: `${f.teamA} v ${f.teamB}`, cta_location: 'england_fixtures' })} className="inline-flex min-h-11 items-center font-semibold text-accent-text underline">{f.teamA} v {f.teamB}</a>
        {!stale && isBookableScreening(f) && f.screening.foodPromotion.message && <p className="mt-1 text-sm text-ink-strong">{f.screening.foodPromotion.message} {menu && <a href={menu.href} className="text-accent-text underline">{menu.label}</a>}</p>}
      </li>})}</ul>
    </section>}
  </>
}
