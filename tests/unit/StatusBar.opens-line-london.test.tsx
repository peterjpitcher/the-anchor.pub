import { render, screen } from '@testing-library/react'
import { StatusBar } from '@/components/layout/StatusBar'

// The header's "Bar: Opens at" line, read on the pub's clock.
//
// It used to build today's opening time with Date.setHours, which reads the clock of the device
// showing the page. A phone on Sydney or Los Angeles time was told "Opens tomorrow at 12pm" at
// 6am on a Monday, when the bar opens at 4pm that day. The line now compares London minutes with
// London minutes, the rule the kitchen line in the same file already followed.
//
// `npm test` runs this in Europe/London and `npm run test:utc` in UTC. UTC is an hour behind
// London all summer, so the British Summer Time cases below fail on the old code in the UTC run.
// `npm run test:zones` runs the same file as a phone in Sydney and in Los Angeles.

jest.mock('@/hooks/useBusinessHours', () => ({
  useBusinessHours: jest.fn()
}))

import { useBusinessHours } from '@/hooks/useBusinessHours'

const day = (opens: string) => ({
  opens,
  closes: '22:00:00',
  kitchen: null,
  is_closed: false,
  is_kitchen_closed: true,
  schedule_config: []
})

// Monday opens at 4pm, every other day at noon (docs/SSOT.md section 3).
const regularHours = {
  monday: day('16:00:00'),
  tuesday: day('12:00:00'),
  wednesday: day('12:00:00'),
  thursday: day('12:00:00'),
  friday: day('12:00:00'),
  saturday: day('12:00:00'),
  sunday: day('12:00:00')
}

function renderClosedAt(instant: string) {
  jest.useFakeTimers()
  jest.setSystemTime(new Date(instant))
  const mockUseBusinessHours = useBusinessHours as jest.MockedFunction<typeof useBusinessHours>
  mockUseBusinessHours.mockReturnValue({
    hours: {
      regularHours,
      specialHours: [],
      currentStatus: { isOpen: false, kitchenOpen: false, closesIn: null, opensIn: null },
      // The management API's `today` describes the calendar day and carries no times.
      today: { date: instant.slice(0, 10), summary: '', isSpecialHours: false, events: [] }
    } as any,
    loading: false,
    error: null,
    isStale: false,
    refresh: async () => {}
  })
  render(<StatusBar showKitchen={false} showPlaneSpotting={false} />)
}

afterEach(() => {
  jest.useRealTimers()
})

describe('StatusBar "Opens at" line uses London time, whatever the device clock says', () => {
  it('says 4pm today at 6am on a Monday (the reported case)', () => {
    // 06:00 BST on Monday 12 October 2026.
    renderClosedAt('2026-10-12T05:00:00Z')
    expect(screen.getByText('Bar: Opens at 4pm')).toBeInTheDocument()
  })

  it('says noon today at 9am on a Thursday', () => {
    // 09:00 BST on Thursday 8 October 2026.
    renderClosedAt('2026-10-08T08:00:00Z')
    expect(screen.getByText('Bar: Opens at 12pm')).toBeInTheDocument()
  })

  it('does not promise an opening time that has already passed in London', () => {
    // 12:30 BST on Tuesday 7 July 2026 is 11:30 UTC. A device on UTC still reads "before noon".
    renderClosedAt('2026-07-07T11:30:00Z')
    expect(screen.queryByText('Bar: Opens at 12pm')).not.toBeInTheDocument()
    expect(screen.getByText('Bar: Opens tomorrow at 12pm')).toBeInTheDocument()
  })
})

describe('StatusBar "Opens at" line on the day the clocks go back, Sunday 25 October 2026', () => {
  it('says noon today during the first 1:30am (still British Summer Time)', () => {
    renderClosedAt('2026-10-25T00:30:00Z')
    expect(screen.getByText('Bar: Opens at 12pm')).toBeInTheDocument()
  })

  it('says noon today during the second 1:30am (now Greenwich Mean Time)', () => {
    renderClosedAt('2026-10-25T01:30:00Z')
    expect(screen.getByText('Bar: Opens at 12pm')).toBeInTheDocument()
  })

  it('says noon today at 11:59am', () => {
    renderClosedAt('2026-10-25T11:59:00Z')
    expect(screen.getByText('Bar: Opens at 12pm')).toBeInTheDocument()
  })

  it("moves on to Monday's 4pm once noon has passed", () => {
    renderClosedAt('2026-10-25T12:01:00Z')
    expect(screen.getByText('Bar: Opens tomorrow at 4pm')).toBeInTheDocument()
  })

  it('says noon today on the Saturday before, at 11:30am British Summer Time', () => {
    renderClosedAt('2026-10-24T10:30:00Z')
    expect(screen.getByText('Bar: Opens at 12pm')).toBeInTheDocument()
  })
})

describe('StatusBar "Opens at" line on the day the clocks go forward, Sunday 28 March 2027', () => {
  it('says noon today at 12:30am, before the change', () => {
    renderClosedAt('2027-03-28T00:30:00Z')
    expect(screen.getByText('Bar: Opens at 12pm')).toBeInTheDocument()
  })

  it('says noon today at 11:30am British Summer Time', () => {
    renderClosedAt('2027-03-28T10:30:00Z')
    expect(screen.getByText('Bar: Opens at 12pm')).toBeInTheDocument()
  })

  it("moves on to Monday's 4pm at 12:30pm British Summer Time, which is 11:30 UTC", () => {
    renderClosedAt('2027-03-28T11:30:00Z')
    expect(screen.queryByText('Bar: Opens at 12pm')).not.toBeInTheDocument()
    expect(screen.getByText('Bar: Opens tomorrow at 4pm')).toBeInTheDocument()
  })
})
