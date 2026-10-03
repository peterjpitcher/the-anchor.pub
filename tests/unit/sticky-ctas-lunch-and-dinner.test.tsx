/**
 * The sticky bar on /lunch-and-dinner, the landing page for the paid weekday
 * food ads.
 *
 * Its "Book a table" used to open the generic quick-book sheet, whose bookings
 * carried no landing page source, so an ad booking made from the bar could not
 * be told from any other. It now goes where the page's own buttons go: the
 * form on /book-table, tagged `lunch_dinner_lp`, with the ad tags from the
 * address carried along and nothing written to the device.
 *
 * The link navigates in its click handler, so these assert where the browser
 * was actually sent, not only the href attribute.
 */

import { createEvent, fireEvent, render, screen } from '@testing-library/react'
import { StickyCtas } from '@/components/layout/StickyCtas'
import { rejectAllCookies } from '@/lib/cookies'
import { trackCtaClick, trackTableBookingClick } from '@/lib/gtm-events'

let mockPathname = '/lunch-and-dinner'
jest.mock('next/navigation', () => ({ usePathname: () => mockPathname }))
jest.mock('@/lib/gtm-events', () => ({
  trackCtaClick: jest.fn(),
  trackTableBookingClick: jest.fn(),
  trackMenuView: jest.fn(),
  trackPhoneCallClick: jest.fn(),
  trackWhatsAppClick: jest.fn(),
  trackStickyCtaShown: jest.fn()
}))
jest.mock('@/components/features/TableBooking/QuickBookSheet', () => ({
  QuickBookSheet: ({ open }: { open: boolean }) => (open ? <div role="dialog">Quick book</div> : null)
}))

const BOOKING_HREF = '/book-table?source=lunch_dinner_lp#booking-form'
const LANDING_URL = 'http://localhost/lunch-and-dinner'
// How a Meta ad lands on the page: through its short link, tags on the address.
const PAID_LANDING_URL = `${LANDING_URL}?utm_source=facebook&utm_medium=paid_social&utm_campaign=weekday_dinner_a_pizza&utm_content=ad__var_2&short_code=jbozdk`

// jsdom refuses a real navigation, so the address is held here instead.
const originalLocation = window.location
let currentHref = LANDING_URL

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    enumerable: true,
    value: {
      get href() {
        return currentHref
      },
      set href(value: string) {
        currentHref = value
      },
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      origin: originalLocation.origin,
      pathname: '/lunch-and-dinner',
      search: '',
      hash: ''
    }
  })
})

afterAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    enumerable: true,
    value: originalLocation
  })
})

beforeEach(() => {
  mockPathname = '/lunch-and-dinner'
  currentHref = LANDING_URL
  jest.clearAllMocks()
  // Scrolled past the hero, so the bar is showing.
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 600 })
})

afterEach(() => {
  // Forget any cookie choice a test made.
  document.cookie = 'anchor-cookie-consent=; path=/; max-age=0'
})

function bookLink(): HTMLElement {
  return screen.getByRole('link', { name: 'Book a table' })
}

