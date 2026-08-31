import { render, screen } from '@testing-library/react'
import { StatusBar } from '@/components/layout/StatusBar'

jest.mock('@/hooks/useBusinessHours', () => ({
  useBusinessHours: jest.fn()
}))

jest.mock('@/hooks/useKitchenStatus', () => ({
  useKitchenStatus: jest.fn(() => ({ kitchen: null }))
}))

import { useBusinessHours } from '@/hooks/useBusinessHours'

/**
 * The site-wide header must agree with the hours table and the booking form
 * about the afternoon kitchen closure.
 *
 * From 1 September 2026 the kitchen serves lunch 12:00-15:00 and dinner
 * 16:00-21:00, but the API's `kitchen` field flattens that to a single
 * 12:00-21:00 span, and its `currentStatus.kitchenOpen` is derived from the
 * same span. Reading the span put "Kitchen: Open · closes 9pm" in the header
 * at half past three, while /book-table refused a food booking at that time.
 */

// Wednesday 2026-09-02. BST, so London is UTC+1.
const WEDNESDAY = {
  opens: '12:00:00',
  closes: '22:00:00',
  kitchen: { opens: '12:00:00', closes: '21:00:00' },
  is_closed: false,
  is_kitchen_closed: false,
  schedule_config: [
    { name: 'Lunch', starts_at: '12:00', ends_at: '15:00', capacity: 50, booking_type: 'regular' },
    { name: 'Dinner', starts_at: '16:00', ends_at: '21:00', capacity: 50, booking_type: 'regular' }
  ]
}

function payload(kitchenOpen: boolean) {
  return {
    currentStatus: { isOpen: true, kitchenOpen },
    // No opens/closes on `today`, matching the live payload, so the component
    // falls through to regularHours for the day.
    today: { date: '2026-09-02', dayName: 'wednesday', summary: '', isSpecialHours: false, events: [] },
    regularHours: { wednesday: WEDNESDAY },
    specialHours: [],
    upcomingVersions: []
  }
}

function renderAt(utcIso: string, kitchenOpen: boolean) {
  jest.setSystemTime(new Date(utcIso))
  ;(useBusinessHours as jest.Mock).mockReturnValue({
    hours: payload(kitchenOpen),
    loading: false,
    error: null
  })
  render(<StatusBar variant="nav" showKitchen showPlaneSpotting={false} />)
}

beforeAll(() => {
  jest.useFakeTimers()
})

afterAll(() => {
  jest.useRealTimers()
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('StatusBar kitchen line with two sittings', () => {
  it('closes at the end of the sitting in progress, not the end of the day', () => {
    // 13:00 London, inside the lunch sitting.
    renderAt('2026-09-02T12:00:00.000Z', true)
    expect(screen.getByText(/Kitchen: Open · closes 3pm/)).toBeInTheDocument()
    expect(screen.queryByText(/closes 9pm/)).not.toBeInTheDocument()
  })

  it('points at the next sitting during the afternoon closure', () => {
    // 15:30 London, in the gap. The API still reports kitchenOpen true because
    // it reads the flattened span, so the windows have to win here.
    renderAt('2026-09-02T14:30:00.000Z', true)
    expect(screen.getByText(/Kitchen: Opens at 4pm/)).toBeInTheDocument()
    // The bar line still reads "Open · closes 10pm", which is correct, so only
    // the kitchen line is asserted against here.
    expect(screen.queryByText(/Kitchen: Open · closes/)).not.toBeInTheDocument()
  })

  it('reports the dinner sitting closing time once it is under way', () => {
    // 17:00 London, inside dinner.
    renderAt('2026-09-02T16:00:00.000Z', true)
    expect(screen.getByText(/Kitchen: Open · closes 9pm/)).toBeInTheDocument()
  })

  it('points at the first sitting before the kitchen opens', () => {
    // 11:00 London, before lunch service.
    renderAt('2026-09-02T10:00:00.000Z', false)
    expect(screen.getByText(/Kitchen: Opens at 12pm/)).toBeInTheDocument()
  })
})
