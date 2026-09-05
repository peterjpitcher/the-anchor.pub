import { render, screen, fireEvent, within, act } from '@testing-library/react'
import { NationsChampionshipFixtures } from '@/components/features/nations-championship/NationsChampionshipFixtures'
import { FixtureCard } from '@/components/features/nations-championship/FixtureCard'
import { nationsFeed, nationsFixture, approvedNationsFixture, sundayNationsFixture } from '../fixtures/nations-championship'
jest.mock('@/lib/nations-championship/tracking', () => ({ trackNationsEvent: jest.fn() }))
beforeEach(() => {
  jest.useFakeTimers()
  jest.setSystemTime(new Date('2026-09-05T07:00:00Z'))
  global.fetch = jest.fn().mockImplementation(() => new Promise(() => {}))
})
const originalFetch = global.fetch
afterEach(() => { jest.useRealTimers(); global.fetch = originalFetch })
it('promotes food and booking for an early game while making the missed start explicit', () => {
  render(<FixtureCard fixture={nationsFixture()} />)
  expect(screen.getByText(/miss the start/)).toBeVisible()
  expect(screen.getByText(/Food served noon to 7pm/)).toBeVisible()
  expect(screen.getByRole('link', { name: 'View the food menu' })).toHaveAttribute('href', '/food-menu')
  expect(screen.getByRole('link', { name: /Book a table for Italy v South Africa/ })).toHaveAttribute('href', expect.stringContaining('fixture_id=10000000'))
})
it('disables booking and food promises when a refresh is stale', () => {
  render(<FixtureCard fixture={nationsFixture()} stale />)
  expect(screen.queryByRole('link', { name: /Book a table for/ })).not.toBeInTheDocument()
  expect(screen.queryByText(/Food served noon to 7pm/)).not.toBeInTheDocument()
  expect(screen.getByText('Refresh the page to check this game and book your table.')).toBeVisible()
  expect(screen.queryByText('Match bookings open when the screening is confirmed.')).not.toBeInTheDocument()
})
it('shows all fixtures then filters by team without changing URLs', () => {
  render(<NationsChampionshipFixtures initialFeed={nationsFeed()} />)
  expect(screen.getByText('1 fixture shown')).toBeVisible()
  fireEvent.change(screen.getByLabelText('Filter by team'), { target: { value: 'England' } })
  expect(screen.getByText('0 fixtures shown')).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'Show all fixtures' }))
  expect(within(document.getElementById('fixtures')!).getByText('Italy v South Africa')).toBeVisible()
})
it('pauses promises after a failed refresh and restores them after recovery', async () => {
  global.fetch = jest.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValue({ ok: true, json: async () => nationsFeed() })
  render(<NationsChampionshipFixtures initialFeed={nationsFeed()} />)
  await act(async () => { jest.advanceTimersByTime(60000) })
  expect(screen.getByRole('alert')).toHaveTextContent('booking links are paused')
  expect(screen.getByRole('button', { name: 'Refresh page' })).toBeVisible()
  expect(screen.queryByText(/There is no upcoming confirmed screening/)).not.toBeInTheDocument()
  expect(screen.queryAllByRole('link', { name: /Book a table for/ })).toHaveLength(0)
  await act(async () => { jest.advanceTimersByTime(60000) })
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(screen.getAllByRole('link', { name: /Book a table for/ })).not.toHaveLength(0)
})
it('times out a hung refresh and permits a later retry', async () => {
  global.fetch = jest.fn().mockImplementationOnce((_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(new Error('Timeout')))
  })).mockResolvedValue({ ok: true, json: async () => nationsFeed() })
  render(<NationsChampionshipFixtures initialFeed={nationsFeed()} />)
  await act(async () => { jest.advanceTimersByTime(70000) })
  expect(screen.getByRole('alert')).toBeVisible()
  await act(async () => { jest.advanceTimersByTime(60000) })
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('offers approved terrestrial bookings with an honest closing warning', () => {
  render(<FixtureCard fixture={approvedNationsFixture(true)} />)
  expect(screen.getByRole('link', { name: /Book a table for Italy/ })).toBeVisible()
  expect(screen.getByText(/Exact channel details will follow/)).toBeVisible()
  expect(screen.getByText(/Viewing ends at 10:00pm/)).toBeVisible()
  expect(screen.queryByText(/miss the start/)).not.toBeInTheDocument()
})


it('groups games by London date in kickoff order and keeps each fixture anchor unique', () => {
  const first = nationsFixture({ id: 'first', kickOffAt: '2026-11-06T20:10:00Z' })
  const early = nationsFixture({ id: 'early', kickOffAt: '2026-11-07T11:40:00Z' })
  const late = nationsFixture({ id: 'late', kickOffAt: '2026-11-07T20:10:00Z', teamA: 'England' })
  render(<NationsChampionshipFixtures initialFeed={nationsFeed([late, early, first])} />)
  const fixtures = within(document.getElementById('fixtures')!)
  expect(fixtures.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent)).toEqual([
    'Friday 6 November 2026', 'Saturday 7 November 2026',
  ])
  const saturday = screen.getByRole('region', { name: 'Saturday 7 November 2026' })
  expect(within(saturday).getByText('2 games')).toBeVisible()
  expect(within(saturday).getAllByRole('heading', { level: 4 }).map(heading => heading.textContent)).toEqual(['Italy v South Africa', 'England v South Africa'])
  expect(within(saturday).getAllByRole('article').map(article => article.id)).toEqual(['fixture-early', 'fixture-late'])
  expect(document.querySelectorAll('#fixture-early')).toHaveLength(1)
})

