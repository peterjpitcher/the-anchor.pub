import { fireEvent, render, screen } from '@testing-library/react'
import { StickyCtas } from '@/components/layout/StickyCtas'

/**
 * Review BK-199. The quick booking sheet's code was part of every page's first
 * load, because the booking bar imported it outright, including on pages where
 * the bar never appears and nobody opens it. It is now fetched when the bar
 * first comes on screen, and mounted closed, so the first tap still slides it
 * open.
 */

let mockPathname = '/sunday-roast'
const mockSheetRenders: Array<{ open: boolean }> = []

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname
}))

jest.mock('@/lib/gtm-events', () => new Proxy({}, { get: (_target, name) => (name === '__esModule' ? false : jest.fn()) }))

jest.mock('@/components/features/TableBooking/QuickBookSheet', () => ({
  QuickBookSheet: ({ open }: { open: boolean }) => {
    mockSheetRenders.push({ open })
    return open ? <div role="dialog">Quick book</div> : null
  }
}))

beforeEach(() => {
  mockSheetRenders.length = 0
})

test('is not loaded on a page where the booking bar never shows', async () => {
  mockPathname = '/book-table'
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 600 })
  render(<StickyCtas />)

  // Long enough for an on-demand module to have arrived, had it been asked for.
  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(mockSheetRenders).toEqual([])
})

test('is there, closed, once the bar is on screen, and opens on the tap', async () => {
  mockPathname = '/sunday-roast'
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 600 })
  render(<StickyCtas />)

  // Mounted closed before anyone taps, which is what lets it slide open.
  await screen.findByRole('button', { name: 'Book a table' })
  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(mockSheetRenders.length).toBeGreaterThan(0)
  expect(mockSheetRenders.every(({ open }) => !open)).toBe(true)

  fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))
  expect(await screen.findByRole('dialog')).toBeInTheDocument()
})