describe('the sticky bar on /lunch-and-dinner', () => {
  it('offers a link to the booking form, not the quick-book sheet', () => {
    render(<StickyCtas />)

    expect(bookLink()).toHaveAttribute('href', BOOKING_HREF)
    expect(screen.queryByRole('button', { name: 'Book a table' })).not.toBeInTheDocument()
  })

  it('lands on the booking form with the landing page source when the address has no ad tags', () => {
    render(<StickyCtas />)

    fireEvent.click(bookLink())

    expect(currentHref).toBe(BOOKING_HREF)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('carries the ad tags from the address and still ends at the form', () => {
    render(<StickyCtas />)
    currentHref = PAID_LANDING_URL

    fireEvent.click(bookLink())

    expect(currentHref).toBe(
      '/book-table?source=lunch_dinner_lp&utm_source=facebook&utm_medium=paid_social&utm_campaign=weekday_dinner_a_pizza&utm_content=ad__var_2&short_code=jbozdk#booking-form'
    )
    const target = new URL(currentHref, 'http://localhost')
    expect(target.pathname).toBe('/book-table')
    expect(target.hash).toBe('#booking-form')
    expect(Object.fromEntries(target.searchParams)).toEqual({
      source: 'lunch_dinner_lp',
      utm_source: 'facebook',
      utm_medium: 'paid_social',
      utm_campaign: 'weekday_dinner_a_pizza',
      utm_content: 'ad__var_2',
      short_code: 'jbozdk'
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it.each([
    ['before any cookie choice', () => undefined],
    ['with cookies declined', () => rejectAllCookies()]
  ])('carries the ad tags %s, and writes nothing to the device', (_label, setConsent) => {
    setConsent()
    render(<StickyCtas />)
    currentHref = PAID_LANDING_URL

    const setItem = jest.spyOn(Storage.prototype, 'setItem')
    const setCookie = jest.spyOn(Document.prototype, 'cookie', 'set')
    try {
      fireEvent.click(bookLink())

      const target = new URL(currentHref, 'http://localhost')
      expect(target.pathname).toBe('/book-table')
      expect(target.searchParams.get('source')).toBe('lunch_dinner_lp')
      expect(target.searchParams.get('utm_campaign')).toBe('weekday_dinner_a_pizza')
      expect(target.searchParams.get('utm_content')).toBe('ad__var_2')
      expect(target.searchParams.get('short_code')).toBe('jbozdk')
      expect(target.hash).toBe('#booking-form')
      // The tags travel in the address only: no cookie, no browser storage.
      expect(setItem).not.toHaveBeenCalled()
      expect(setCookie).not.toHaveBeenCalled()
    } finally {
      setItem.mockRestore()
      setCookie.mockRestore()
    }
  })

  it('works from the keyboard, which reaches a link as a click with no pointer', () => {
    render(<StickyCtas />)
    currentHref = PAID_LANDING_URL

    // Enter on a focused link arrives as a click with detail 0.
    fireEvent.click(bookLink(), { detail: 0 })

    expect(currentHref).toMatch(/^\/book-table\?source=lunch_dinner_lp&.*utm_campaign=weekday_dinner_a_pizza.*#booking-form$/)
  })

  it.each([
    ['a command click', { metaKey: true }],
    ['a control click', { ctrlKey: true }],
    ['a shift click', { shiftKey: true }],
    ['a middle click', { button: 1 }]
  ])('leaves %s to the browser, so it can open a new tab', (_label, init) => {
    render(<StickyCtas />)
    currentHref = PAID_LANDING_URL
    const link = bookLink()

    const click = createEvent.click(link, init)
    fireEvent(link, click)

    expect(click.defaultPrevented).toBe(false)
    expect(currentHref).toBe(PAID_LANDING_URL)
  })

  it('still counts as a Book a table tap, as it did when it opened the sheet', () => {
    render(<StickyCtas />)

    fireEvent.click(bookLink())

    expect(trackTableBookingClick).toHaveBeenCalledWith('sticky_global')
    expect(trackCtaClick).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Book a table', destination: BOOKING_HREF, context: '/lunch-and-dinner' })
    )
  })
})

describe('the sticky bar everywhere else', () => {
  it('still opens the quick-book sheet from an ordinary page', () => {
    mockPathname = '/sunday-roast'
    currentHref = 'http://localhost/sunday-roast?utm_campaign=weekday_dinner_a_pizza'
    render(<StickyCtas />)

    fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(currentHref).toBe('http://localhost/sunday-roast?utm_campaign=weekday_dinner_a_pizza')
  })

  it.each([
    ['/cash-bingo', 'View upcoming dates', '#book'],
    ['/whats-on', 'View upcoming dates', '#upcoming-events'],
    ['/private-hire', 'Enquire about your date', '#enquiry'],
    ['/events/example', 'View upcoming dates', '/whats-on']
  ])('keeps the %s link as a plain link that carries no ad tags', (pathname, label, href) => {
    mockPathname = pathname
    const address = `http://localhost${pathname}?utm_campaign=weekday_dinner_a_pizza&short_code=jbozdk`
    currentHref = address
    render(<StickyCtas />)

    const link = screen.getByRole('link', { name: label })
    expect(link).toHaveAttribute('href', href)
    fireEvent.click(link)

    // No full-page navigation of its own, and no table booking event.
    expect(currentHref).toBe(address)
    expect(trackTableBookingClick).not.toHaveBeenCalled()
  })
})
