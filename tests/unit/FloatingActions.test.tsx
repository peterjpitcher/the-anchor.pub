import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { FloatingActions } from '@/components/layout/FloatingActions'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))

jest.mock('@/lib/gtm-events', () => ({
  trackDirectionsClick: jest.fn(),
  trackPhoneCallClick: jest.fn(),
  trackTableBookingClick: jest.fn(),
  trackWhatsAppClick: jest.fn()
}))

describe('FloatingActions', () => {
  const mockUsePathname = usePathname as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('hides the global floating actions on mobile event detail pages', () => {
    mockUsePathname.mockReturnValue('/events/pub-quiz-night-2026-05-06')

    render(<FloatingActions />)

    expect(screen.getByTestId('floating-actions')).toHaveClass('hidden', 'lg:block')
  })

  it('keeps the global floating actions visible on non-event pages', () => {
    mockUsePathname.mockReturnValue('/whats-on')

    render(<FloatingActions />)

    expect(screen.getByTestId('floating-actions')).not.toHaveClass('hidden')
    expect(screen.getByRole('button', { name: 'Contact options' })).toBeInTheDocument()
  })
})
