import { render, screen } from '@testing-library/react'
import { RegretReduction } from '../RegretReduction'

describe('RegretReduction', () => {
  it('renders booking variant reassurances', () => {
    render(<RegretReduction variant="booking" />)
    expect(screen.getByText(/Free to cancel/i)).toBeInTheDocument()
    expect(screen.getByText(/Free parking on site/i)).toBeInTheDocument()
    expect(screen.getByText(/Confirmation in seconds/i)).toBeInTheDocument()
  })

  // Book a Table. "Free to cancel" is false for a group deposit cancelled inside
  // seven days, so the table variant says what is true instead.
  it('renders table variant reassurances without "Free to cancel"', () => {
    render(<RegretReduction variant="table" />)
    expect(screen.getByText('No deposit for tables of 14 or fewer')).toBeInTheDocument()
    expect(screen.queryByText(/Free to cancel/i)).not.toBeInTheDocument()
    expect(screen.getByText(/Free parking on site/i)).toBeInTheDocument()
  })

  it('renders enquiry variant reassurances', () => {
    render(<RegretReduction variant="enquiry" />)
    expect(screen.getByText(/No commitment/i)).toBeInTheDocument()
    expect(screen.getByText(/just a conversation/i)).toBeInTheDocument()
    expect(screen.getByText(/as soon as we can/i)).toBeInTheDocument()
    // No reply time is on record, so none is promised (site review finding C1-039).
    expect(screen.queryByText(/24 hours/i)).not.toBeInTheDocument()
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
