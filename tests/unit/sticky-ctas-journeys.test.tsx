import { act, fireEvent, render, screen } from '@testing-library/react'
import { StickyCtas } from '@/components/layout/StickyCtas'
import {
  trackCtaClick,
  trackMenuView,
  trackPhoneCallClick,
  trackTableBookingClick,
  trackWhatsAppClick
} from '@/lib/gtm-events'

let mockPathname = '/sunday-roast'
jest.mock('next/navigation', () => ({ usePathname: () => mockPathname }))
jest.mock('@/lib/cookies', () => ({ hasUserConsented: () => false }))
jest.mock('@/lib/gtm-events', () => ({
  trackCtaClick: jest.fn(), trackTableBookingClick: jest.fn(), trackMenuView: jest.fn(),
  trackPhoneCallClick: jest.fn(), trackWhatsAppClick: jest.fn(), trackStickyCtaShown: jest.fn()
}))
jest.mock('@/components/features/TableBooking/QuickBookSheet', () => ({
  QuickBookSheet: ({ open }: { open: boolean }) => open ? <div role="dialog">Quick book</div> : null
}))

beforeEach(() => {
  mockPathname = '/sunday-roast'
  jest.clearAllMocks()
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 600 })
})

test('table action keeps the quick-book modal, and navigation closes it', () => {
  const view = render(<StickyCtas />)
  fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(trackTableBookingClick).toHaveBeenCalledWith('sticky_global')
  mockPathname = '/cash-bingo'
  view.rerender(<StickyCtas />)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  const link = screen.getByRole('link', { name: 'View upcoming dates' })
  expect(link).toHaveAttribute('href', '#book')
  fireEvent.click(link)
  expect(trackCtaClick).toHaveBeenCalledWith(expect.objectContaining({ destination: '#book' }))
  expect(trackTableBookingClick).toHaveBeenCalledTimes(1)
})

test('server page state overrides event fallback and cannot leak into the next route', async () => {
  mockPathname = '/events/open'
  const view = render(<StickyCtas />)
  expect(screen.getByRole('link', { name: 'View upcoming dates' })).toHaveAttribute('href', '/whats-on')
  const marker = document.createElement('span')
  marker.dataset.bookingCtaPath = '/events/open'
  marker.dataset.bookingCtaHref = '#event-booking'
  marker.dataset.bookingCtaLabel = 'Reserve seats'
  await act(async () => { document.body.appendChild(marker) })
  expect(screen.getByRole('link', { name: 'Reserve seats' })).toHaveAttribute('href', '#event-booking')
  mockPathname = '/events/past'
  view.rerender(<StickyCtas />)
  expect(screen.queryByRole('link', { name: 'Reserve seats' })).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'View upcoming dates' })).toHaveAttribute('href', '/whats-on')
  marker.remove()
})

test('the events hub points at its own list of nights, not the dining quick-book', () => {
  mockPathname = '/whats-on'
  render(<StickyCtas />)
  const link = screen.getByRole('link', { name: 'View upcoming dates' })
  expect(link).toHaveAttribute('href', '#upcoming-events')
  expect(screen.queryByRole('button', { name: 'Book a table' })).not.toBeInTheDocument()
  fireEvent.click(link)
  expect(trackCtaClick).toHaveBeenCalledWith(expect.objectContaining({ destination: '#upcoming-events', context: '/whats-on' }))
  expect(trackTableBookingClick).not.toHaveBeenCalled()
})

test('hire uses its enquiry without a table booking event', () => {
  mockPathname = '/private-hire'
  render(<StickyCtas />)
  expect(screen.getByRole('link', { name: 'Enquire about your date' })).toHaveAttribute('href', '#enquiry')
  expect(trackTableBookingClick).not.toHaveBeenCalled()
})

test('Christmas still opens its existing form event', () => {
  mockPathname = '/christmas-parties'
  const open = jest.fn()
  window.addEventListener('christmas-open-form', open)
  render(<StickyCtas />)
  fireEvent.click(screen.getByRole('button', { name: 'Christmas enquiry' }))
  expect(open).toHaveBeenCalledTimes(1)
  expect(trackTableBookingClick).not.toHaveBeenCalled()
  window.removeEventListener('christmas-open-form', open)
})

test('hidden bar controls remain outside the tab order', () => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
  mockPathname = '/quiz-night'
  render(<StickyCtas />)
  expect(screen.getByText('View upcoming dates')).toHaveAttribute('tabindex', '-1')
})

// On a phone the row is narrower than its four controls at their natural
// width. At 320px Call and WhatsApp sat past the right edge of the screen, and
// the page clips sideways overflow, so they could not be scrolled to. jsdom has
// no layout, so this asserts the classes that decide which control gives way;
// scripts/audit-a11y.js measures the result in a real browser.
describe('the bar fits a phone by shrinking its main button, never the others', () => {
  const cases: Array<[string, 'link' | 'button', string]> = [
    ['/sunday-roast', 'button', 'Book a table'],
    ['/private-hire', 'link', 'Enquire about your date'],
    ['/christmas-parties', 'button', 'Christmas enquiry']
  ]

  test.each(cases)('on %s the main %s may shrink and wrap its label', (pathname, role, name) => {
    mockPathname = pathname
    render(<StickyCtas />)
    const main = screen.getByRole(role, { name })
    // Without min-w-0 a flex item never goes below its label's width.
    expect(main).toHaveClass('min-w-0', 'flex-1', 'max-sm:px-2', 'max-sm:whitespace-normal')
    // From 1024px up it is its natural size again.
    expect(main).toHaveClass('lg:flex-none')
  })

  test('the three round buttons keep their 48px and their tracking', () => {
    render(<StickyCtas />)
    const menu = screen.getByRole('link', { name: 'View menu' })
    const call = screen.getByRole('link', { name: 'Call The Anchor' })
    const whatsapp = screen.getByRole('link', { name: 'WhatsApp The Anchor' })

    expect(menu).toHaveClass('shrink-0', 'max-sm:h-12', 'max-sm:w-12')
    for (const round of [call, whatsapp]) expect(round).toHaveClass('shrink-0', 'h-12', 'w-12')

    // jsdom cannot follow a link, and says so through console.error.
    const noNavigation = jest.spyOn(console, 'error').mockImplementation(() => {})
    fireEvent.click(menu)
    fireEvent.click(call)
    fireEvent.click(whatsapp)
    noNavigation.mockRestore()

    expect(trackMenuView).toHaveBeenCalledWith('food')
    expect(trackPhoneCallClick).toHaveBeenCalledWith({ phone: '01753682707', source: 'sticky_global' })
    expect(trackWhatsAppClick).toHaveBeenCalledWith('sticky_global')
  })
})
