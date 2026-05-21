import { act, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { TimedBookingPrompt } from '../TimedBookingPrompt'
import { pushToDataLayer } from '@/lib/gtm-events'

jest.mock('@/lib/gtm-events', () => ({
  pushToDataLayer: jest.fn(),
  trackModalOpen: jest.fn(),
  trackModalClose: jest.fn(),
  trackModalEngage: jest.fn(),
  trackCtaClick: jest.fn(),
  trackTableBookingClick: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  usePathname: () => '/sunday-roast',
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/components/BookTableButton', () => ({
  BookTableButton: ({ children, onClickAfterTracking }: { children: ReactNode; onClickAfterTracking?: () => void }) => (
    <button type="button" onClick={onClickAfterTracking}>
      {children}
    </button>
  ),
}))

const mockPush = pushToDataLayer as jest.MockedFunction<typeof pushToDataLayer>
const SESSION_KEY = 'sunday_lunch_booking_prompt_dismissed'

describe('TimedBookingPrompt', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockPush.mockClear()
    window.sessionStorage.clear()
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
  })

  it('does not render the modal before the delay elapses', () => {
    render(<TimedBookingPrompt delayMs={500} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('opens the modal once the delay elapses', () => {
    render(<TimedBookingPrompt delayMs={500} />)

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(mockPush).toHaveBeenCalledWith({
      event: 'booking_prompt_open',
      prompt_id: 'sunday_lunch_timed',
    })
  })

  it('does not open if sessionStorage already records a dismissal', () => {
    window.sessionStorage.setItem(SESSION_KEY, 'true')

    render(<TimedBookingPrompt delayMs={500} />)

    act(() => {
      jest.advanceTimersByTime(2000)
    })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('records dismissal in sessionStorage when the modal closes', () => {
    render(<TimedBookingPrompt delayMs={500} />)

    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Simulate Escape close via the Modal, fire dismiss by clicking the
    // Book a table CTA, which also sets the dismissal flag.
    const cta = screen.getByRole('button', { name: /book sunday roast/i })
    act(() => {
      cta.click()
    })

    expect(window.sessionStorage.getItem(SESSION_KEY)).toBe('true')
    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'booking_prompt_cta',
        prompt_id: 'sunday_lunch_timed',
        dismiss_reason: 'cta',
      })
    )
  })
})
