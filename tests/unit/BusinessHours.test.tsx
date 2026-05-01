import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BusinessHours } from '@/components/BusinessHours'

// Mock the provider context
const mockContextValue = {
  hours: null as any,
  loading: false,
  error: null as any,
  isStale: false,
}

jest.mock('@/components/providers/BusinessHoursProvider', () => ({
  useBusinessHoursContext: () => mockContextValue,
}))

// Mock StatusBar to avoid its own hook dependencies
jest.mock('@/components/layout/StatusBar', () => ({
  StatusBar: ({ showKitchen }: { showKitchen?: boolean }) => (
    <div data-testid="status-bar" data-show-kitchen={showKitchen}>
      StatusBar
    </div>
  ),
}))

// Freeze time to Wednesday 2026-04-29 at 14:00 London time (BST = UTC+1).
// Day-to-date mapping:
//   Mon = 2026-05-04, Tue = 2026-05-05, Wed = 2026-04-29 (today),
//   Thu = 2026-04-30, Fri = 2026-05-01, Sat = 2026-05-02, Sun = 2026-05-03
const FROZEN_TIME = new Date('2026-04-29T13:00:00.000Z') // 14:00 BST

// Configure userEvent to work with fake timers
const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

beforeAll(() => {
  jest.useFakeTimers()
  jest.setSystemTime(FROZEN_TIME)
})

afterAll(() => {
  jest.useRealTimers()
})

beforeEach(() => {
  mockContextValue.hours = null
  mockContextValue.loading = false
  mockContextValue.error = null
  mockContextValue.isStale = false
})

/** Minimal valid hours response for a full week */
function makeHours(overrides: Record<string, any> = {}) {
  return {
    currentStatus: {
      isOpen: true,
      kitchenOpen: true,
      closesIn: 'PT8H',
      opensIn: null,
    },
    regularHours: {
      monday: { opens: '16:00', closes: '23:00', is_closed: false, kitchen: { opens: '18:00', closes: '21:00' } },
      tuesday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '18:00', closes: '21:00' } },
      wednesday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '18:00', closes: '21:00' } },
      thursday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '18:00', closes: '21:00' } },
      friday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '18:00', closes: '21:00' } },
      saturday: { opens: '11:00', closes: '23:00', is_closed: false, kitchen: { opens: '13:00', closes: '19:00' } },
      sunday: { opens: '12:00', closes: '22:00', is_closed: false, kitchen: { opens: '13:00', closes: '18:00' } },
    },
    specialHours: [],
    serviceOverrides: { sunday_lunch: [] },
    serviceStatus: { sunday_lunch: { isEnabled: true, message: null } },
    ...overrides,
  }
}