it('removes empty date groups when filtering and restores them on reset', () => {
  const italy = nationsFixture({ id: 'italy', kickOffAt: '2026-11-06T20:10:00Z' })
  const england = nationsFixture({ id: 'england', teamA: 'England', roundNumber: 5 })
  const cancelled = nationsFixture({ id: 'cancelled', teamA: 'England', roundNumber: 5, matchState: 'cancelled', kickOffAt: '2026-11-08T15:10:00Z' })
  render(<NationsChampionshipFixtures initialFeed={nationsFeed([italy, england, cancelled])} />)
  fireEvent.change(screen.getByLabelText('Filter by team'), { target: { value: 'England' } })
  fireEvent.change(screen.getByLabelText('Filter by round'), { target: { value: '5' } })
  fireEvent.click(screen.getByRole('button', { name: 'Show confirmed screenings' }))
  expect(screen.getByText('1 fixture shown')).toBeVisible()
  expect(screen.getByRole('region', { name: 'Saturday 7 November 2026' })).toBeVisible()
  expect(screen.queryByRole('region', { name: 'Friday 6 November 2026' })).not.toBeInTheDocument()
  expect(screen.queryByRole('region', { name: 'Sunday 8 November 2026' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Show all fixtures' }))
  expect(screen.getByText('3 fixtures shown')).toBeVisible()
  expect(screen.getByRole('region', { name: 'Friday 6 November 2026' })).toBeVisible()
})

it('uses the London calendar date when UTC falls on the previous day', () => {
  render(<NationsChampionshipFixtures initialFeed={nationsFeed([
    nationsFixture({ id: 'bst-midnight', kickOffAt: '2026-07-10T23:30:00Z' }),
  ])} />)
  const heading = screen.getByRole('heading', { level: 3, name: 'Saturday 11 July 2026' })
  expect(heading.querySelector('time')).toHaveAttribute('datetime', '2026-07-11')
})

it('refreshes immediately so an old initial screening decision does not delay bookings', async () => {
  const pending = nationsFixture({ bookingApproved: false, screeningDecision: 'unconfirmed' })
  pending.screening = { ...pending.screening, status: 'awaiting_decision', canBookForScreening: false }
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => nationsFeed([approvedNationsFixture()]) })
  render(<NationsChampionshipFixtures initialFeed={nationsFeed([pending])} />)
  expect(screen.queryAllByRole('link', { name: /Book a table for/ })).toHaveLength(0)
  await act(async () => {})
  expect(global.fetch).toHaveBeenCalledTimes(1)
  expect(screen.getAllByRole('link', { name: /Book a table for/ }).length).toBeGreaterThan(0)
  expect(screen.queryByText('Match bookings open when the screening is confirmed.')).not.toBeInTheDocument()
})


it('offers a full page refresh when feed validation fails, without claiming bookings await approval', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ schemaVersion: 999 }) })
  render(<NationsChampionshipFixtures initialFeed={nationsFeed([approvedNationsFixture()])} />)
  await act(async () => {})
  expect(screen.getByRole('alert')).toHaveTextContent('Refresh the page to load the latest version')
  expect(screen.getByRole('button', { name: 'Refresh page' })).toBeVisible()
  expect(screen.queryAllByRole('link', { name: /Book a table for/ })).toHaveLength(0)
  expect(screen.queryByText('Match bookings open when the screening is confirmed.')).not.toBeInTheDocument()
  expect(screen.queryByText(/There is no upcoming confirmed screening/)).not.toBeInTheDocument()
})


it('uses Sunday roast links on the game card and England highlight with kitchen hours separate from opening', () => {
  render(<NationsChampionshipFixtures initialFeed={nationsFeed([sundayNationsFixture()])} />)
  const card = document.getElementById('fixture-' + sundayNationsFixture().id)!
  expect(within(card).getByRole('link', { name: 'View the Sunday roast menu' })).toHaveAttribute('href', '/sunday-roast')
  expect(within(card).getByText('Pub open noon to 9pm.')).toBeVisible()
  expect(within(card).getByText(/Food served 1pm to 6pm/)).toBeVisible()
  const england = document.getElementById('england-fixtures')!
  expect(within(england).getByRole('link', { name: 'View the Sunday roast menu' })).toHaveAttribute('href', '/sunday-roast')
  expect(screen.queryByRole('link', { name: 'View the food menu' })).not.toBeInTheDocument()
})

it('offers conditional late viewing without a hard closing claim or changed food promise', () => {
  const fixture = approvedNationsFixture(true)
  fixture.screening.lateFinishPolicy = 'stay_open_if_viewers'
  fixture.screening.openingLabel = 'Usual pub hours: noon to 10pm. If people are still here watching, we will stay open until the game finishes. Please arrive before our usual closing time.'
  render(<FixtureCard fixture={fixture} />)
  expect(screen.getByText(/If people are still here watching/)).toHaveTextContent('Please arrive before our usual closing time.')
  expect(screen.queryByText(/Viewing ends/)).not.toBeInTheDocument()
  expect(screen.getByText('Usual pub hours: noon to 10pm. If people are still here watching, we will stay open until the game finishes. Please arrive before our usual closing time.')).toBeVisible()
  expect(screen.getByText(/Food served noon to 7pm/)).toBeVisible()
  expect(screen.getByRole('link', { name: /Book a table for Italy/ })).toBeVisible()
})
