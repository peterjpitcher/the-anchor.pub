import { render, screen, within } from '@testing-library/react'

// The week's hours between midnight and a 1am close.
//
// New Year's Eve 2026 is 12:00 to 01:00 and 1 January is closed. At 00:30 the panel said "Open
// now, the bar is open" beside today's row reading "Closed". It now says when the night ends.
// Instants are in UTC; London is on GMT (UTC+0) from 25 October 2026 to 28 March 2027.

const state: { hours: any } = { hours: null }

jest.mock('@/components/providers/BusinessHoursProvider', () => ({
  useBusinessHoursContext: () => ({ hours: state.hours, loading: false, error: null })
}))

import { WeekHours } from '@/components/WeekHours'

const weekday = { opens: '12:00:00', closes: '22:00:00', kitchen: null, is_closed: false, is_kitchen_closed: true, schedule_config: [] }
const regularHours = {
  monday: weekday,
  tuesday: weekday,
  wednesday: weekday,
  thursday: weekday,
  friday: weekday,
  saturday: weekday,
  sunday: weekday
}

const newYearSpecials = [
  { date: '2026-12-31', opens: '12:00:00', closes: '01:00:00', kitchen: null, is_closed: false, is_kitchen_closed: true, status: 'modified', note: null, schedule_config: [] },
  { date: '2027-01-01', opens: null, closes: null, kitchen: null, is_closed: true, is_kitchen_closed: true, status: 'closed', note: "New Year's Day", schedule_config: [] }
]

function renderAt(instant: string, currentStatus: Record<string, unknown>, specialHours = newYearSpecials) {
  jest.useFakeTimers()
  jest.setSystemTime(new Date(instant))
  state.hours = {
    regularHours,
    specialHours,
    currentStatus: { kitchenOpen: false, closesIn: null, opensIn: null, ...currentStatus }
  }
  render(<WeekHours />)
}

afterEach(() => {
  jest.useRealTimers()
})

describe('WeekHours after midnight on a 1am night', () => {
  it('says the bar is open until 1am at 00:30 on 1 January, beside today reading Closed', () => {
    renderAt('2027-01-01T00:30:00Z', { isOpen: true, tradingDate: '2026-12-31', closes: '01:00:00', closesAt: '2027-01-01T01:00:00.000Z' })
    expect(screen.getByText('Open now')).toBeInTheDocument()
    expect(screen.getByText('The bar is open until 1am, come on in.')).toBeInTheDocument()
    const today = screen.getByLabelText(/^Friday \(today\)/)
    expect(within(today).getByText('Closed')).toBeInTheDocument()
  })

  it('keeps the usual line at 23:30 on 31 December, when today is the night in force', () => {
    renderAt('2026-12-31T23:30:00Z', { isOpen: true, tradingDate: '2026-12-31', closes: '01:00:00' })
    expect(screen.getByText('The bar is open, come on in.')).toBeInTheDocument()
  })

  it('keeps the usual line when an older API sends no day in force', () => {
    renderAt('2027-01-01T00:30:00Z', { isOpen: true })
    expect(screen.getByText('The bar is open, come on in.')).toBeInTheDocument()
  })

  it('is unchanged on an ordinary day', () => {
    // 15:00 BST on Friday 11 September 2026.
    renderAt('2026-09-11T14:00:00Z', { isOpen: true, tradingDate: '2026-09-11', closes: '22:00:00' }, [])
    expect(screen.getByText('The bar is open, come on in.')).toBeInTheDocument()
  })

  it('says closed once the night has ended', () => {
    renderAt('2027-01-01T01:05:00Z', { isOpen: false, tradingDate: '2027-01-01', closes: null })
    expect(screen.getByText('Closed now')).toBeInTheDocument()
  })
})
