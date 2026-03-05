import { render, screen } from '@testing-library/react'
import { PsychBadge } from '../PsychBadge'

describe('PsychBadge', () => {
  it('renders free variant with default label', () => {
    render(<PsychBadge variant="free" />)
    expect(screen.getByText('Free entry')).toBeInTheDocument()
  })

  it('renders authority variant with custom label', () => {
    render(<PsychBadge variant="authority" label="BII Award Winner" />)
    expect(screen.getByText('BII Award Winner')).toBeInTheDocument()
  })

  it('renders price variant with custom label', () => {
    render(<PsychBadge variant="price" label="£3 per person" />)
    expect(screen.getByText('£3 per person')).toBeInTheDocument()
  })

  it('renders prize variant with custom label', () => {
    render(<PsychBadge variant="prize" label="Cash prizes" />)
    expect(screen.getByText('Cash prizes')).toBeInTheDocument()
  })

  it('uses default label when none provided for each variant', () => {
    const { rerender } = render(<PsychBadge variant="free" />)
    expect(screen.getByText('Free entry')).toBeInTheDocument()

    rerender(<PsychBadge variant="authority" />)
    expect(screen.getByText('Award winning')).toBeInTheDocument()

    rerender(<PsychBadge variant="price" />)
    expect(screen.getByText('Great value')).toBeInTheDocument()

    rerender(<PsychBadge variant="prize" />)
    expect(screen.getByText('Prizes every round')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<PsychBadge variant="free" className="custom-class" />)
    expect(screen.getByText('Free entry').closest('span')).toHaveClass('custom-class')
  })
})
