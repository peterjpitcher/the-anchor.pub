import { render, screen } from '@testing-library/react'
import { RegretReduction } from '../RegretReduction'

describe('RegretReduction', () => {
  it('renders booking variant reassurances', () => {
    render(<RegretReduction variant="booking" />)
    expect(screen.getByText(/Free to cancel/i)).toBeInTheDocument()
    expect(screen.getByText(/Card only required for Sunday lunch/i)).toBeInTheDocument()
    expect(screen.getByText(/Confirmation in seconds/i)).toBeInTheDocument()
  })

  it('renders enquiry variant reassurances', () => {
    render(<RegretReduction variant="enquiry" />)
    expect(screen.getByText(/No commitment/i)).toBeInTheDocument()
    expect(screen.getByText(/just a conversation/i)).toBeInTheDocument()
    expect(screen.getByText(/24 hours/i)).toBeInTheDocument()
  })

  it('renders booking variant by default', () => {
    render(<RegretReduction />)
    expect(screen.getByText(/Free to cancel/i)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<RegretReduction className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
