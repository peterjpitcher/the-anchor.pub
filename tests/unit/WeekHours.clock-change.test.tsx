import { render, screen, within } from '@testing-library/react'

// The week's hours table on the two clock-change weekends.
//
// "Today" in the table is London's today. On 25 October 2026 the day is 25 hours long and on
// 28 March 2027 it is 23, so a table that steps forward 24 hours at a time, or that reads the
// calendar of the server (UTC) or of the visitor's phone, can name the wrong day or show one
// twice. `npm test` runs this in London, `npm run test:utc` in UTC and `npm run test:zones` in
// Sydney and Los Angeles. Every instant below is in UTC.

const state: { hours: any } = { hours: null }

jest.mock('@/components/providers/BusinessHoursProvider', () => ({
  useBusinessHoursContext: () => ({ hours: state.hours, loading: false, error: null })
}))

import { WeekHours } from '@/components/WeekHours'

const day = (opens: string) => ({
  opens,
  closes: '22:00:00',
  kitchen: null,
  is_closed: false,
  is_kitchen_closed: true,
  schedule_config: []
})

// Monday opens at 4pm, every other day at noon, so Monday's row is recognisable.
const regularHours = {
  monday: day('16:00:00'),
  tuesday: day('12:00:00'),
  wednesday: day('12:00:00'),
  thursday: day('12:00:00'),
  friday: day('12:00:00'),
  saturday: day('12:00:00'),
  sunday: day('12:00:00')
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function renderAt(instant: string) {
  jest.useFakeTimers()
  jest.setSystemTime(new Date(instant))
  state.hours = {
    regularHours,
    specialHours: [],
    currentStatus: { isOpen: false, kitchenOpen: false, closesIn: null, opensIn: null }
  }
  return render(<WeekHours />)
}

function expectToday(weekday: string) {
  // Exactly one row is today, and it is the London weekday.
  expect(screen.getAllByLabelText(/\(today\)/)).toHaveLength(1)
  expect(screen.getByLabelText(new RegExp(`^${weekday} \\(today\\)`))).toBeInTheDocument()
  // Every weekday appears once: no day shown twice, none missing.
  for (const name of WEEKDAYS) {
    expect(screen.getAllByLabelText(new RegExp(`^${name}\\b`))).toHaveLength(1)
  }
}

afterEach(() => {
  jest.useRealTimers()
})

describe('WeekHours when the clocks go back, Sunday 25 October 2026', () => {
  it.each([
    ['11:30pm on Saturday, British Summer Time', '2026-10-24T22:30:00Z', 'Saturday'],
    ['12:30am on Sunday, British Summer Time', '2026-10-24T23:30:00Z', 'Sunday'],
    ['the first 1:30am', '2026-10-25T00:30:00Z', 'Sunday'],
    ['the second 1:30am', '2026-10-25T01:30:00Z', 'Sunday'],
    ['noon on Sunday', '2026-10-25T12:00:00Z', 'Sunday'],
    ['11:30pm on Sunday, Greenwich Mean Time', '2026-10-25T23:30:00Z', 'Sunday'],
    ['12:30am on Monday', '2026-10-26T00:30:00Z', 'Monday']
  ])('names the right day at %s', (_label, instant, weekday) => {
    renderAt(instant)
    expectToday(weekday)
  })

  it("shows Monday's 4pm opening on Monday's row, seen from the Sunday", () => {
    renderAt('2026-10-25T12:00:00Z')
    const monday = screen.getByLabelText(/^Monday\b/)
    expect(within(monday).getByText(/4pm/)).toBeInTheDocument()
  })
})

describe('WeekHours when the clocks go forward, Sunday 28 March 2027', () => {
  it.each([
    ['11:30pm on Saturday, Greenwich Mean Time', '2027-03-27T23:30:00Z', 'Saturday'],
    ['12:30am on Sunday', '2027-03-28T00:30:00Z', 'Sunday'],
    ['3am on Sunday, just after the change', '2027-03-28T02:00:00Z', 'Sunday'],
    ['noon on Sunday', '2027-03-28T11:00:00Z', 'Sunday'],
    ['11:30pm on Sunday, British Summer Time', '2027-03-28T22:30:00Z', 'Sunday'],
    ['12:30am on Monday, which is still Sunday in UTC', '2027-03-28T23:30:00Z', 'Monday']
  ])('names the right day at %s', (_label, instant, weekday) => {
    renderAt(instant)
    expectToday(weekday)
  })

  it("shows Monday's 4pm opening on Monday's row, seen from the Sunday", () => {
    renderAt('2027-03-28T11:00:00Z')
    const monday = screen.getByLabelText(/^Monday\b/)
    expect(within(monday).getByText(/4pm/)).toBeInTheDocument()
  })
})
