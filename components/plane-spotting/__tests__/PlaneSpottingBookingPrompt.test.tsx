import { act, fireEvent, render, screen } from '@testing-library/react'
import {
  PlaneSpottingBookingPrompt,
  PLANE_SPOTTING_PROMPT_SESSION_KEY,
} from '../PlaneSpottingBookingPrompt'
import { pushToDataLayer } from '@/lib/gtm-events'

jest.mock('@/lib/gtm-events', () => ({
  pushToDataLayer: jest.fn(),
}))

describe('PlaneSpottingBookingPrompt', () => {
  const mockPushToDataLayer = pushToDataLayer as jest.MockedFunction<typeof pushToDataLayer>

  beforeEach(() => {
    jest.clearAllMocks()
    window.sessionStorage.clear()

    Object.defineProperty(window, 'innerHeight', {
      value: 500,
      configurable: true,
      writable: true,
    })
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 1500,
      configurable: true,
    })
    Object.defineProperty(document.body, 'scrollHeight', {
      value: 1500,
      configurable: true,
    })
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      configurable: true,
      writable: true,
    })
    Object.defineProperty(window, 'innerWidth', {
      value: 1280,
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

  it('shows once after the scroll threshold and stores session suppression', () => {
    render(<PlaneSpottingBookingPrompt />)

    setScrollY(700)
    fireScroll()

    expect(screen.getByTestId('plane-spotting-booking-prompt')).toBeInTheDocument()
    expect(window.sessionStorage.getItem(PLANE_SPOTTING_PROMPT_SESSION_KEY)).toBe('true')
    expect(mockPushToDataLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'plane_spotting_prompt_shown',
        trigger: 'scroll',
      }),
      expect.objectContaining({ sendToApi: true })
    )
  })

  it('does not show when the session suppression flag is present', () => {
    window.sessionStorage.setItem(PLANE_SPOTTING_PROMPT_SESSION_KEY, 'true')

    render(<PlaneSpottingBookingPrompt />)

    setScrollY(700)
    fireScroll()

    expect(screen.queryByTestId('plane-spotting-booking-prompt')).not.toBeInTheDocument()
    expect(mockPushToDataLayer).not.toHaveBeenCalled()
  })

  it('tracks dismissal and CTA clicks', () => {
    render(<PlaneSpottingBookingPrompt source="test_prompt" />)

    setScrollY(700)
    fireScroll()

    fireEvent.click(screen.getByLabelText('Dismiss plane spotting booking prompt'))
    expect(mockPushToDataLayer).toHaveBeenCalledWith(
      expect.objectContaining({
      event: 'plane_spotting_prompt_dismissed',
      source: 'test_prompt',
      }),
      // Measurement Protocol, or the event never reaches GA4.
      expect.objectContaining({ sendToApi: true })
    )

    window.sessionStorage.clear()
    jest.clearAllMocks()
    render(<PlaneSpottingBookingPrompt source="test_prompt" />)
    setScrollY(700)
    fireScroll()

    const link = screen.getByRole('link', { name: /Book a Table/i })
    link.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(link)

    expect(mockPushToDataLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'plane_spotting_prompt_cta_clicked',
        source: 'test_prompt',
      }),
      expect.objectContaining({ sendToApi: true })
    )
  })
})
