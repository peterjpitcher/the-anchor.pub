import { render, screen, act } from '@testing-library/react'
import { LaunchAnnouncement } from '../LaunchAnnouncement'

// Boundary fixtures align with the constants in lib/constants.ts:
//   WALK_IN_LAUNCH_STARTS_AT_MS = 2026-05-17T00:00:00+01:00 (BST)
//   WALK_IN_LAUNCH_BANNER_ENDS_AT_MS = 2026-05-17T18:00:00+01:00 (BST)
const MAY_16_BST = new Date('2026-05-16T23:30:00+01:00').getTime()
const MAY_17_AT_NOON_BST = new Date('2026-05-17T12:00:00+01:00').getTime()
const MAY_17_AT_19_BST = new Date('2026-05-17T19:00:00+01:00').getTime()

describe('LaunchAnnouncement', () => {
  let originalNow: () => number

  beforeEach(() => {
    originalNow = Date.now
  })

  afterEach(() => {
    Date.now = originalNow
    jest.useRealTimers()
  })

  it('renders pre-launch copy before May 17 BST', () => {
    Date.now = () => MAY_16_BST
    render(<LaunchAnnouncement variant="banner" />)
    expect(
      screen.getByText(/Sunday lunch walk-ins start 17 May 2026/i)
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
    expect(screen.getByText(/walk-ins start 17 May/i)).toBeInTheDocument()

    Date.now = () => MAY_17_AT_NOON_BST
    act(() => {
      jest.advanceTimersByTime(60_000)
    })
    expect(screen.getByText(/today from 1pm/i)).toBeInTheDocument()
  })
})
