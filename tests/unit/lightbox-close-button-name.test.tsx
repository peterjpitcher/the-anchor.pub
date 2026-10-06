import { act, fireEvent, render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { ChristmasLightbox } from '@/components/features/christmas/ChristmasLightbox'
import { SixNationsLightbox } from '@/components/features/six-nations/SixNationsLightbox'

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
 */
const CLOSE_NAME = 'Close modal'
const CHRISTMAS_TIMER_MS = 10_000
const SIX_NATIONS_TIMER_MS = 40_000
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

  it('names the Six Nations lightbox close button, and that button closes it', () => {
    render(<SixNationsLightbox />)
    expect(screen.queryByRole('heading', { name: 'Six Nations 2026' })).not.toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(SIX_NATIONS_TIMER_MS)
    })
    expect(screen.getByRole('heading', { name: 'Six Nations 2026' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: CLOSE_NAME }))
    act(() => {
      jest.advanceTimersByTime(CLOSE_TRANSITION_MS)
    })
    expect(screen.queryByRole('heading', { name: 'Six Nations 2026' })).not.toBeInTheDocument()
  })

  it.each([
    ['Christmas', ChristmasLightbox, CHRISTMAS_TIMER_MS],
    ['Six Nations', SixNationsLightbox, SIX_NATIONS_TIMER_MS],
  ])('leaves no button in the open %s lightbox without a name', (_label, Lightbox, timerMs) => {
    render(<Lightbox />)
    act(() => {
      jest.advanceTimersByTime(timerMs)
    })

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
    for (const button of buttons) {
      expect(button).toHaveAccessibleName()
    }
  })
})
