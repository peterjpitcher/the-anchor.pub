import { render, screen, act } from '@testing-library/react'

// The tracking dispatcher gates dataLayer pushes behind cookie consent. In
// unit tests we always want events to flow so we can assert them.
jest.mock('@/lib/cookies', () => ({
  canUseCookieCategory: () => true,
}))

import { LaunchAnnouncement } from '../LaunchAnnouncement'

// Boundary fixtures align with the constants in lib/constants.ts:
//   WALK_IN_LAUNCH_STARTS_AT_MS = 2026-05-17T00:00:00+01:00 (BST)
//   WALK_IN_LAUNCH_BANNER_ENDS_AT_MS = 2026-05-17T18:00:00+01:00 (BST)
const MAY_16_BST = new Date('2026-05-16T23:30:00+01:00').getTime()
const MAY_17_AT_NOON_BST = new Date('2026-05-17T12:00:00+01:00').getTime()
const MAY_17_AT_19_BST = new Date('2026-05-17T19:00:00+01:00').getTime()

describe('LaunchAnnouncement', () => {
  let originalNow: () => number
  let dataLayer: Array<Record<string, unknown>>

  beforeEach(() => {
    originalNow = Date.now
    // Reset the GA4 dataLayer so each test starts with a fresh queue. The
    // tracking dispatcher writes here directly via `window.dataLayer.push`.
    dataLayer = []
    ;(window as any).dataLayer = dataLayer
  })

  afterEach(() => {
    Date.now = originalNow
    jest.useRealTimers()
    delete (window as any).dataLayer
  })

  it('renders pre-launch copy before May 17 BST', () => {
    Date.now = () => MAY_16_BST
    render(<LaunchAnnouncement variant="banner" />)
    expect(
      screen.getByText(/Sunday roast starts Sunday 17 May 2026/i)
    ).toBeInTheDocument()
  })

  it('renders launch-day copy between 17 May 00:00 and 18:00 BST', () => {
    Date.now = () => MAY_17_AT_NOON_BST
    render(<LaunchAnnouncement variant="hero" />)
    expect(
      screen.getByText(/Walk-ins welcome today from 1pm/i)
    ).toBeInTheDocument()
  })

  it('renders nothing after 17 May 18:00 BST', () => {
    Date.now = () => MAY_17_AT_19_BST
    const { container } = render(<LaunchAnnouncement variant="slim" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('hides the slim variant pre-launch (footer slim is omitted before 17 May per spec §8.7)', () => {
    Date.now = () => MAY_16_BST
    const { container } = render(<LaunchAnnouncement variant="slim" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the slim variant on launch day', () => {
    Date.now = () => MAY_17_AT_NOON_BST
    render(<LaunchAnnouncement variant="slim" />)
    expect(
      screen.getByText(/Walk-ins welcome today from 1pm/i)
    ).toBeInTheDocument()
  })

  it('client child re-checks expiry on interval and switches', () => {
    jest.useFakeTimers()
    Date.now = () => MAY_16_BST
    render(<LaunchAnnouncement variant="banner" />)
    expect(screen.getByText(/Sunday roast starts Sunday 17 May/i)).toBeInTheDocument()

    Date.now = () => MAY_17_AT_NOON_BST
    act(() => {
      jest.advanceTimersByTime(60_000)
    })
    expect(screen.getByText(/today from 1pm/i)).toBeInTheDocument()
  })

  it('fires banner_interaction view event on initial render with the current state', () => {
    Date.now = () => MAY_16_BST
    render(<LaunchAnnouncement variant="banner" />)

    const events = dataLayer.filter((e) => e.event === 'banner_interaction')
    expect(events.length).toBeGreaterThanOrEqual(1)
    expect(events[0]).toMatchObject({
      event: 'banner_interaction',
      banner_id: 'sunday_walk_in_launch',
      banner_action: 'view',
      banner_campaign: 'walk_in_launch_2026',
      banner_label: 'pre_launch',
    })
  })

  it('fires banner_interaction transition event when state flips on interval', () => {
    jest.useFakeTimers()
    Date.now = () => MAY_16_BST
    render(<LaunchAnnouncement variant="banner" />)

    // Initial mount fires the pre_launch view event.
    expect(
      dataLayer.filter((e) => e.event === 'banner_interaction').map((e) => e.banner_label)
    ).toEqual(['pre_launch'])

    // Advance timers to cross the launch boundary.
    Date.now = () => MAY_17_AT_NOON_BST
    act(() => {
      jest.advanceTimersByTime(60_000)
    })

    expect(
      dataLayer.filter((e) => e.event === 'banner_interaction').map((e) => e.banner_label)
    ).toEqual(['pre_launch', 'launch_day'])

    // Advance again past the end of the banner window.
    Date.now = () => MAY_17_AT_19_BST
    act(() => {
      jest.advanceTimersByTime(60_000)
    })

    expect(
      dataLayer.filter((e) => e.event === 'banner_interaction').map((e) => e.banner_label)
    ).toEqual(['pre_launch', 'launch_day', 'hidden'])
  })
})
