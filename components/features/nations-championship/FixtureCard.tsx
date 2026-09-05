'use client'
import { fixtureFoodMenu } from '@/lib/nations-championship/food-menu'
import Link from 'next/link'
import { DateTime } from 'luxon'
import { isBookableScreening, type ScreeningFixture } from '@/lib/nations-championship/types'
import { trackNationsEvent } from '@/lib/nations-championship/tracking'

export function fixtureBookingHref(fixture: ScreeningFixture): string {
  return `/book-table?${new URLSearchParams({ fixture_id: fixture.id, date: DateTime.fromISO(fixture.kickOffAt).setZone('Europe/London').toISODate()! })}`
}
const statusLabels: Record<ScreeningFixture['screening']['status'], string> = {
  awaiting_channel: 'Awaiting ITV channel confirmation', awaiting_decision: 'Screening decision pending',
  hours_unknown: 'Opening times unavailable', opening_conflict: 'Screening times under review',
  confirmed_full: 'Confirmed screening', confirmed_partial: 'Showing during opening hours',
  not_showing: 'Not showing', finished: 'Finished', cancelled: 'Cancelled',
}
export function FixtureCard({ fixture, stale = false, location = 'fixture_card', anchor = true, headingLevel = 3 }: {
  fixture: ScreeningFixture; stale?: boolean; location?: string; anchor?: boolean; headingLevel?: 3 | 4
}) {
  const Heading = headingLevel === 4 ? 'h4' : 'h3'
  const label = `${fixture.teamA} v ${fixture.teamB}`
  const kickoff = DateTime.fromISO(fixture.kickOffAt).setZone('Europe/London')
  const bookable = !stale && isBookableScreening(fixture)
  const menu = fixtureFoodMenu(fixture)
  const food = !stale && bookable ? fixture.screening.foodPromotion.message : null
  const tracking = { fixture_id: fixture.id, fixture_name: label, kickoff: fixture.kickOffAt, screening_status: fixture.screening.status, cta_location: location }
  return (
    <article id={anchor ? `fixture-${fixture.id}` : undefined} className="scroll-mt-28 rounded-card border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink-muted">
        <p>{fixture.finalPosition ? `Finals Weekend: ${fixture.finalPosition === 1 ? 'Championship final' : `Position ${fixture.finalPosition}`}` : `Round ${fixture.roundNumber ?? fixture.round}`}</p>
        <p className="font-semibold text-accent-text">{stale ? 'Details need checking' : statusLabels[fixture.screening.status]}</p>
      </div>
      <Heading className="mt-3 font-display text-2xl font-bold text-ink-strong">{label}</Heading>
      <p className="mt-2 text-ink-strong"><time dateTime={fixture.kickOffAt}>{kickoff.toFormat('cccc d LLLL yyyy')}</time></p>
      <p className="font-semibold text-ink-strong">Kick-off {kickoff.toFormat('h:mma').toLowerCase()} (UK time)</p>
      <p className="mt-3 text-ink-strong">{fixture.screening.openingLabel}</p>
      {['from_opening', 'from_opening_until_closing'].includes(fixture.coverage) && fixture.screening.status === 'confirmed_partial' && <p className="mt-2 font-semibold text-accent-text">Showing from {DateTime.fromISO(fixture.screening.screeningStartAt!).setZone('Europe/London').toFormat('h:mma').toLowerCase()}. You will miss the start of the game.</p>}
      {['until_closing', 'from_opening_until_closing'].includes(fixture.coverage) && fixture.screening.status === 'confirmed_partial' && !fixture.screening.lateFinishPolicy && <p className="mt-2 font-semibold text-accent-text">Viewing ends at {DateTime.fromISO(fixture.screening.screeningEndAt!).setZone('Europe/London').toFormat('h:mma').toLowerCase()} when the pub closes, even if the game continues.</p>}
      {fixture.bookingApproved && !fixture.linearChannel && <p className="mt-2 text-sm text-ink-muted">Terrestrial TV screening. Exact channel details will follow.</p>}
      {fixture.screeningDecision === 'confirmed' && <p className="mt-2 text-sm text-ink-muted">{fixture.linearChannel ?? 'Channel awaiting confirmation'} · {fixture.screenLabel ?? 'Screen allocation pending'} · {fixture.commentary === 'on' ? 'Commentary on' : fixture.commentary === 'off' ? 'Without commentary' : 'Commentary pending'}</p>}
      {food ? <div className="mt-4 rounded-card bg-surface-sunk p-4">
        <p className="font-semibold text-ink-strong">{fixture.screening.foodPromotion.kind === 'before_match' ? 'Make time for food before the rugby' : 'Food and rugby at The Anchor'}</p>
        <p className="mt-1 text-sm text-ink-strong">{food}</p>
        {menu && <Link className="mt-2 inline-block font-semibold text-accent-text underline underline-offset-4" href={menu.href}>{menu.label}</Link>}
      </div> : <p className="mt-3 text-sm text-ink-muted">{stale ? 'Please check screening and food service details before travelling.' : fixture.screening.kitchenLabel}</p>}
      {bookable ? <div className="mt-5 space-y-3">
        <Link href={fixtureBookingHref(fixture)} onClick={() => trackNationsEvent('book_rugby_click', tracking)} className="flex min-h-12 w-full items-center justify-center rounded-pill bg-anchor-green px-4 py-3 text-center font-bold text-white hover:bg-anchor-green-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-anchor-green">Book a table for {label}</Link>
        <a href={`/api/nations-championship/calendar/${fixture.id}`} onClick={() => trackNationsEvent('add_to_calendar', tracking)} className="inline-flex min-h-11 items-center text-sm text-accent-text underline underline-offset-4">Add this screening to your calendar</a>
      </div> : <p className="mt-4 text-sm text-ink-muted">{stale ? 'Refresh the page to check this game and book your table.' : ['finished', 'cancelled', 'not_showing'].includes(fixture.screening.status) ? 'No screening bookings for this fixture.' : 'Match bookings open when the screening is confirmed.'}</p>}
      <details className="mt-4 text-sm text-ink-muted">
        <summary className="cursor-pointer py-2">Fixture checks and sharing</summary>
        <p>{fixture.sourceCheckedAt ? `Fixture checked ${DateTime.fromISO(fixture.sourceCheckedAt).setZone('Europe/London').toFormat('d LLL yyyy, HH:mm')}` : 'Fixture verification pending'}</p>
        <p>{fixture.broadcastCheckedAt ? `Broadcast checked ${DateTime.fromISO(fixture.broadcastCheckedAt).setZone('Europe/London').toFormat('d LLL yyyy, HH:mm')}` : 'Channel verification pending'}</p>
        <Link href={`/live-sport/nations-championship#fixture-${fixture.id}`} onClick={() => trackNationsEvent('select_fixture', tracking)} className="inline-flex min-h-11 items-center underline">Link to {label}</Link>
      </details>
    </article>
  )
}
