import { act, fireEvent, render, screen } from '@testing-library/react'
import { EventStickyBookingCTA } from '@/components/events/EventStickyBookingCTA'
import { trackEventBookClick, trackPhoneCallClick } from '@/lib/gtm-events'
import type { Event } from '@/lib/api'

jest.mock('@/lib/gtm-events', () => ({
  trackEventBookClick: jest.fn(),
  trackPhoneCallClick: jest.fn()
}))

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    '@type': 'Event',
    id: 'event_123',
    slug: 'music-bingo',
    name: 'Music Bingo',
    description: 'Song clips, prizes and a pub night out.',
    startDate: '2030-05-08T20:00:00+01:00',
    eventStatus: 'EventScheduled',
    eventAttendanceMode: 'OfflineEventAttendanceMode',
    payment_mode: 'cash_only',
    price_per_seat: 3,
    offers: {
      '@type': 'Offer',
      price: '3',
      priceCurrency: 'GBP',
      availability: 'InStock',
      validFrom: '2030-01-01T00:00:00Z'
    },
    location: {
      '@type': 'Place',
      name: 'The Anchor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Horton Road',
        addressLocality: 'Stanwell Moor',
        addressRegion: 'Surrey',
        postalCode: 'TW19 6AQ',
        addressCountry: 'GB'
      }
    },
    ...overrides
  }
}

describe('EventStickyBookingCTA', () => {
  const originalIntersectionObserver = global.IntersectionObserver

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global as any).IntersectionObserver = originalIntersectionObserver
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      configurable: true,
      writable: true
    })
  })

  function setScrollY(value: number) {
    Object.defineProperty(window, 'scrollY', {
      value,
      configurable: true,
      writable: true
    })
  }

  function fireScroll() {
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
  }

  it('starts hidden and shows after scroll', () => {
    render(<EventStickyBookingCTA event={makeEvent()} source="event_page_sticky_test" />)

    const region = screen.getByTestId('event-sticky-booking-cta')
    expect(region.className).toContain('translate-y-full')

    setScrollY(400)
    fireScroll()

    expect(region.className).toContain('translate-y-0')
    expect(screen.getByText('No payment now, pay £3 on arrival')).toBeInTheDocument()
  })

  it('tracks sticky reserve and phone clicks separately', () => {
    render(<EventStickyBookingCTA event={makeEvent()} source="event_page_sticky_test" />)

    setScrollY(400)
    fireScroll()

    const reserveLink = screen.getByRole('link', {
      name: /reserve table for music bingo/i
    })
    expect(reserveLink).toHaveAttribute('href', '#event-booking')

    fireEvent.click(reserveLink)
    expect(trackEventBookClick).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'event_page_sticky_test',
        ctaLabel: 'Reserve table'
      })
    )

    fireEvent.click(screen.getByRole('link', { name: /call the anchor/i }))
    expect(trackPhoneCallClick).toHaveBeenCalledWith({
      phone: '01753 682707',
      source: 'event_page_sticky_test'
    })
  })

  it('hides while the booking form is already visible', () => {
    let observeCallback: IntersectionObserverCallback | null = null
    ;(global as any).IntersectionObserver = class {
      callback: IntersectionObserverCallback

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback
      }

      observe = jest.fn((target: Element) => {
        if (target.id === 'event-booking') {
          observeCallback = this.callback
        }
      })
      unobserve = jest.fn()
      disconnect = jest.fn()
      takeRecords = jest.fn(() => [])
    }

    const bookingTarget = document.createElement('div')
    bookingTarget.id = 'event-booking'
    document.body.appendChild(bookingTarget)

    render(<EventStickyBookingCTA event={makeEvent()} source="event_page_sticky_test" />)

    const region = screen.getByTestId('event-sticky-booking-cta')
    setScrollY(400)
    fireScroll()
    expect(region.className).toContain('translate-y-0')

    act(() => {
      observeCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    })

    expect(region.className).toContain('translate-y-full')
    bookingTarget.remove()
  })
})