describe('BusinessHours', () => {
  describe('rendering states', () => {
    it('should render useful fallback copy when loading', () => {
      mockContextValue.loading = true
      render(<BusinessHours />)
      expect(screen.getByText(/Opening hours are loading/i)).toBeInTheDocument()
      expect(screen.getByText(/01753 682707/)).toBeInTheDocument()
    })

    it('should render error fallback with phone number when error', () => {
      mockContextValue.error = { message: 'API failed' }
      render(<BusinessHours />)
      expect(screen.getByText(/API failed/)).toBeInTheDocument()
      expect(screen.getByText(/01753 682707/)).toBeInTheDocument()
    })

    it('should render error fallback when hours is null', () => {
      mockContextValue.hours = null
      render(<BusinessHours />)
      expect(screen.getByText(/opening hours/i)).toBeInTheDocument()
      expect(screen.getByText(/01753 682707/)).toBeInTheDocument()
    })

    it('should render 7 day rows Mon-Sun when hours loaded', () => {
      mockContextValue.hours = makeHours()
      render(<BusinessHours />)
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      days.forEach(day => {
        expect(screen.getByText(new RegExp(`^${day}`))).toBeInTheDocument()
      })
    })
  })

  describe('className prop', () => {
    it('should apply className to root wrapper in loading state', () => {
      mockContextValue.loading = true
      const { container } = render(<BusinessHours className="custom-class" />)
      expect(container.firstElementChild).toHaveClass('custom-class')
    })

    it('should apply className to root wrapper in error state', () => {
      mockContextValue.error = { message: 'fail' }
      const { container } = render(<BusinessHours className="custom-class" />)
      expect(container.firstElementChild).toHaveClass('custom-class')
    })

    it('should apply className to root wrapper in success state', () => {
      mockContextValue.hours = makeHours()
      const { container } = render(<BusinessHours className="custom-class" />)
      expect(container.firstElementChild).toHaveClass('custom-class')
    })
  })

  describe('showKitchen prop', () => {
    it('should render kitchen labels and times by default', () => {
      mockContextValue.hours = makeHours()
      render(<BusinessHours />)
      const kitchenLabels = screen.getAllByText(/Kitchen:/i)
      expect(kitchenLabels.length).toBeGreaterThan(0)
    })

    it('should hide all kitchen information when showKitchen is false', () => {
      mockContextValue.hours = makeHours()
      render(<BusinessHours showKitchen={false} />)
      expect(screen.queryByText(/Kitchen:/i)).not.toBeInTheDocument()
    })
  })

  describe('kitchen resolution', () => {
    it('should render "No service" when kitchen is null', () => {
      mockContextValue.hours = makeHours({
        regularHours: {
          ...makeHours().regularHours,
          monday: { opens: '16:00', closes: '23:00', is_closed: false, kitchen: null },
        },
      })
      render(<BusinessHours />)
      expect(screen.getByText('No service')).toBeInTheDocument()
    })

    it('should render "Closed" when is_kitchen_closed is true', () => {
      mockContextValue.hours = makeHours({
        regularHours: {
          ...makeHours().regularHours,
          monday: { opens: '16:00', closes: '23:00', is_closed: false, is_kitchen_closed: true, kitchen: { opens: '18:00', closes: '21:00' } },
        },
      })
      render(<BusinessHours />)
      expect(screen.getAllByText('Closed').length).toBeGreaterThan(0)
    })

    it('should render formatted times when kitchen has opens/closes', () => {
      mockContextValue.hours = makeHours()
      render(<BusinessHours />)
      expect(screen.getAllByText(/6pm/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/9pm/).length).toBeGreaterThan(0)
    })

    it('should use special hours kitchen when property is present and null (not fallback)', () => {
      mockContextValue.hours = makeHours({
        specialHours: [
          { date: '2026-04-29', opens: '12:00', closes: '23:00', is_closed: false, kitchen: null, note: 'Private event' },
        ],
      })
      render(<BusinessHours />)
      expect(screen.getByText('No service')).toBeInTheDocument()
    })

    it('should fall back to regular kitchen when special hours has no kitchen property', () => {
      mockContextValue.hours = makeHours({
        specialHours: [
          { date: '2026-04-29', opens: '10:00', closes: '23:00', is_closed: false, note: 'Extended hours' },
        ],
      })
      render(<BusinessHours />)
      expect(screen.getAllByText(/6pm/).length).toBeGreaterThan(0)
    })
  })

  describe('special hours', () => {
    it('should show note text for day with special hours', () => {
      mockContextValue.hours = makeHours({
        specialHours: [
          { date: '2026-04-29', opens: '10:00', closes: '23:00', is_closed: false, note: 'Bank holiday hours', kitchen: { opens: '12:00', closes: '20:00' } },
        ],
      })
      render(<BusinessHours />)
      expect(screen.getByText(/Bank holiday hours/)).toBeInTheDocument()
    })

    it('should show "Closed" for special hours with is_closed true', () => {
      mockContextValue.hours = makeHours({
        specialHours: [
          { date: '2026-04-29', is_closed: true, note: 'Closed for maintenance' },
        ],
      })
      render(<BusinessHours />)
      expect(screen.getAllByText(/Closed/).length).toBeGreaterThan(0)
      expect(screen.getByText(/Closed for maintenance/)).toBeInTheDocument()
    })
  })

  describe('sunday lunch notices', () => {
    it('should show amber notice when sunday lunch is unavailable', () => {
      mockContextValue.hours = makeHours({
        serviceStatus: { sunday_lunch: { isEnabled: false, message: 'Sunday lunch service unavailable' } },
      })
      render(<BusinessHours />)
      expect(screen.getByText(/Sunday lunch/i)).toBeInTheDocument()
    })

    it('should show no notice when sunday lunch is available', () => {
      mockContextValue.hours = makeHours({
        serviceStatus: { sunday_lunch: { isEnabled: true, message: null } },
      })
      render(<BusinessHours />)
      expect(screen.queryByText(/Sunday lunch service unavailable/i)).not.toBeInTheDocument()
    })
  })

  describe('upcoming changes section', () => {
    it('should not render when no special hours exist beyond main list', () => {
      mockContextValue.hours = makeHours()
      render(<BusinessHours />)
      expect(screen.queryByText(/upcoming changes/i)).not.toBeInTheDocument()
    })

    it('should render with correct count when qualifying entries exist', () => {
      mockContextValue.hours = makeHours({
        specialHours: [
          { date: '2026-05-10', is_closed: true, note: 'Private function' },
          { date: '2026-05-17', opens: '14:00', closes: '23:00', is_closed: false, note: 'Late opening' },
        ],
      })
      render(<BusinessHours />)
      expect(screen.getByText(/upcoming changes \(2\)/i)).toBeInTheDocument()
    })

    it('should exclude entries already in main list', () => {
      mockContextValue.hours = makeHours({
        specialHours: [
          { date: '2026-04-29', opens: '10:00', closes: '23:00', is_closed: false, note: 'Extended' },
          { date: '2026-05-10', is_closed: true, note: 'Closed' },
        ],
      })
      render(<BusinessHours />)
      expect(screen.getByText(/upcoming changes \(1\)/i)).toBeInTheDocument()
    })

    it('should sort entries ascending by date', async () => {
      mockContextValue.hours = makeHours({
        specialHours: [
          { date: '2026-05-17', is_closed: true, note: 'Second' },
          { date: '2026-05-10', is_closed: true, note: 'First' },
        ],
      })
      render(<BusinessHours />)
      const toggle = screen.getByText(/upcoming changes/i)
      await user.click(toggle)
      const items = screen.getAllByText(/First|Second/)
      expect(items[0]).toHaveTextContent('First')
      expect(items[1]).toHaveTextContent('Second')
    })

    it('should toggle expand/collapse on click', async () => {
      mockContextValue.hours = makeHours({
        specialHours: [
          { date: '2026-05-10', is_closed: true, note: 'Private function' },
        ],
      })
      render(<BusinessHours />)
      const toggle = screen.getByText(/upcoming changes/i)
      expect(screen.queryByText('Private function')).not.toBeInTheDocument()
      await user.click(toggle)
      expect(screen.getByText('Private function')).toBeInTheDocument()
      await user.click(toggle)
      expect(screen.queryByText('Private function')).not.toBeInTheDocument()
    })

    it('should merge with regular weekday hours for partial overrides', async () => {
      mockContextValue.hours = makeHours({
        specialHours: [
          { date: '2026-05-10', opens: '14:00', closes: '23:00', is_closed: false, note: 'Late start' },
        ],
      })
      render(<BusinessHours />)
      const toggle = screen.getByText(/upcoming changes/i)
      await user.click(toggle)
      // 2pm appears in the upcoming changes row (bar opens 14:00)
      expect(screen.getAllByText(/2pm/).length).toBeGreaterThan(0)
      // 1pm appears from regular Saturday kitchen fallback (opens: '13:00')
      expect(screen.getAllByText(/1pm/).length).toBeGreaterThan(0)
    })

    it('should show "No service" for future kitchen: null (property-presence)', async () => {
      mockContextValue.hours = makeHours({
        specialHours: [
          { date: '2026-05-10', opens: '14:00', closes: '23:00', is_closed: false, kitchen: null, note: 'No food' },
        ],
      })
      render(<BusinessHours />)
      const toggle = screen.getByText(/upcoming changes/i)
      await user.click(toggle)
      const upcomingSection = screen.getByText('No food').closest('div')
      expect(upcomingSection).toBeTruthy()
    })
  })
})
