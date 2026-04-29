import { act, fireEvent, render, screen } from '@testing-library/react'
import { ScrollProgressBookingTooltip } from '../ScrollProgressBookingTooltip'
import { pushToDataLayer } from '@/lib/gtm-events'

jest.mock('@/lib/gtm-events', () => ({
  pushToDataLayer: jest.fn(),
}))

const SESSION_STORAGE_KEY = 'sunday_lunch_scroll_tooltip_shown'

describe('ScrollProgressBookingTooltip', () => {
  const mockPushToDataLayer = pushToDataLayer as jest.MockedFunction<typeof pushToDataLayer>

  beforeEach(() => {
    jest.clearAllMocks()
    window.sessionStorage.clear()

    // Set up a 1000px scrollable document with a 500px viewport.
    Object.defineProperty(window, 'innerHeight', {
      value: 500,
      configurable: true,
      writable: true,
    })
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 1500,
      configurable: true,
    })
    Object.defineProperty(document.body, 'scrollHeight', {
      value: 1500,
      configurable: true,
    })
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      configurable: true,
      writable: true,
    })
  })

  function setScrollY(value: number) {
    Object.defineProperty(window, 'scrollY', {
      value,
      configurable: true,
      writable: true,
    })
  }

  function fireScroll() {
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
  }

  it('does not render below the 70% scroll threshold', () => {
    render(<ScrollProgressBookingTooltip />)

    // 50% scrolled (500/1000)
    setScrollY(500)
    fireScroll()

    expect(
      screen.queryByTestId('scroll-progress-booking-tooltip')
    ).not.toBeInTheDocument()
  })

  it('renders once scrolled past 70% and fires scroll_tooltip_shown', () => {
    render(<ScrollProgressBookingTooltip />)

    // 80% scrolled (800/1000)
    setScrollY(800)
    fireScroll()

    expect(
      screen.getByTestId('scroll-progress-booking-tooltip')
    ).toBeInTheDocument()
    expect(mockPushToDataLayer).toHaveBeenCalledWith({
      event: 'scroll_tooltip_shown',
    })
    expect(window.sessionStorage.getItem(SESSION_STORAGE_KEY)).toBe('true')
  })

  it('does not render again if sessionStorage flag is already set', () => {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, 'true')

    render(<ScrollProgressBookingTooltip />)

    setScrollY(900)
    fireScroll()

    expect(
      screen.queryByTestId('scroll-progress-booking-tooltip')
    ).not.toBeInTheDocument()
    expect(mockPushToDataLayer).not.toHaveBeenCalled()
  })

  it('hides itself when the close button is clicked', () => {
    render(<ScrollProgressBookingTooltip />)

    setScrollY(800)
    fireScroll()

    expect(
      screen.getByTestId('scroll-progress-booking-tooltip')
    ).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Dismiss booking tooltip'))

    expect(
      screen.queryByTestId('scroll-progress-booking-tooltip')
    ).not.toBeInTheDocument()
  })
})
