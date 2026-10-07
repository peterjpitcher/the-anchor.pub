import { act, fireEvent, render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { ChristmasLightbox } from '@/components/features/christmas/ChristmasLightbox'

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
 * The close button on both promo lightboxes held only an X icon and no name, so a
 * screen reader announced "button" and nothing else (axe `button-name`, WCAG 4.1.2,
 * found 5 October 2026). The name asserted here is the one the shared `Modal` and the
 * private hire promo popup already use.
 *
 * Neither lightbox renders anything until its timer fires, which is why the page audit
 * never saw this: the tests have to open each one first.
 *
 * The Six Nations lightbox was deleted on 7 October 2026 (owner decision), so only the
 * Christmas one is left to hold to this.
 */
const CLOSE_NAME = 'Close modal'
const CHRISTMAS_TIMER_MS = 10_000
const CLOSE_TRANSITION_MS = 300

describe('promo lightbox close buttons have an accessible name', () => {
  const mockUsePathname = usePathname as jest.Mock

  beforeEach(() => {
    jest.useFakeTimers()
    // Inside the Christmas campaign window (1 August to 15 December 2026) in both
    // London and UTC, so the test does not start failing when the real date leaves it.
    jest.setSystemTime(new Date('2026-10-05T12:00:00Z'))
    window.localStorage.clear()
    mockUsePathname.mockReturnValue('/heathrow-parking')
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('names the Christmas lightbox close button, and that button closes it', () => {
    render(<ChristmasLightbox />)
    expect(screen.queryByRole('heading', { name: 'Christmas 2026' })).not.toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(CHRISTMAS_TIMER_MS)
    })
    expect(screen.getByRole('heading', { name: 'Christmas 2026' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: CLOSE_NAME }))
    act(() => {
      jest.advanceTimersByTime(CLOSE_TRANSITION_MS)
    })
    expect(screen.queryByRole('heading', { name: 'Christmas 2026' })).not.toBeInTheDocument()
  })

  it('leaves no button in the open Christmas lightbox without a name', () => {
    render(<ChristmasLightbox />)
    act(() => {
      jest.advanceTimersByTime(CHRISTMAS_TIMER_MS)
    })

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
    for (const button of buttons) {
      expect(button).toHaveAccessibleName()
    }
  })
})
