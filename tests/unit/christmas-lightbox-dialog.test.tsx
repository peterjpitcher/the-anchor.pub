import { act, fireEvent, render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { ChristmasLightbox } from '@/components/features/christmas/ChristmasLightbox'
import { MODAL_FOCUS_DELAY_MS } from '@/components/ui/overlays/Modal'
import { trackModalClose, trackModalEngage, trackModalOpen } from '@/lib/gtm-events'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

jest.mock('@/lib/gtm-events', () => ({
  trackFormStart: jest.fn(),
  trackModalOpen: jest.fn(),
  trackModalClose: jest.fn(),
  trackModalEngage: jest.fn(),
}))

/**
 * Site review AX-002, 7 October 2026. The Christmas pop-up was a hand-built
 * fixed layer: no dialog role, no name, no focus handling. It opened over the
 * page ten seconds in, focus stayed on whatever was behind it, and Tab carried
 * on through the page underneath. It is now built on the shared Modal.
 *
 * Its own analytics are kept and Modal's are switched off for it, so each open
 * and close is still recorded exactly once, with what opened it.
 */
const TIMER_MS = 10_000
const CLOSE_TRANSITION_MS = 300

function open() {
  act(() => {
    jest.advanceTimersByTime(TIMER_MS)
  })
  // Modal moves focus in after its own short delay.
  act(() => {
    jest.advanceTimersByTime(MODAL_FOCUS_DELAY_MS)
  })
}

describe('the Christmas pop-up is a dialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    // Inside the campaign window (1 August to 15 December 2026) in London and UTC.
    jest.setSystemTime(new Date('2026-10-05T12:00:00Z'))
    window.localStorage.clear()
    ;(usePathname as jest.Mock).mockReturnValue('/heathrow-parking')
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('announces itself as a modal dialog named by its heading', () => {
    render(<ChristmasLightbox />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    open()

    const dialog = screen.getByRole('dialog', { name: 'Christmas 2026' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    const labelledBy = dialog.getAttribute('aria-labelledby') as string
    expect(document.getElementById(labelledBy)).toBe(screen.getByRole('heading', { name: 'Christmas 2026' }))
  })

  it('takes keyboard focus when it opens and hands it back when it closes', () => {
    render(
      <>
        <a href="/heathrow-parking">Airport parking</a>
        <ChristmasLightbox />
      </>
    )
    const behind = screen.getByRole('link', { name: 'Airport parking' })
    behind.focus()

    open()
    const dialog = screen.getByRole('dialog')
    expect(dialog).toContainElement(document.activeElement as HTMLElement)

    fireEvent.keyDown(document, { key: 'Escape' })
    act(() => {
      jest.advanceTimersByTime(CLOSE_TRANSITION_MS)
    })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(behind).toHaveFocus()
  })

  it('keeps Tab inside it, forwards and backwards', () => {
    render(
      <>
        <a href="/heathrow-parking">Airport parking</a>
        <ChristmasLightbox />
      </>
    )
    open()
    const dialog = screen.getByRole('dialog')
    const close = screen.getByRole('button', { name: 'Close modal' })
    const later = screen.getByRole('button', { name: /No thanks/ })

    // The last control wraps to the first, and the first back to the last.
    later.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(close).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(later).toHaveFocus()

    // Focus that has got behind it is brought back in.
    screen.getByRole('link', { name: 'Airport parking' }).focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
  })

  it('records one open and one close, with what opened it and why it closed', () => {
    render(<ChristmasLightbox />)
    open()

    expect(trackModalOpen).toHaveBeenCalledTimes(1)
    expect(trackModalOpen).toHaveBeenCalledWith({
      id: 'christmas_2026_lightbox',
      title: 'Christmas 2026 lightbox',
      extra: { lightbox_trigger: 'timer' },
    })

    fireEvent.keyDown(document, { key: 'Escape' })
    act(() => {
      jest.advanceTimersByTime(CLOSE_TRANSITION_MS)
    })

    expect(trackModalClose).toHaveBeenCalledTimes(1)
    expect(trackModalClose).toHaveBeenCalledWith({
      id: 'christmas_2026_lightbox',
      title: 'Christmas 2026 lightbox',
      reason: 'escape_key',
      extra: { lightbox_trigger: 'timer' },
    })
  })

  it('records a click on the main button once, as the pop-up itself always has', () => {
    render(<ChristmasLightbox />)
    open()

    fireEvent.click(screen.getByRole('link', { name: 'View Festive Packages' }))
    act(() => {
      jest.advanceTimersByTime(CLOSE_TRANSITION_MS)
    })

    expect(trackModalEngage).toHaveBeenCalledTimes(1)
    expect(trackModalEngage).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'christmas_2026_lightbox', element: 'primary_cta' })
    )
    expect(trackModalClose).toHaveBeenCalledWith(expect.objectContaining({ reason: 'cta' }))
  })
})
