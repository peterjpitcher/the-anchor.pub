import { render, screen, fireEvent, within, act } from '@testing-library/react'
import { NationsChampionshipFixtures } from '@/components/features/nations-championship/NationsChampionshipFixtures'
import { FixtureCard } from '@/components/features/nations-championship/FixtureCard'
import { nationsFeed, nationsFixture, approvedNationsFixture } from '../fixtures/nations-championship'
jest.mock('@/lib/nations-championship/tracking', () => ({ trackNationsEvent: jest.fn() }))
beforeEach(() => { jest.useFakeTimers(); jest.setSystemTime(new Date('2026-09-05T07:00:00Z')) })
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
