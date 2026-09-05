import { act, fireEvent, render, screen } from '@testing-library/react'
import { StickyCtas } from '@/components/layout/StickyCtas'
import { trackCtaClick, trackTableBookingClick } from '@/lib/gtm-events'

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
