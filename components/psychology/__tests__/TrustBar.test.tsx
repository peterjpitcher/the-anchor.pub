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

  it('renders private-hire variant signals', () => {
    render(<TrustBar variant="private-hire" />)
    expect(screen.getByText(/up to 200 guests/i)).toBeInTheDocument()
    expect(screen.getByText(/BII Sustainability Champion/i)).toBeInTheDocument()
    expect(screen.getByText(/Free parking for all guests/i)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<TrustBar className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
