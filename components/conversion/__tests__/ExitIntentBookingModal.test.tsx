import { act, fireEvent, render, screen } from '@testing-library/react'
import { ExitIntentBookingModal } from '../ExitIntentBookingModal'
import { pushToDataLayer } from '@/lib/gtm-events'

jest.mock('@/lib/gtm-events', () => ({
  pushToDataLayer: jest.fn(),
  trackModalOpen: jest.fn(),
  trackModalClose: jest.fn(),
  trackModalEngage: jest.fn(),
}))

const SESSION_STORAGE_KEY = 'sunday_lunch_exit_intent_shown'

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    configurable: true,
    writable: true,
  })
}

function fireExitIntent() {
  act(() => {
    const event = new MouseEvent('mouseleave', { clientY: -10, bubbles: true })
    document.dispatchEvent(event)
  })
}

describe('ExitIntentBookingModal', () => {
  const mockPushToDataLayer = pushToDataLayer as jest.MockedFunction<typeof pushToDataLayer>

  beforeEach(() => {
    jest.clearAllMocks()
    window.sessionStorage.clear()
    setViewportWidth(1280)
  })

  it('does not fire on mobile-width viewports', () => {
    setViewportWidth(390)

    render(<ExitIntentBookingModal />)
    fireExitIntent()

    expect(screen.queryByText('Before you go')).not.toBeInTheDocument()
    expect(mockPushToDataLayer).not.toHaveBeenCalled()
  })

  it('does not fire if the session flag is already set', () => {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, 'true')

    render(<ExitIntentBookingModal />)
    fireExitIntent()

    expect(screen.queryByText('Before you go')).not.toBeInTheDocument()
    expect(mockPushToDataLayer).not.toHaveBeenCalled()
  })

  it('shows the modal and tracks shown when the cursor exits the top edge', () => {
    render(<ExitIntentBookingModal />)
    fireExitIntent()

    expect(screen.getAllByText('Before you go').length).toBeGreaterThan(0)
    expect(mockPushToDataLayer).toHaveBeenCalledWith({
      event: 'exit_intent_modal_shown',
    })
    expect(window.sessionStorage.getItem(SESSION_STORAGE_KEY)).toBe('true')
  })

  it('closes on Escape and tracks dismissal', () => {
    render(<ExitIntentBookingModal />)
    fireExitIntent()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(mockPushToDataLayer).toHaveBeenCalledWith({
      event: 'exit_intent_modal_dismissed',
    })
  })

  it('closes via the No thanks button', () => {
    render(<ExitIntentBookingModal />)
    fireExitIntent()

    fireEvent.click(screen.getByRole('button', { name: /no thanks/i }))

    expect(mockPushToDataLayer).toHaveBeenCalledWith({
      event: 'exit_intent_modal_dismissed',
    })
  })

  it('tracks cta clicked when Book a table is selected', () => {
    render(<ExitIntentBookingModal />)
    fireExitIntent()

    const link = screen.getByRole('link', { name: /book a table/i })
    link.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(link)

    expect(mockPushToDataLayer).toHaveBeenCalledWith({
      event: 'exit_intent_modal_cta_clicked',
    })
  })
})
