import { render, screen } from '@testing-library/react'
import { StatusBar } from '@/components/layout/StatusBar'

// The header between midnight and a 1am close.
//
// New Year's Eve 2026 is 12:00 to 01:00 and 1 January is closed. At 00:30 the pub is open on 31
// December's hours, but the header printed today's closing time, and today (1 January) has none,
// so it said just "Bar: Open". The management API's live status now carries the closing time in
// force. Instants are in UTC; London is on GMT (UTC+0) from 25 October 2026 to 28 March 2027.

jest.mock('@/hooks/useBusinessHours', () => ({
  useBusinessHours: jest.fn()
}))

jest.mock('@/hooks/useKitchenStatus', () => ({
  useKitchenStatus: jest.fn(() => ({ kitchen: null }))
}))

import { useBusinessHours } from '@/hooks/useBusinessHours'

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
  const mockUseBusinessHours = useBusinessHours as jest.MockedFunction<typeof useBusinessHours>
  mockUseBusinessHours.mockReturnValue({
    hours: {
      regularHours,
      specialHours,
      currentStatus: { kitchenOpen: false, closesIn: null, opensIn: null, ...currentStatus },
      // The management API's `today` describes the calendar day and carries no times.
      today: { date: instant.slice(0, 10), dayName: 'friday', summary: 'Closed', isSpecialHours: true, events: [] }
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

describe('StatusBar after midnight on a 1am night', () => {
  it('says the bar closes at 1am at 00:30 on 1 January', () => {
    renderAt('2027-01-01T00:30:00Z', { isOpen: true, tradingDate: '2026-12-31', closes: '01:00:00', closesAt: '2027-01-01T01:00:00.000Z' })
    expect(screen.getByText('Bar: Open · closes 1am')).toBeInTheDocument()
  })

  it('says the bar closes at 1am at 23:30 on 31 December', () => {
    renderAt('2026-12-31T23:30:00Z', { isOpen: true, tradingDate: '2026-12-31', closes: '01:00:00', closesAt: '2027-01-01T01:00:00.000Z' })
    expect(screen.getByText('Bar: Open · closes 1am')).toBeInTheDocument()
  })

  it('still says just "Open" when an older API sends no closing time', () => {
    renderAt('2027-01-01T00:30:00Z', { isOpen: true })
    expect(screen.getByText('Bar: Open')).toBeInTheDocument()
  })

  it('is unchanged on an ordinary day', () => {
    // 15:00 BST on Friday 11 September 2026.
    renderAt('2026-09-11T14:00:00Z', { isOpen: true, tradingDate: '2026-09-11', closes: '22:00:00' }, [])
    expect(screen.getByText('Bar: Open · closes 10pm')).toBeInTheDocument()
  })
})
