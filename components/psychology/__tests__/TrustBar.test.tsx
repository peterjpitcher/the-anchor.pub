import { render, screen } from '@testing-library/react'
import { TrustBar } from '../TrustBar'

describe('TrustBar', () => {
  it('renders all three default trust signals', () => {
    render(<TrustBar />)
    expect(screen.getByText(/BII Sustainability Champion/i)).toBeInTheDocument()
    expect(screen.getByText(/Free parking for 20 cars/i)).toBeInTheDocument()
    expect(screen.getByText(/7 min from Heathrow/i)).toBeInTheDocument()
  })

  it('renders events variant signals', () => {
    render(<TrustBar variant="events" />)
    expect(screen.getByText(/Hosted by Nikki Manfadge/i)).toBeInTheDocument()
    expect(screen.getByText(/Free parking/i)).toBeInTheDocument()
    expect(screen.getByText(/Bar open all night/i)).toBeInTheDocument()
  })

  // Capacity was reconciled site-wide to the management DB `venue_spaces` figures
  // in c398ef04 ("up to 200 guests" was never a real capacity). Assert the SSOT
  // wording so the test fails if the copy drifts away from the source of truth.
  it('renders private-hire variant signals', () => {
    render(<TrustBar variant="private-hire" />)
    expect(screen.getByText(/Space for 10\+ to 150 guests/i)).toBeInTheDocument()
    expect(screen.getByText(/BII Sustainability Champion/i)).toBeInTheDocument()
    expect(screen.getByText(/Free parking for all guests/i)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<TrustBar className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
