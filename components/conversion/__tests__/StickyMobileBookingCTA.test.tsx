import { act, render, screen } from '@testing-library/react'
import { StickyMobileBookingCTA } from '../StickyMobileBookingCTA'

jest.mock('@/lib/gtm-events', () => ({
  trackPhoneCallClick: jest.fn(),
  trackCtaClick: jest.fn(),
  trackTableBookingClick: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  usePathname: () => '/sunday-lunch',
}))

describe('StickyMobileBookingCTA', () => {
  beforeEach(() => {
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

  it('starts hidden (translated off-screen) before scrolling', () => {
    render(<StickyMobileBookingCTA />)

    const region = screen.getByTestId('sticky-mobile-booking-cta')
    expect(region.className).toContain('translate-y-full')
    expect(region).toHaveAttribute('aria-hidden', 'true')
  })

  it('reveals the bar after the user scrolls past 300px', () => {
    render(<StickyMobileBookingCTA />)

    setScrollY(400)
    fireScroll()

    const region = screen.getByTestId('sticky-mobile-booking-cta')
    expect(region.className).toContain('translate-y-0')
    expect(region).toHaveAttribute('aria-hidden', 'false')
  })

  it('renders the booking and phone CTAs once visible', () => {
    render(<StickyMobileBookingCTA />)

    setScrollY(500)
    fireScroll()

    expect(
      screen.getByRole('button', { name: /book sunday roast/i })
    ).toBeInTheDocument()

    const phoneLink = screen.getByRole('link', {
      name: /call the anchor on 01753 682707/i,
    })
    expect(phoneLink).toHaveAttribute('href', 'tel:01753682707')
  })

  it('keeps the bar hidden again if the user scrolls back to the top', () => {
    render(<StickyMobileBookingCTA />)

    setScrollY(500)
    fireScroll()
    setScrollY(50)
    fireScroll()

    const region = screen.getByTestId('sticky-mobile-booking-cta')
    expect(region.className).toContain('translate-y-full')
  })
})
