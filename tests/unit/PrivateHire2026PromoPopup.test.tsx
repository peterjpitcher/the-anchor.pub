import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { pushToDataLayer } from '@/lib/gtm-events'
import {
  PRIVATE_HIRE_2026_PROMO_CTA_HREF,
  PRIVATE_HIRE_2026_PROMO_DISABLED_STORAGE_KEY,
  PRIVATE_HIRE_2026_PROMO_DISMISS_MS,
  PRIVATE_HIRE_2026_PROMO_DISMISS_STORAGE_KEY
} from '@/lib/promos/privateHire2026'
import { PrivateHire2026PromoPopup } from '@/components/promos/PrivateHire2026PromoPopup'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

jest.mock('@/lib/gtm-events', () => ({
  pushToDataLayer: jest.fn(),
}))

describe('PrivateHire2026PromoPopup', () => {
  const mockUsePathname = usePathname as jest.Mock
  const mockPushToDataLayer = pushToDataLayer as jest.MockedFunction<typeof pushToDataLayer>

  beforeEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
    mockUsePathname.mockReturnValue('/book-event')
  })

  it('renders and tracks a view event when eligible', async () => {
    render(<PrivateHire2026PromoPopup />)

    expect(await screen.findByText('Book your 2026 party early — bubbles on us 🥂')).toBeInTheDocument()

    expect(mockPushToDataLayer).toHaveBeenCalledWith(expect.objectContaining({
      event: 'promo_popup_view',
    }))
  })

  it('persists dismissal for 7 days and tracks close', async () => {
    render(<PrivateHire2026PromoPopup />)

    await screen.findByText('Book your 2026 party early — bubbles on us 🥂')

    const before = Date.now()
    fireEvent.click(screen.getByLabelText('Close modal'))

    const stored = window.localStorage.getItem(PRIVATE_HIRE_2026_PROMO_DISMISS_STORAGE_KEY)
    expect(stored).toBeTruthy()

    const dismissedUntil = Number(stored)
    expect(Number.isNaN(dismissedUntil)).toBe(false)
    expect(dismissedUntil).toBeGreaterThanOrEqual(before + PRIVATE_HIRE_2026_PROMO_DISMISS_MS - 5000)
    expect(dismissedUntil).toBeLessThanOrEqual(before + PRIVATE_HIRE_2026_PROMO_DISMISS_MS + 5000)

    expect(mockPushToDataLayer).toHaveBeenCalledWith(expect.objectContaining({
      event: 'promo_popup_close',
    }))
  })

  it('does not render when suppressed', async () => {
    window.localStorage.setItem(
      PRIVATE_HIRE_2026_PROMO_DISMISS_STORAGE_KEY,
      String(Date.now() + PRIVATE_HIRE_2026_PROMO_DISMISS_MS)
    )

    render(<PrivateHire2026PromoPopup />)

    await waitFor(() => {
      expect(screen.queryByText('Book your 2026 party early — bubbles on us 🥂')).not.toBeInTheDocument()
    })
  })

  it('does not render when disabled by runtime flag', async () => {
    window.localStorage.setItem(PRIVATE_HIRE_2026_PROMO_DISABLED_STORAGE_KEY, 'true')

    render(<PrivateHire2026PromoPopup />)

    await waitFor(() => {
      expect(screen.queryByText('Book your 2026 party early — bubbles on us 🥂')).not.toBeInTheDocument()
    })
  })

  it('tracks CTA click and closes', async () => {
    render(<PrivateHire2026PromoPopup />)

    await screen.findByText('Book your 2026 party early — bubbles on us 🥂')
    const ctaLink = screen.getByRole('link', { name: 'Check availability / Get a quote' })
    ctaLink.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(ctaLink)

    expect(mockPushToDataLayer).toHaveBeenCalledWith(expect.objectContaining({
      event: 'promo_popup_cta_click',
      destination: PRIVATE_HIRE_2026_PROMO_CTA_HREF,
    }))
  })

  it('tracks phone click and closes', async () => {
    render(<PrivateHire2026PromoPopup />)

    await screen.findByText('Book your 2026 party early — bubbles on us 🥂')
    const phoneLink = screen.getByRole('link', { name: 'Call 01753 682707' })
    phoneLink.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(phoneLink)

    expect(mockPushToDataLayer).toHaveBeenCalledWith(expect.objectContaining({
      event: 'promo_phone_click',
    }))
  })
})
